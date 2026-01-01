"""
Management command to check for expiring parking meters and send notifications
This should be run as a cron job every 5 minutes

Usage: python manage.py check_parking_meters
Cron: */5 * * * * cd /path/to/project && python manage.py check_parking_meters
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from parking.models import ParkingSpot
from notifications.utils import send_parking_meter_expiring_notification


class Command(BaseCommand):
    help = "Check for expiring parking meters and send notifications"

    def handle(self, *args, **options):
        # Get all active parking spots with timers
        active_spots = ParkingSpot.objects.filter(
            active=True, timer_expires_at__isnull=False
        )

        self.stdout.write(
            self.style.SUCCESS(f"Checking {active_spots.count()} active parking spots with timers")
        )

        notifications_sent = 0

        for spot in active_spots:
            try:
                # This will send notification if meter is expiring in 15 min or has expired
                send_parking_meter_expiring_notification(spot)
                notifications_sent += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error processing spot {spot.id}: {str(e)}")
                )

        self.stdout.write(
            self.style.SUCCESS(f"✅ Checked {active_spots.count()} spots, processed {notifications_sent} notifications")
        )
