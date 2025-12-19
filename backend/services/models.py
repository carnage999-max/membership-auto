from django.db import models
from vehicles.models import Vehicle


class ServiceType(models.Model):
    """Defines types of services (oil change, tire rotation, etc.)"""

    name = models.CharField(max_length=100)
    description = models.TextField()
    estimated_duration = models.CharField(max_length=50)  # e.g., "30-45 minutes"
    jobs = models.JSONField(default=list)  # List of job items included
    priority = models.CharField(
        max_length=20,
        choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")],
        default="medium",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ServiceSchedule(models.Model):
    """Tracks service schedules for vehicles"""

    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name="service_schedules"
    )
    service_type = models.ForeignKey(ServiceType, on_delete=models.CASCADE)

    # Trigger conditions
    mileage_trigger = models.IntegerField(
        null=True, blank=True
    )  # Service due at this mileage
    time_trigger_months = models.IntegerField(
        null=True, blank=True
    )  # Service due every X months

    # Tracking
    last_completed_date = models.DateField(null=True, blank=True)
    last_completed_mileage = models.IntegerField(null=True, blank=True)
    next_due_mileage = models.IntegerField(null=True, blank=True)
    next_due_date = models.DateField(null=True, blank=True)

    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ("upcoming", "Upcoming"),
            ("due_soon", "Due Soon"),
            ("overdue", "Overdue"),
            ("completed", "Completed"),
        ],
        default="upcoming",
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-next_due_date"]

    def __str__(self):
        return f"{self.vehicle} - {self.service_type.name}"
