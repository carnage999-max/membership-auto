from rest_framework import serializers
from .models import Vehicle, TelematicsSnapshot, FuelLog


class VehicleSerializer(serializers.ModelSerializer):
    dongleId = serializers.CharField(
        source="dongle_id", read_only=True, allow_null=True
    )
    dongleConnectionType = serializers.CharField(
        source="dongle_connection_type", read_only=True, allow_null=True
    )
    licensePlate = serializers.CharField(
        source="license_plate", allow_blank=True, allow_null=True, required=False
    )
    fuelType = serializers.CharField(
        source="fuel_type", allow_blank=True, allow_null=True, required=False
    )
    photoUrl = serializers.CharField(
        source="photo_url", allow_blank=True, allow_null=True, required=False
    )
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "user",
            "vin",
            "make",
            "model",
            "trim",
            "year",
            "licensePlate",
            "odometer",
            "dongleId",
            "dongleConnectionType",
            "fuelType",
            "photoUrl",
            "createdAt",
        ]
        read_only_fields = [
            "id",
            "user",
            "createdAt",
            "dongleId",
            "dongleConnectionType",
        ]


class TelemetryBatchSerializer(serializers.Serializer):
    vehicleId = serializers.UUIDField()
    startTimestamp = serializers.IntegerField()
    endTimestamp = serializers.IntegerField()
    samples = serializers.ListField(
        child=serializers.DictField(),
        required=False,
    )


class TelematicsSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelematicsSnapshot
        fields = [
            "id",
            "vehicle",
            "timestamp",
            "odometer",
            "fuel_used",
            "speed_avg",
            "dtc",
            "raw",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class FuelLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelLog
        fields = [
            "id",
            "vehicle",
            "timestamp",
            "odometer",
            "gallons",
            "price",
            "mpg",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
