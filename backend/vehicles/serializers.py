from rest_framework import serializers
from .models import Vehicle, TelematicsSnapshot, FuelLog
import logging

logger = logging.getLogger(__name__)


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
    image = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True, help_text="Base64 encoded image or multipart file")
    odometer = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    vin = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    make = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    model = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    trim = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    year = serializers.IntegerField(required=False, allow_null=True)
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
        image_data = validated_data.pop('image', None)
        vehicle = super().create(validated_data)

        if image_data:
            try:
                from files.s3_utils import upload_file_to_s3
                from pathlib import Path
                from django.core.files.base import ContentFile
                import base64
                
                # Handle base64 encoded image
                if isinstance(image_data, str):
                    if image_data.startswith('data:'):
                        # Extract base64 part from data URI
                        header, encoded = image_data.split(',', 1)
                        image_file = ContentFile(base64.b64decode(encoded), name=f"vehicle_{vehicle.id}.jpg")
                    else:
                        # Assume plain base64
                        image_file = ContentFile(base64.b64decode(image_data), name=f"vehicle_{vehicle.id}.jpg")
                else:
                    image_file = image_data
                
                filename = f"vehicles/{vehicle.id}.jpg"
                
                # Upload to S3
                s3_url = upload_file_to_s3(image_file, filename)
                if s3_url:
                    vehicle.photo_url = s3_url
                    vehicle.save()
            except ImportError as e:
                logger.error(f"Failed to import S3 utilities: {str(e)}")
            except Exception as e:
                logger.error(f"Failed to upload vehicle image: {str(e)}", exc_info=True)
                # Vehicle was created, just without the image

        return vehicle

    def update(self, instance, validated_data):
        image_data = validated_data.pop('image', None)
        vehicle = super().update(instance, validated_data)

        if image_data:
            try:
                from files.s3_utils import upload_file_to_s3
                from django.core.files.base import ContentFile
                import base64
                
                # Handle base64 encoded image
                if isinstance(image_data, str):
                    if image_data.startswith('data:'):
                        # Extract base64 part from data URI
                        header, encoded = image_data.split(',', 1)
                        image_file = ContentFile(base64.b64decode(encoded), name=f"vehicle_{vehicle.id}.jpg")
                    else:
                        # Assume plain base64
                        image_file = ContentFile(base64.b64decode(image_data), name=f"vehicle_{vehicle.id}.jpg")
                else:
                    image_file = image_data
                
                filename = f"vehicles/{vehicle.id}.jpg"
                
                # Upload to S3
                s3_url = upload_file_to_s3(image_file, filename)
                if s3_url:
                    vehicle.photo_url = s3_url
                    vehicle.save()
            except ImportError as e:
                logger.error(f"Failed to import S3 utilities: {str(e)}")
            except Exception as e:
                logger.error(f"Failed to upload vehicle image: {str(e)}", exc_info=True)
                # Vehicle was updated, just without the image

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
