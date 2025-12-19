from django.db import models
from vehicles.models import Vehicle
from django.utils import timezone


class VehicleHealth(models.Model):
    """Overall health status for a vehicle"""

    vehicle = models.OneToOneField(
        Vehicle, on_delete=models.CASCADE, related_name="health_status"
    )

    # Overall health score (0-100)
    overall_score = models.IntegerField(
        default=100, help_text="Overall health score 0-100"
    )
    overall_status = models.CharField(
        max_length=20,
        choices=[
            ("excellent", "Excellent"),
            ("good", "Good"),
            ("fair", "Fair"),
            ("poor", "Poor"),
            ("critical", "Critical"),
        ],
        default="good",
    )

    # System health scores (0-100 each)
    engine_score = models.IntegerField(default=100)
    transmission_score = models.IntegerField(default=100)
    brakes_score = models.IntegerField(default=100)
    tires_score = models.IntegerField(default=100)
    battery_score = models.IntegerField(default=100)
    fluids_score = models.IntegerField(default=100)

    # Last diagnostic
    last_diagnostic_date = models.DateTimeField(null=True, blank=True)
    last_diagnostic_odometer = models.IntegerField(null=True, blank=True)

    # Diagnostics data (JSON)
    diagnostics = models.JSONField(default=dict, help_text="Detailed diagnostic data")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vehicle} - {self.overall_status}"

    def calculate_overall_score(self):
        """Calculate overall score based on system scores"""
        scores = [
            self.engine_score,
            self.transmission_score,
            self.brakes_score,
            self.tires_score,
            self.battery_score,
            self.fluids_score,
        ]
        self.overall_score = sum(scores) // len(scores)

        # Determine overall status
        if self.overall_score >= 90:
            self.overall_status = "excellent"
        elif self.overall_score >= 75:
            self.overall_status = "good"
        elif self.overall_score >= 60:
            self.overall_status = "fair"
        elif self.overall_score >= 40:
            self.overall_status = "poor"
        else:
            self.overall_status = "critical"

        return self.overall_score


class HealthAlert(models.Model):
    """Alerts for vehicle health issues"""

    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name="health_alerts"
    )

    system = models.CharField(
        max_length=50,
        choices=[
            ("engine", "Engine"),
            ("transmission", "Transmission"),
            ("brakes", "Brakes"),
            ("tires", "Tires"),
            ("battery", "Battery"),
            ("fluids", "Fluids"),
            ("general", "General"),
        ],
    )

    severity = models.CharField(
        max_length=20,
        choices=[("info", "Info"), ("warning", "Warning"), ("critical", "Critical")],
        default="warning",
    )

    title = models.CharField(max_length=200)
    message = models.TextField()

    # Status
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["vehicle", "-created_at"]),
            models.Index(fields=["resolved"]),
        ]

    def __str__(self):
        return f"{self.vehicle} - {self.system} - {self.severity}"


class DiagnosticTroubleCode(models.Model):
    """DTC codes from vehicle diagnostics"""

    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name="dtc_codes"
    )

    code = models.CharField(max_length=10, help_text="e.g., P0301")
    description = models.TextField()
    system = models.CharField(max_length=50, blank=True, help_text="Affected system")

    # Status
    active = models.BooleanField(default=True)
    detected_at = models.DateTimeField(default=timezone.now)
    cleared_at = models.DateTimeField(null=True, blank=True)

    # Additional info
    freeze_frame_data = models.JSONField(
        default=dict, blank=True, help_text="Freeze frame data when code was set"
    )
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-detected_at"]
        indexes = [
            models.Index(fields=["vehicle", "-detected_at"]),
            models.Index(fields=["active"]),
        ]

    def __str__(self):
        return f"{self.vehicle} - {self.code}"


class MaintenanceRecommendation(models.Model):
    """AI-generated maintenance recommendations"""

    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name="maintenance_recommendations"
    )

    category = models.CharField(
        max_length=50,
        choices=[
            ("immediate", "Immediate Attention"),
            ("soon", "Address Soon"),
            ("routine", "Routine Maintenance"),
            ("preventive", "Preventive Care"),
        ],
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    estimated_cost = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )

    # Status
    completed = models.BooleanField(default=False)
    dismissed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.vehicle} - {self.category} - {self.title}"
