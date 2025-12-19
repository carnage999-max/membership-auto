from django.db import models
from users.models import User
from vehicles.models import Vehicle


class ParkingSpot(models.Model):
    """Tracks where user parked their vehicle"""

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="parking_spots"
    )
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name="parking_spots",
        null=True,
        blank=True,
    )

    # Location details
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address = models.CharField(
        max_length=500, blank=True, help_text="Human-readable address"
    )
    location_name = models.CharField(
        max_length=200, blank=True, help_text="e.g., 'Mall parking lot'"
    )

    # Photos
    photos = models.JSONField(default=list, help_text="List of photo URLs")

    # Notes and timer
    notes = models.TextField(blank=True)
    parked_at = models.DateTimeField(auto_now_add=True)
    timer_expires_at = models.DateTimeField(
        null=True, blank=True, help_text="When parking meter expires"
    )

    # Status
    active = models.BooleanField(
        default=True, help_text="Is this the current parking spot?"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-parked_at"]
        indexes = [
            models.Index(fields=["user", "-parked_at"]),
            models.Index(fields=["active"]),
        ]

    def __str__(self):
        return f"{self.user} - {self.location_name or 'Unnamed'} - {self.parked_at.strftime('%Y-%m-%d %H:%M')}"

    def save(self, *args, **kwargs):
        # If this is being set as active, deactivate all other spots for this user
        if self.active:
            ParkingSpot.objects.filter(user=self.user, active=True).exclude(
                pk=self.pk
            ).update(active=False)
        super().save(*args, **kwargs)
