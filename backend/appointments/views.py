from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment, Location
from .serializers import AppointmentSerializer, LocationSerializer
from vehicles.models import Vehicle


class AppointmentAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Check availability for a location / date"""
        location_id = request.query_params.get("locationId")
        vehicle_id = request.query_params.get("vehicleId")
        date_str = request.query_params.get("date")

        if not location_id or not date_str:
            return Response(
                {"error": "locationId and date are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            location = Location.objects.get(id=location_id)
        except Location.DoesNotExist:
            return Response(
                {"error": "Location not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get existing appointments for the date
        start_of_day = timezone.make_aware(datetime.combine(date, datetime.min.time()))
        end_of_day = start_of_day + timedelta(days=1)

        existing_appointments = Appointment.objects.filter(
            location=location,
            start_time__gte=start_of_day,
            start_time__lt=end_of_day,
            status__in=["scheduled", "in_progress"],
        )

        # Generate available time slots (every 30 minutes from 8 AM to 6 PM)
        available_slots = []
        current_time = start_of_day.replace(hour=8, minute=0)
        end_time = start_of_day.replace(hour=18, minute=0)

        while current_time < end_time:
            slot_end = current_time + timedelta(minutes=30)
            # Check if this slot conflicts with existing appointments
            conflict = existing_appointments.filter(
                start_time__lt=slot_end,
                end_time__gt=current_time,
            ).exists()

            if not conflict:
                available_slots.append(
                    {
                        "start": current_time.isoformat(),
                        "end": slot_end.isoformat(),
                    }
                )

            current_time += timedelta(minutes=30)

        return Response({"availableSlots": available_slots}, status=status.HTTP_200_OK)


class AppointmentBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Book an appointment"""
        vehicle_id = request.data.get("vehicleId")
        location_id = request.data.get("locationId")
        start_time_str = request.data.get("startTime")
        services = request.data.get("services", [])
        service_schedule_id = request.data.get("serviceScheduleId")

        if not vehicle_id or not location_id or not start_time_str:
            return Response(
                {"error": "vehicleId, locationId, and startTime are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "Vehicle not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            location = Location.objects.get(id=location_id)
        except Location.DoesNotExist:
            return Response(
                {"error": "Location not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            start_time = datetime.fromisoformat(start_time_str.replace("Z", "+00:00"))
            if start_time.tzinfo is None:
                start_time = timezone.make_aware(start_time)
        except (ValueError, AttributeError):
            return Response(
                {"error": "Invalid startTime format"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get service schedule if provided
        service_schedule = None
        if service_schedule_id:
            from services.models import ServiceSchedule

            try:
                service_schedule = ServiceSchedule.objects.get(
                    id=service_schedule_id, vehicle=vehicle
                )
                # If service schedule provided and no services specified, use schedule's services
                if not services and service_schedule.service_type:
                    services = service_schedule.service_type.jobs
            except ServiceSchedule.DoesNotExist:
                return Response(
                    {"error": "Service schedule not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

        # Estimate end time (default 1 hour, adjust based on services)
        estimated_duration = timedelta(hours=1)
        end_time = start_time + estimated_duration

        appointment = Appointment.objects.create(
            user=request.user,
            vehicle=vehicle,
            location=location,
            service_schedule=service_schedule,
            start_time=start_time,
            end_time=end_time,
            services=services,
            status="scheduled",
        )

        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AppointmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List user's appointments"""
        appointments = Appointment.objects.filter(user=request.user).order_by(
            "-start_time"
        )
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AppointmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, appointment_id):
        """Cancel an appointment"""
        try:
            appointment = Appointment.objects.get(id=appointment_id, user=request.user)

            # Check if appointment is already cancelled or completed
            if appointment.status == "cancelled":
                return Response(
                    {"error": "Appointment is already cancelled"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if appointment.status == "completed":
                return Response(
                    {"error": "Cannot cancel a completed appointment"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Cancel the appointment
            appointment.status = "cancelled"
            appointment.save()

            return Response(status=status.HTTP_204_NO_CONTENT)
        except Appointment.DoesNotExist:
            return Response(
                {"error": "Appointment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )


class LocationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all service locations"""
        locations = Location.objects.all().order_by("name")
        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LocationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, location_id):
        """Get a specific location"""
        try:
            location = Location.objects.get(id=location_id)
            serializer = LocationSerializer(location)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Location.DoesNotExist:
            return Response(
                {"error": "Location not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
