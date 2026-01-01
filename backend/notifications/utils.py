"""
Utility functions for sending notifications in various scenarios
"""

from typing import List, Optional, Dict
from django.utils import timezone
from .models import Device, NotificationLog
from .fcm_service import fcm_service
import logging

logger = logging.getLogger(__name__)


def send_notification_to_user(
    user,
    title: str,
    body: str,
    notification_type: str = "general",
    data: Optional[Dict] = None,
    image_url: Optional[str] = None,
) -> Dict:
    """
    Send notification to all active devices for a user

    Args:
        user: User instance
        title: Notification title
        body: Notification body
        notification_type: Type of notification (for logging)
        data: Custom data payload
        image_url: Optional image URL

    Returns:
        Dict with success_count and failure_count
    """
    devices = Device.objects.filter(user=user, is_active=True)

    if not devices.exists():
        logger.warning(f"No active devices for user {user.email}")
        return {"success_count": 0, "failure_count": 0}

    success_count = 0
    failure_count = 0

    for device in devices:
        result = fcm_service.send_notification(
            token=device.push_token,
            title=title,
            body=body,
            data=data or {},
            image_url=image_url,
        )

        # Log the notification
        NotificationLog.objects.create(
            user=user,
            device=device,
            notification_type=notification_type,
            title=title,
            body=body,
            data=data or {},
            status="sent" if result.get("success") else "failed",
            error_message=result.get("error"),
            sent_at=timezone.now() if result.get("success") else None,
        )

        if result.get("success"):
            success_count += 1
        else:
            failure_count += 1

    return {"success_count": success_count, "failure_count": failure_count}


def send_appointment_reminder(appointment):
    """Send appointment reminder notification"""
    from datetime import timedelta

    # Check if appointment is within 24 hours
    time_until = appointment.scheduled_at - timezone.now()
    if timedelta(hours=23) <= time_until <= timedelta(hours=25):
        hours = int(time_until.total_seconds() / 3600)

        send_notification_to_user(
            user=appointment.user,
            title="Appointment Reminder",
            body=f"Your {appointment.service_type} appointment is in {hours} hours at {appointment.location.name}",
            notification_type="appointment_reminder",
            data={
                "type": "appointment",
                "appointment_id": str(appointment.id),
                "deepLink": "/(authenticated)/appointments",
            },
        )


def send_service_due_notification(vehicle, service_schedule):
    """Notify user that a service is due"""
    send_notification_to_user(
        user=vehicle.user,
        title="Service Due",
        body=f"{service_schedule.service_type.name} is due for your {vehicle.year} {vehicle.make} {vehicle.model}",
        notification_type="service_due",
        data={
            "type": "service_due",
            "vehicle_id": str(vehicle.id),
            "schedule_id": str(service_schedule.id),
            "deepLink": "/(authenticated)/service-schedule",
        },
    )


def send_parking_reminder(parking_spot):
    """Send parking reminder notification"""
    from datetime import timedelta

    # Send reminder after 4 hours of parking
    time_parked = timezone.now() - parking_spot.parked_at
    if time_parked >= timedelta(hours=4):
        send_notification_to_user(
            user=parking_spot.user,
            title="Parking Reminder",
            body=f"You've been parked at {parking_spot.address or 'your location'} for {int(time_parked.total_seconds() / 3600)} hours",
            notification_type="parking_reminder",
            data={
                "type": "parking",
                "parking_id": str(parking_spot.id),
                "deepLink": "/(authenticated)/parking",
            },
        )


def send_parking_meter_expiring_notification(parking_spot):
    """Send notification when parking meter is about to expire"""
    from datetime import timedelta

    if not parking_spot.timer_expires_at:
        return

    time_until_expiry = parking_spot.timer_expires_at - timezone.now()

    # Send notification 15 minutes before expiry
    if timedelta(minutes=14) <= time_until_expiry <= timedelta(minutes=16):
        send_notification_to_user(
            user=parking_spot.user,
            title="⏰ Parking Meter Expiring Soon!",
            body=f"Your parking meter expires in 15 minutes at {parking_spot.address or 'your location'}",
            notification_type="parking_meter_expiring",
            data={
                "type": "parking_meter",
                "parking_id": str(parking_spot.id),
                "deepLink": "/(authenticated)/parking",
            },
        )

    # Send notification when meter has expired
    elif time_until_expiry <= timedelta(minutes=0):
        send_notification_to_user(
            user=parking_spot.user,
            title="🚨 Parking Meter Expired!",
            body=f"Your parking meter has expired! Move your vehicle to avoid a ticket.",
            notification_type="parking_meter_expired",
            data={
                "type": "parking_meter",
                "parking_id": str(parking_spot.id),
                "deepLink": "/(authenticated)/parking",
            },
        )


def send_membership_update(user, message: str):
    """Send membership-related notification"""
    send_notification_to_user(
        user=user,
        title="Membership Update",
        body=message,
        notification_type="membership_update",
        data={
            "type": "membership",
            "deepLink": "/(authenticated)/profile",
        },
    )


def send_offer_notification(user, offer):
    """Send special offer notification"""
    send_notification_to_user(
        user=user,
        title=f"Special Offer: {offer.title}",
        body=offer.description[:100],
        notification_type="offer",
        data={
            "type": "offer",
            "offer_id": str(offer.id),
            "deepLink": "/(authenticated)/offers",
        },
        image_url=offer.image_url if hasattr(offer, "image_url") else None,
    )
