from rest_framework import serializers
from .models import ParkingSpot


class ParkingSpotSerializer(serializers.ModelSerializer):
    vehicle_info = serializers.SerializerMethodField()
    time_parked = serializers.SerializerMethodField()

    class Meta:
        model = ParkingSpot
        fields = [
            "id",
            "user",
            "vehicle",
            "vehicle_info",
            "latitude",
            "longitude",
            "address",
            "location_name",
            "photos",
            "notes",
            "parked_at",
            "timer_expires_at",
            "active",
            "time_parked",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "parked_at", "created_at", "updated_at"]

    def get_vehicle_info(self, obj):
        if obj.vehicle:
            return {
                "id": str(obj.vehicle.id),
                "year": obj.vehicle.year,
                "make": obj.vehicle.make,
                "model": obj.vehicle.model,
            }
        return None

    def get_time_parked(self, obj):
        """Return how long the vehicle has been parked (in minutes)"""
        from django.utils import timezone

        delta = timezone.now() - obj.parked_at
        return int(delta.total_seconds() / 60)
