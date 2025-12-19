from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import date, timedelta
from .models import ServiceType, ServiceSchedule
from .serializers import ServiceTypeSerializer, ServiceScheduleSerializer
from vehicles.models import Vehicle


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def service_types(request):
    """Get all available service types"""
    types = ServiceType.objects.all()
    serializer = ServiceTypeSerializer(types, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def service_schedules(request):
    """
    GET: List all service schedules for user's vehicles
    Note: Service schedules are auto-created when vehicles are added.
    Only admins can manually create/modify schedules.
    """
    vehicle_id = request.query_params.get("vehicle_id")
    status_filter = request.query_params.get("status")

    # Get user's vehicles
    user_vehicles = Vehicle.objects.filter(user=request.user)
    schedules = ServiceSchedule.objects.filter(vehicle__in=user_vehicles)

    if vehicle_id:
        schedules = schedules.filter(vehicle_id=vehicle_id)

    if status_filter:
        schedules = schedules.filter(status=status_filter)

    serializer = ServiceScheduleSerializer(schedules, many=True)
    return Response(serializer.data)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def service_schedule_detail(request, pk):
    """
    GET: Get a specific service schedule
    PATCH: Update a service schedule
    DELETE: Delete a service schedule
    """
    try:
        schedule = ServiceSchedule.objects.get(pk=pk, vehicle__user=request.user)
    except ServiceSchedule.DoesNotExist:
        return Response(
            {"error": "Service schedule not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        serializer = ServiceScheduleSerializer(schedule)
        return Response(serializer.data)

    elif request.method == "PATCH":
        serializer = ServiceScheduleSerializer(
            schedule, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_service(request, pk):
    """Mark a service as completed and calculate next due"""
    try:
        schedule = ServiceSchedule.objects.get(pk=pk, vehicle__user=request.user)
    except ServiceSchedule.DoesNotExist:
        return Response(
            {"error": "Service schedule not found"}, status=status.HTTP_404_NOT_FOUND
        )

    completed_date = request.data.get("completed_date", date.today())
    completed_mileage = request.data.get("completed_mileage")

    # Update completion info
    schedule.last_completed_date = completed_date
    if completed_mileage:
        schedule.last_completed_mileage = completed_mileage
        # Calculate next due mileage
        if schedule.mileage_trigger:
            schedule.next_due_mileage = completed_mileage + schedule.mileage_trigger

    # Calculate next due date
    if schedule.time_trigger_months:
        if isinstance(completed_date, str):
            completed_date = date.fromisoformat(completed_date)
        schedule.next_due_date = completed_date + timedelta(
            days=schedule.time_trigger_months * 30
        )

    # Update status
    schedule.status = "upcoming"
    schedule.save()

    serializer = ServiceScheduleSerializer(schedule)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommendations(request):
    """Get service recommendations based on vehicle mileage and time"""
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

    current_mileage = vehicle.mileage or 0
    schedules = ServiceSchedule.objects.filter(vehicle=vehicle)

    recommendations_list = []
    for schedule in schedules:
        # Check mileage
        if (
            schedule.next_due_mileage
            and current_mileage >= schedule.next_due_mileage - 500
        ):
            if current_mileage >= schedule.next_due_mileage:
                schedule.status = "overdue"
            else:
                schedule.status = "due_soon"
            schedule.save()
            recommendations_list.append(schedule)

        # Check date
        elif schedule.next_due_date:
            days_until_due = (schedule.next_due_date - date.today()).days
            if days_until_due < 0:
                schedule.status = "overdue"
                schedule.save()
                recommendations_list.append(schedule)
            elif days_until_due <= 30:
                schedule.status = "due_soon"
                schedule.save()
                recommendations_list.append(schedule)

    serializer = ServiceScheduleSerializer(recommendations_list, many=True)
    return Response(serializer.data)


def create_default_service_schedules(vehicle):
    """
    Auto-create standard service schedules for a newly added vehicle.
    Called automatically when a vehicle is created.

    Creates schedules based on standard maintenance intervals:
    - Oil Change: every 5,000 miles or 6 months
    - Tire Rotation: every 7,500 miles or 6 months
    - Air Filter: every 15,000 miles or 12 months
    - Cabin Filter: every 15,000 miles or 12 months
    - Brake Inspection: every 15,000 miles or 12 months
    """
    from datetime import date
    from dateutil.relativedelta import relativedelta

    # Get or create standard service types
    service_configs = [
        {
            "name": "Oil Change",
            "description": "Regular engine oil and filter change",
            "estimated_duration": "30-45 minutes",
            "jobs": [
                "Drain engine oil",
                "Replace oil filter",
                "Refill with fresh oil",
                "Check fluid levels",
            ],
            "priority": "high",
            "mileage_trigger": 5000,
            "time_trigger_months": 6,
        },
        {
            "name": "Tire Rotation",
            "description": "Rotate tires for even wear",
            "estimated_duration": "30 minutes",
            "jobs": [
                "Remove all wheels",
                "Rotate to appropriate positions",
                "Check tire pressure",
                "Inspect tread depth",
            ],
            "priority": "medium",
            "mileage_trigger": 7500,
            "time_trigger_months": 6,
        },
        {
            "name": "Air Filter Replacement",
            "description": "Replace engine air filter",
            "estimated_duration": "15-20 minutes",
            "jobs": [
                "Remove old air filter",
                "Clean filter housing",
                "Install new filter",
            ],
            "priority": "medium",
            "mileage_trigger": 15000,
            "time_trigger_months": 12,
        },
        {
            "name": "Cabin Filter Replacement",
            "description": "Replace cabin air filter",
            "estimated_duration": "15-20 minutes",
            "jobs": [
                "Remove old cabin filter",
                "Clean filter compartment",
                "Install new filter",
            ],
            "priority": "low",
            "mileage_trigger": 15000,
            "time_trigger_months": 12,
        },
        {
            "name": "Brake Inspection",
            "description": "Comprehensive brake system inspection",
            "estimated_duration": "45-60 minutes",
            "jobs": [
                "Inspect brake pads",
                "Check brake fluid level",
                "Inspect rotors",
                "Test brake performance",
            ],
            "priority": "high",
            "mileage_trigger": 15000,
            "time_trigger_months": 12,
        },
    ]

    current_mileage = vehicle.odometer or 0
    created_schedules = []

    for config in service_configs:
        # Get or create the service type
        service_type, created = ServiceType.objects.get_or_create(
            name=config["name"],
            defaults={
                "description": config["description"],
                "estimated_duration": config["estimated_duration"],
                "jobs": config["jobs"],
                "priority": config["priority"],
            },
        )

        # Calculate next due mileage and date
        next_due_mileage = current_mileage + config["mileage_trigger"]
        next_due_date = date.today() + relativedelta(
            months=config["time_trigger_months"]
        )

        # Create the service schedule
        schedule = ServiceSchedule.objects.create(
            vehicle=vehicle,
            service_type=service_type,
            mileage_trigger=config["mileage_trigger"],
            time_trigger_months=config["time_trigger_months"],
            next_due_mileage=next_due_mileage,
            next_due_date=next_due_date,
            status="upcoming",
        )
        created_schedules.append(schedule)

    return created_schedules
