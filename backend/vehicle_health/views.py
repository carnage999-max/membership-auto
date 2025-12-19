from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import (
    VehicleHealth,
    HealthAlert,
    DiagnosticTroubleCode,
    MaintenanceRecommendation,
)
from .serializers import (
    VehicleHealthSerializer,
    HealthAlertSerializer,
    DiagnosticTroubleCodeSerializer,
    MaintenanceRecommendationSerializer,
)
from vehicles.models import Vehicle


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def vehicle_health_list(request):
    """
    GET: List health status for all user's vehicles
    POST: Create/update health status for a vehicle
    """
    if request.method == "GET":
        user_vehicles = Vehicle.objects.filter(user=request.user)
        health_statuses = VehicleHealth.objects.filter(vehicle__in=user_vehicles)
        serializer = VehicleHealthSerializer(health_statuses, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        vehicle_id = request.data.get("vehicle")
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Get or create health record
        health, created = VehicleHealth.objects.get_or_create(vehicle=vehicle)

        serializer = VehicleHealthSerializer(health, data=request.data, partial=True)
        if serializer.is_valid():
            health = serializer.save()
            health.calculate_overall_score()
            health.save()
            return Response(
                VehicleHealthSerializer(health).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def vehicle_health_detail(request, vehicle_id):
    """Get health status for a specific vehicle"""
    try:
        vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
    except Vehicle.DoesNotExist:
        return Response(
            {"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # Get or create health record
    health, created = VehicleHealth.objects.get_or_create(vehicle=vehicle)

    serializer = VehicleHealthSerializer(health)
    return Response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def health_alerts(request):
    """
    GET: List health alerts for user's vehicles
    POST: Create a new health alert
    """
    if request.method == "GET":
        vehicle_id = request.query_params.get("vehicle_id")
        active_only = request.query_params.get("active_only", "false").lower() == "true"

        user_vehicles = Vehicle.objects.filter(user=request.user)
        alerts = HealthAlert.objects.filter(vehicle__in=user_vehicles)

        if vehicle_id:
            alerts = alerts.filter(vehicle_id=vehicle_id)

        if active_only:
            alerts = alerts.filter(resolved=False)

        serializer = HealthAlertSerializer(alerts, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        vehicle_id = request.data.get("vehicle")
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = HealthAlertSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def resolve_alert(request, pk):
    """Mark an alert as resolved"""
    try:
        alert = HealthAlert.objects.get(pk=pk, vehicle__user=request.user)
    except HealthAlert.DoesNotExist:
        return Response({"error": "Alert not found"}, status=status.HTTP_404_NOT_FOUND)

    alert.resolved = True
    alert.resolved_at = timezone.now()
    alert.save()

    serializer = HealthAlertSerializer(alert)
    return Response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def dtc_codes(request):
    """
    GET: List DTC codes for user's vehicles
    POST: Create a new DTC code
    """
    if request.method == "GET":
        vehicle_id = request.query_params.get("vehicle_id")
        active_only = request.query_params.get("active_only", "false").lower() == "true"

        user_vehicles = Vehicle.objects.filter(user=request.user)
        codes = DiagnosticTroubleCode.objects.filter(vehicle__in=user_vehicles)

        if vehicle_id:
            codes = codes.filter(vehicle_id=vehicle_id)

        if active_only:
            codes = codes.filter(active=True)

        serializer = DiagnosticTroubleCodeSerializer(codes, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        vehicle_id = request.data.get("vehicle")
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = DiagnosticTroubleCodeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def clear_dtc(request, pk):
    """Clear/deactivate a DTC code"""
    try:
        code = DiagnosticTroubleCode.objects.get(pk=pk, vehicle__user=request.user)
    except DiagnosticTroubleCode.DoesNotExist:
        return Response(
            {"error": "DTC code not found"}, status=status.HTTP_404_NOT_FOUND
        )

    code.active = False
    code.cleared_at = timezone.now()
    code.save()

    serializer = DiagnosticTroubleCodeSerializer(code)
    return Response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def maintenance_recommendations(request):
    """
    GET: List maintenance recommendations for user's vehicles
    POST: Create a new recommendation
    """
    if request.method == "GET":
        vehicle_id = request.query_params.get("vehicle_id")

        user_vehicles = Vehicle.objects.filter(user=request.user)
        recommendations = MaintenanceRecommendation.objects.filter(
            vehicle__in=user_vehicles, completed=False, dismissed=False
        )

        if vehicle_id:
            recommendations = recommendations.filter(vehicle_id=vehicle_id)

        serializer = MaintenanceRecommendationSerializer(recommendations, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        vehicle_id = request.data.get("vehicle")
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = MaintenanceRecommendationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
