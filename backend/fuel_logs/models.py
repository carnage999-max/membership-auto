from django.db import models
from vehicles.models import Vehicle
from django.core.validators import MinValueValidator
from decimal import Decimal


class FuelLog(models.Model):
    """Tracks fuel fill-ups and calculates MPG"""

    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name="fuel_logs"
    )

    # Fill-up details
    date = models.DateField()
    odometer = models.IntegerField(validators=[MinValueValidator(0)])
    gallons = models.DecimalField(
        max_digits=6, decimal_places=3, validators=[MinValueValidator(Decimal("0.001"))]
    )
    cost = models.DecimalField(
        max_digits=8, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )
    price_per_gallon = models.DecimalField(max_digits=6, decimal_places=3)

    # Location
    station = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)  # Address or city

    # Optional attachments
    photo_url = models.URLField(blank=True, help_text="Photo of odometer")
    receipt_url = models.URLField(blank=True, help_text="Receipt photo")

    # Calculated fields
    mpg = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Miles per gallon",
    )
    miles_driven = models.IntegerField(
        null=True, blank=True, help_text="Miles since last fill-up"
    )
    cost_per_mile = models.DecimalField(
        max_digits=6, decimal_places=3, null=True, blank=True
    )

    # Additional info
    is_full_tank = models.BooleanField(
        default=True, help_text="Was the tank filled completely?"
    )
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-odometer"]
        indexes = [
            models.Index(fields=["vehicle", "-date"]),
        ]

    def __str__(self):
        return f"{self.vehicle} - {self.date} - {self.gallons}gal"

    def calculate_mpg(self):
        """Calculate MPG based on previous fill-up"""
        if not self.is_full_tank:
            return None

        # Find previous full tank fill-up
        previous = (
            FuelLog.objects.filter(
                vehicle=self.vehicle, odometer__lt=self.odometer, is_full_tank=True
            )
            .order_by("-odometer")
            .first()
        )

        if previous:
            self.miles_driven = self.odometer - previous.odometer
            if self.gallons > 0:
                self.mpg = round(Decimal(self.miles_driven) / self.gallons, 2)
                self.cost_per_mile = round(self.cost / Decimal(self.miles_driven), 3)

        return self.mpg

    def save(self, *args, **kwargs):
        # Calculate price per gallon if not provided
        if not self.price_per_gallon and self.gallons > 0:
            self.price_per_gallon = round(self.cost / self.gallons, 3)

        # Calculate MPG on save
        self.calculate_mpg()

        super().save(*args, **kwargs)
