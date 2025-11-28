from rest_framework import serializers
from .models import Appointment, Location
from vehicles.serializers import VehicleSerializer


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "name", "address", "lat", "lng", "phone", "hours", "created_at"]


class AppointmentSerializer(serializers.ModelSerializer):
    vehicle = VehicleSerializer(read_only=True)
    location = LocationSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "user",
            "vehicle",
            "location",
            "start_time",
            "end_time",
            "services",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "user", "created_at"]

