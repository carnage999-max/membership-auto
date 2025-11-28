from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from datetime import datetime
from .models import Vehicle, TelematicsSnapshot
from .serializers import VehicleSerializer, TelemetryBatchSerializer, TelematicsSnapshotSerializer


class VehicleListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List user's vehicles"""
        vehicles = Vehicle.objects.filter(user=request.user)
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Add a new vehicle"""
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        start_timestamp = timezone.make_aware(datetime.fromtimestamp(data["startTimestamp"] / 1000))
        end_timestamp = timezone.make_aware(datetime.fromtimestamp(data["endTimestamp"] / 1000))

        # Process samples if provided
        samples = data.get("samples", [])
        snapshots = []
        for sample in samples:
            sample_timestamp = sample.get("t", data["startTimestamp"])
            timestamp = timezone.make_aware(datetime.fromtimestamp(sample_timestamp / 1000))
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
