from rest_framework import serializers
from .models import (
    VehicleHealth,
    HealthAlert,
    DiagnosticTroubleCode,
    MaintenanceRecommendation,
)


class VehicleHealthSerializer(serializers.ModelSerializer):
    vehicle_info = serializers.SerializerMethodField()

    class Meta:
        model = VehicleHealth
        fields = [
            "id",
            "vehicle",
            "vehicle_info",
            "overall_score",
            "overall_status",
            "engine_score",
            "transmission_score",
            "brakes_score",
            "tires_score",
            "battery_score",
            "fluids_score",
            "last_diagnostic_date",
            "last_diagnostic_odometer",
            "diagnostics",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "overall_score",
            "overall_status",
            "created_at",
            "updated_at",
        ]

    def get_vehicle_info(self, obj):
        return {
            "id": str(obj.vehicle.id),
            "year": obj.vehicle.year,
            "make": obj.vehicle.make,
            "model": obj.vehicle.model,
        }


class HealthAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthAlert
        fields = [
            "id",
            "vehicle",
            "system",
            "severity",
            "title",
            "message",
            "resolved",
            "resolved_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class DiagnosticTroubleCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiagnosticTroubleCode
        fields = [
            "id",
            "vehicle",
            "code",
            "description",
            "system",
            "active",
            "detected_at",
            "cleared_at",
            "freeze_frame_data",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class MaintenanceRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRecommendation
        fields = [
            "id",
            "vehicle",
            "category",
            "title",
            "description",
            "estimated_cost",
            "completed",
            "dismissed",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
