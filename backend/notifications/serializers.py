from rest_framework import serializers
from .models import Device, NotificationLog


class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = [
            "id",
            "platform",
            "push_token",
            "device_name",
            "is_active",
            "created_at",
            "last_used_at",
        ]
        read_only_fields = ["id", "created_at", "last_used_at"]


class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = [
            "id",
            "notification_type",
            "title",
            "body",
            "data",
            "status",
            "sent_at",
            "delivered_at",
            "created_at",
        ]
        read_only_fields = ["id", "status", "sent_at", "delivered_at", "created_at"]
