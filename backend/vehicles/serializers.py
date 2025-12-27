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
        source="photo_url", read_only=True, allow_blank=True, allow_null=True, required=False
    )
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
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
            "image",
            "createdAt",
        ]
        read_only_fields = [
            "id",
            "user",
            "createdAt",
            "dongleId",
            "dongleConnectionType",
            "photoUrl",
        ]

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        vehicle = super().create(validated_data)

        if image:
            # Upload image to S3 and save URL
            from files.s3_utils import upload_file_to_s3

            # Generate a unique filename
            import uuid
            from pathlib import Path
            extension = Path(image.name).suffix
            filename = f"vehicles/{vehicle.id}{extension}"

            # Upload to S3
            s3_url = upload_file_to_s3(image, filename)
            vehicle.photo_url = s3_url
            vehicle.save()

        return vehicle

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        vehicle = super().update(instance, validated_data)

        if image:
            # Upload image to S3 and save URL
            from files.s3_utils import upload_file_to_s3

            # Generate a unique filename
            import uuid
            from pathlib import Path
            extension = Path(image.name).suffix
            filename = f"vehicles/{vehicle.id}{extension}"

            # Upload to S3
            s3_url = upload_file_to_s3(image, filename)
            vehicle.photo_url = s3_url
            vehicle.save()

        return vehicle


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
