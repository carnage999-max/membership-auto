import uuid
from django.db import models
from django.utils import timezone
from users.models import User


class Vehicle(models.Model):
    CONNECTION_TYPES = [
        ("BLE", "Bluetooth Low Energy"),
        ("WIFI", "Wi-Fi"),
        ("CLOUD", "Cloud"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vehicles")
    vin = models.TextField(blank=True, null=True)
    make = models.TextField(blank=True, null=True)
    model = models.TextField(blank=True, null=True)
    trim = models.TextField(blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    license_plate = models.TextField(blank=True, null=True)
    odometer = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    dongle_id = models.TextField(blank=True, null=True)
    dongle_connection_type = models.TextField(
        choices=CONNECTION_TYPES, blank=True, null=True
    )
    fuel_type = models.TextField(blank=True, null=True)
    photo_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "vehicles"
        indexes = [
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"{self.year} {self.make} {self.model} ({self.vin})"


class TelematicsSnapshot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name="telematics_snapshots"
    )
    timestamp = models.DateTimeField(blank=True, null=True)
    odometer = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    fuel_used = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    speed_avg = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    dtc = models.JSONField(default=list, blank=True)
    raw = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "telematics_snapshots"
        indexes = [
            models.Index(fields=["vehicle"]),
        ]

    def __str__(self):
        return f"Telematics for {self.vehicle} at {self.timestamp}"


class FuelLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name="fuel_logs"
    )
    timestamp = models.DateTimeField(blank=True, null=True)
    odometer = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    gallons = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    mpg = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "fuel_logs"

    def __str__(self):
        return f"Fuel log for {self.vehicle} - {self.gallons} gallons"
