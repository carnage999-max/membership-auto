"""
Management command to test push notifications
Usage: python manage.py test_notifications <user_email> <notification_type>
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from notifications.utils import (
    send_notification_to_user,
    send_appointment_reminder,
    send_service_due_notification,
    send_parking_reminder,
    send_parking_meter_expiring_notification,
    send_membership_update,
    send_offer_notification,
)

User = get_user_model()


class Command(BaseCommand):
    help = "Test push notifications for a specific user"

    def add_arguments(self, parser):
        parser.add_argument("email", type=str, help="User email address")
        parser.add_argument(
            "notification_type",
            type=str,
            choices=[
                "general",
                "appointment",
                "service_due",
                "parking",
                "parking_meter",
                "membership",
                "offer",
            ],
            help="Type of notification to send",
        )

    def handle(self, *args, **options):
        email = options["email"]
        notification_type = options["notification_type"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"User with email {email} not found"))
            return

        # Check if user has any active devices
        from notifications.models import Device

        devices = Device.objects.filter(user=user, is_active=True)
        if not devices.exists():
            self.stdout.write(
                self.style.WARNING(
                    f"User {email} has no active devices registered for push notifications"
                )
            )
            return

        self.stdout.write(
            self.style.SUCCESS(f"Found {devices.count()} active device(s) for {email}")
        )

        # Send test notification based on type
        if notification_type == "general":
            result = send_notification_to_user(
                user=user,
                title="Test Notification",
                body="This is a test push notification from Membership Auto!",
                notification_type="test",
                data={"type": "test", "deepLink": "/(authenticated)/(tabs)"},
            )

        elif notification_type == "appointment":
            result = send_notification_to_user(
                user=user,
                title="Appointment Reminder",
                body="Your oil change appointment is tomorrow at 2:00 PM at Main Street Auto",
                notification_type="appointment_reminder",
                data={
                    "type": "appointment",
                    "deepLink": "/(authenticated)/appointments",
                },
            )

        elif notification_type == "service_due":
            result = send_notification_to_user(
                user=user,
                title="Service Due",
                body="Oil change is due for your 2020 Toyota Camry",
                notification_type="service_due",
                data={"type": "service_due", "deepLink": "/(authenticated)/service-schedule"},
            )

        elif notification_type == "parking":
            result = send_notification_to_user(
                user=user,
                title="Parking Reminder",
                body="You've been parked at 123 Main Street for 4 hours",
                notification_type="parking_reminder",
                data={"type": "parking", "deepLink": "/(authenticated)/parking"},
            )

        elif notification_type == "parking_meter":
            result = send_notification_to_user(
                user=user,
                title="⏰ Parking Meter Expiring Soon!",
                body="Your parking meter expires in 15 minutes at 123 Main Street",
                notification_type="parking_meter_expiring",
                data={"type": "parking_meter", "deepLink": "/(authenticated)/parking"},
            )

        elif notification_type == "membership":
            result = send_notification_to_user(
                user=user,
                title="Membership Update",
                body="Your membership has been successfully upgraded to Premium!",
                notification_type="membership_update",
                data={"type": "membership", "deepLink": "/(authenticated)/profile"},
            )

        elif notification_type == "offer":
            result = send_notification_to_user(
                user=user,
                title="Special Offer: 20% Off Oil Change",
                body="Get 20% off your next oil change service! Offer valid until end of month.",
                notification_type="offer",
                data={"type": "offer", "deepLink": "/(authenticated)/offers"},
            )

        else:
            self.stdout.write(self.style.ERROR(f"Unknown notification type: {notification_type}"))
            return

        success_count = result.get("success_count", 0)
        failure_count = result.get("failure_count", 0)

        if success_count > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ Successfully sent notification to {success_count} device(s)"
                )
            )
        if failure_count > 0:
            self.stdout.write(
                self.style.ERROR(f"❌ Failed to send to {failure_count} device(s)")
            )
