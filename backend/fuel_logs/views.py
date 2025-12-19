from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Max, Min, Sum, Count
from decimal import Decimal
from .models import FuelLog
from .serializers import FuelLogSerializer, FuelStatisticsSerializer
from vehicles.models import Vehicle


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def fuel_logs(request):
    """
    GET: List all fuel logs for user's vehicles
    POST: Create a new fuel log entry
    """
    if request.method == "GET":
        vehicle_id = request.query_params.get("vehicle_id")

        # Get user's vehicles
        user_vehicles = Vehicle.objects.filter(user=request.user)
        logs = FuelLog.objects.filter(vehicle__in=user_vehicles)

        if vehicle_id:
            logs = logs.filter(vehicle_id=vehicle_id)

        serializer = FuelLogSerializer(logs, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        # Verify vehicle belongs to user
        vehicle_id = request.data.get("vehicle")
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "Vehicle not found or does not belong to you"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = FuelLogSerializer(data=request.data)
        if serializer.is_valid():
            fuel_log = serializer.save()
            return Response(
                FuelLogSerializer(fuel_log).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def fuel_log_detail(request, pk):
    """
    GET: Get a specific fuel log
    PATCH: Update a fuel log
    DELETE: Delete a fuel log
    """
    try:
        fuel_log = FuelLog.objects.get(pk=pk, vehicle__user=request.user)
    except FuelLog.DoesNotExist:
        return Response(
            {"error": "Fuel log not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        serializer = FuelLogSerializer(fuel_log)
        return Response(serializer.data)

    elif request.method == "PATCH":
        serializer = FuelLogSerializer(fuel_log, data=request.data, partial=True)
        if serializer.is_valid():
            updated_log = serializer.save()
            # Recalculate MPG for subsequent logs
            recalculate_subsequent_mpg(updated_log)
            return Response(FuelLogSerializer(updated_log).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        vehicle = fuel_log.vehicle
        fuel_log.delete()
        # Recalculate MPG for subsequent logs
        recalculate_vehicle_mpg(vehicle)
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def fuel_statistics(request):
    """Get fuel economy statistics for a vehicle"""
    vehicle_id = request.query_params.get("vehicle_id")

    if not vehicle_id:
        return Response(
            {"error": "vehicle_id is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
    except Vehicle.DoesNotExist:
        return Response(
            {"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # Get logs with calculated MPG (full tank fill-ups only)
    logs_with_mpg = FuelLog.objects.filter(
        vehicle=vehicle, is_full_tank=True, mpg__isnull=False
    )

    if not logs_with_mpg.exists():
        return Response(
            {
                "average_mpg": 0,
                "best_mpg": 0,
                "worst_mpg": 0,
                "average_cost_per_gallon": 0,
                "average_cost_per_mile": 0,
                "total_gallons": 0,
                "total_cost": 0,
                "total_miles": 0,
                "fill_up_count": 0,
            }
        )

    # Calculate statistics
    all_logs = FuelLog.objects.filter(vehicle=vehicle)

    stats = logs_with_mpg.aggregate(
        average_mpg=Avg("mpg"),
        best_mpg=Max("mpg"),
        worst_mpg=Min("mpg"),
    )

    all_stats = all_logs.aggregate(
        average_cost_per_gallon=Avg("price_per_gallon"),
        total_gallons=Sum("gallons"),
        total_cost=Sum("cost"),
        fill_up_count=Count("id"),
    )

    total_miles = logs_with_mpg.aggregate(total=Sum("miles_driven"))["total"] or 0

    # Calculate average cost per mile
    avg_cost_per_mile = Decimal(0)
    if total_miles > 0:
        avg_cost_per_mile = all_stats["total_cost"] / Decimal(total_miles)

    statistics = {
        "average_mpg": round(stats["average_mpg"] or 0, 2),
        "best_mpg": round(stats["best_mpg"] or 0, 2),
        "worst_mpg": round(stats["worst_mpg"] or 0, 2),
        "average_cost_per_gallon": round(all_stats["average_cost_per_gallon"] or 0, 3),
        "average_cost_per_mile": round(avg_cost_per_mile, 3),
        "total_gallons": round(all_stats["total_gallons"] or 0, 3),
        "total_cost": round(all_stats["total_cost"] or 0, 2),
        "total_miles": int(total_miles),
        "fill_up_count": all_stats["fill_up_count"],
    }

    serializer = FuelStatisticsSerializer(statistics)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def fuel_chart_data(request):
    """Get fuel data formatted for charting"""
    vehicle_id = request.query_params.get("vehicle_id")

    if not vehicle_id:
        return Response(
            {"error": "vehicle_id is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
    except Vehicle.DoesNotExist:
        return Response(
            {"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # Get logs with MPG data
    logs = FuelLog.objects.filter(
        vehicle=vehicle, is_full_tank=True, mpg__isnull=False
    ).order_by("date")

    chart_data = {
        "mpg": [],
        "cost_per_gallon": [],
        "dates": [],
    }

    for log in logs:
        chart_data["dates"].append(log.date.isoformat())
        chart_data["mpg"].append(float(log.mpg) if log.mpg else 0)
        chart_data["cost_per_gallon"].append(float(log.price_per_gallon))

    return Response(chart_data)


def recalculate_subsequent_mpg(fuel_log):
    """Recalculate MPG for logs after the updated one"""
    subsequent_logs = FuelLog.objects.filter(
        vehicle=fuel_log.vehicle, odometer__gt=fuel_log.odometer, is_full_tank=True
    ).order_by("odometer")

    for log in subsequent_logs:
        log.calculate_mpg()
        log.save()


def recalculate_vehicle_mpg(vehicle):
    """Recalculate MPG for all logs of a vehicle"""
    logs = FuelLog.objects.filter(vehicle=vehicle, is_full_tank=True).order_by(
        "odometer"
    )

    for log in logs:
        log.calculate_mpg()
        log.save()
