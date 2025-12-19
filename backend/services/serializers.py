from rest_framework import serializers
from .models import ServiceType, ServiceSchedule


class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = [
            "id",
            "name",
            "description",
            "estimated_duration",
            "jobs",
            "priority",
            "created_at",
        ]


class ServiceScheduleSerializer(serializers.ModelSerializer):
    service_type = ServiceTypeSerializer(read_only=True)
    service_type_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceType.objects.all(), source="service_type", write_only=True
    )
    vehicle_year = serializers.CharField(source="vehicle.year", read_only=True)
    vehicle_make = serializers.CharField(source="vehicle.make", read_only=True)
    vehicle_model = serializers.CharField(source="vehicle.model", read_only=True)

    class Meta:
        model = ServiceSchedule
        fields = [
            "id",
            "vehicle",
            "service_type",
            "service_type_id",
            "vehicle_year",
            "vehicle_make",
            "vehicle_model",
            "mileage_trigger",
            "time_trigger_months",
            "last_completed_date",
            "last_completed_mileage",
            "next_due_mileage",
            "next_due_date",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
