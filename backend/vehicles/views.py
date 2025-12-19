from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from datetime import datetime
from .models import Vehicle, TelematicsSnapshot, FuelLog
from .serializers import (
    VehicleSerializer,
    TelemetryBatchSerializer,
    TelematicsSnapshotSerializer,
)


class VehicleListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List user's vehicles"""
        vehicles = Vehicle.objects.filter(user=request.user)
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Add a new vehicle and auto-create service schedules"""
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            vehicle = serializer.save(user=request.user)

            # Auto-create standard service schedules for this vehicle
            from services.views import create_default_service_schedules

            create_default_service_schedules(vehicle)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VehicleDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        """Get a specific vehicle"""
        try:
            vehicle = Vehicle.objects.get(id=id, user=request.user)
            serializer = VehicleSerializer(vehicle)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "Vehicle not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    def put(self, request, id):
        """Update a vehicle"""
        try:
            vehicle = Vehicle.objects.get(id=id, user=request.user)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "Vehicle not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = VehicleSerializer(vehicle, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        """Delete a vehicle"""
        try:
            vehicle = Vehicle.objects.get(id=id, user=request.user)
            vehicle.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "Vehicle not found"},
                status=status.HTTP_404_NOT_FOUND,
            )


class VehicleLinkDongleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        """Link a dongle to a vehicle"""
        try:
            vehicle = Vehicle.objects.get(id=id, user=request.user)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "Vehicle not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        dongle_id = request.data.get("dongleId")
        connection_type = request.data.get("connectionType")

        if not dongle_id or not connection_type:
            return Response(
                {"error": "dongleId and connectionType are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if connection_type not in ["BLE", "WIFI", "CLOUD"]:
            return Response(
                {"error": "connectionType must be BLE, WIFI, or CLOUD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        vehicle.dongle_id = dongle_id
        vehicle.dongle_connection_type = connection_type
        vehicle.save()

        serializer = VehicleSerializer(vehicle)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TelematicsUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, vehicleId):
        """Upload telemetry batch"""
        try:
            vehicle = Vehicle.objects.get(id=vehicleId, user=request.user)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "Vehicle not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = TelemetryBatchSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        start_timestamp = timezone.make_aware(
            datetime.fromtimestamp(data["startTimestamp"] / 1000)
        )
        end_timestamp = timezone.make_aware(
            datetime.fromtimestamp(data["endTimestamp"] / 1000)
        )

        # Process samples if provided
        samples = data.get("samples", [])
        snapshots = []
        for sample in samples:
            sample_timestamp = sample.get("t", data["startTimestamp"])
            timestamp = timezone.make_aware(
                datetime.fromtimestamp(sample_timestamp / 1000)
            )
            snapshot = TelematicsSnapshot(
                vehicle=vehicle,
                timestamp=timestamp,
                odometer=sample.get("odometer"),
                fuel_used=sample.get("fuelRate"),  # Assuming fuelRate is fuel used
                speed_avg=sample.get("speed"),
                raw=sample,
            )
            snapshots.append(snapshot)

        if snapshots:
            TelematicsSnapshot.objects.bulk_create(snapshots)

        # Also create a summary snapshot
        # Convert UUIDs to strings for JSON serialization
        batch_data = {
            "vehicleId": str(data["vehicleId"]),
            "startTimestamp": data["startTimestamp"],
            "endTimestamp": data["endTimestamp"],
        }
        TelematicsSnapshot.objects.create(
            vehicle=vehicle,
            timestamp=end_timestamp,
            raw=batch_data,
        )

        return Response(
            {"message": "Telemetry batch accepted"},
            status=status.HTTP_202_ACCEPTED,
        )


class FuelLogListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List fuel logs for user's vehicles"""
        vehicle_id = request.query_params.get("vehicle_id")

        user_vehicles = Vehicle.objects.filter(user=request.user)

        if vehicle_id:
            fuel_logs = FuelLog.objects.filter(
                vehicle__id=vehicle_id, vehicle__in=user_vehicles
            )
        else:
            fuel_logs = FuelLog.objects.filter(vehicle__in=user_vehicles)

        from .serializers import FuelLogSerializer

        serializer = FuelLogSerializer(fuel_logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new fuel log entry"""
        vehicle_id = request.data.get("vehicle")

        # Verify vehicle belongs to user
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
        except Vehicle.DoesNotExist:
            return Response(
                {"error": "Vehicle not found or does not belong to you"},
                status=status.HTTP_404_NOT_FOUND,
            )

        from .serializers import FuelLogSerializer

        serializer = FuelLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FuelLogDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Get a specific fuel log"""
        try:
            fuel_log = FuelLog.objects.get(pk=pk, vehicle__user=request.user)
        except FuelLog.DoesNotExist:
            return Response(
                {"error": "Fuel log not found"}, status=status.HTTP_404_NOT_FOUND
            )

        from .serializers import FuelLogSerializer

        serializer = FuelLogSerializer(fuel_log)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        """Update a fuel log"""
        try:
            fuel_log = FuelLog.objects.get(pk=pk, vehicle__user=request.user)
        except FuelLog.DoesNotExist:
            return Response(
                {"error": "Fuel log not found"}, status=status.HTTP_404_NOT_FOUND
            )

        from .serializers import FuelLogSerializer

        serializer = FuelLogSerializer(fuel_log, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete a fuel log"""
        try:
            fuel_log = FuelLog.objects.get(pk=pk, vehicle__user=request.user)
        except FuelLog.DoesNotExist:
            return Response(
                {"error": "Fuel log not found"}, status=status.HTTP_404_NOT_FOUND
            )

        fuel_log.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
