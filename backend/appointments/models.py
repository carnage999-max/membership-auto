import uuid
from django.db import models
from django.utils import timezone
from users.models import User
from vehicles.models import Vehicle


class Location(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField()
    address = models.TextField(blank=True, null=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    phone = models.TextField(blank=True, null=True)
    hours = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "locations"

    def __str__(self):
        return self.name


class Appointment(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="appointments")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="appointments", null=True, blank=True)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    services = models.JSONField(default=list, blank=True)
    status = models.TextField(choices=STATUS_CHOICES, default="scheduled")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "appointments"

    def __str__(self):
        return f"Appointment for {self.user.email} at {self.start_time}"
