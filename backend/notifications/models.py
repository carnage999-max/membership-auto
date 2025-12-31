from django.db import models
from users.models import User
import uuid


class Device(models.Model):
    """Store user device tokens for push notifications"""

    PLATFORM_CHOICES = [
        ("ios", "iOS"),
        ("android", "Android"),
        ("web", "Web"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="devices")
    platform = models.CharField(max_length=10, choices=PLATFORM_CHOICES)
    push_token = models.TextField(
        help_text="Expo push token or FCM token for the device"
    )
    device_name = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_used_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "devices"
        unique_together = ["user", "push_token"]
        ordering = ["-last_used_at"]

    def __str__(self):
        return f"{self.user.email} - {self.platform} - {self.push_token[:20]}..."


class NotificationLog(models.Model):
    """Track sent notifications for debugging and analytics"""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("failed", "Failed"),
        ("delivered", "Delivered"),
    ]

    TYPE_CHOICES = [
        ("appointment_reminder", "Appointment Reminder"),
        ("service_due", "Service Due"),
        ("parking_reminder", "Parking Reminder"),
        ("offer", "Special Offer"),
        ("membership_update", "Membership Update"),
        ("chat", "Chat Message"),
        ("general", "General"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    device = models.ForeignKey(
        Device, on_delete=models.SET_NULL, null=True, blank=True
    )
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    body = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    error_message = models.TextField(blank=True, null=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notification_logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["notification_type"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.notification_type} - {self.user.email} - {self.status}"
