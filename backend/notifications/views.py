from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Device, NotificationLog
from .serializers import DeviceSerializer, NotificationLogSerializer
from .fcm_service import fcm_service
from django.utils import timezone


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_device(request):
    """Register or update a device for push notifications"""
    platform = request.data.get("platform")
    push_token = request.data.get("push_token")
    device_name = request.data.get("device_name", "")

    if not platform or not push_token:
        return Response(
            {"error": "platform and push_token are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Update existing device or create new one
    device, created = Device.objects.update_or_create(
        user=request.user,
        push_token=push_token,
        defaults={
            "platform": platform,
            "device_name": device_name,
            "is_active": True,
            "last_used_at": timezone.now(),
        },
    )

    serializer = DeviceSerializer(device)
    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unregister_device(request):
    """Unregister the current device from push notifications"""
    push_token = request.data.get("push_token")

    if not push_token:
        return Response(
            {"error": "push_token is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    Device.objects.filter(user=request.user, push_token=push_token).update(
        is_active=False
    )

    return Response(
        {"message": "Device unregistered successfully"}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_devices(request):
    """List all registered devices for the current user"""
    devices = Device.objects.filter(user=request.user, is_active=True)
    serializer = DeviceSerializer(devices, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notification_history(request):
    """Get notification history for the current user"""
    notifications = NotificationLog.objects.filter(user=request.user)[:50]
    serializer = NotificationLogSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_test_notification(request):
    """Send a test notification to the user's devices (for debugging)"""
    title = request.data.get("title", "Test Notification")
    body = request.data.get("body", "This is a test notification from Membership Auto")

    # Get user's active devices
    devices = Device.objects.filter(user=request.user, is_active=True)

    if not devices.exists():
        return Response(
            {"error": "No active devices found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Send to all devices
    results = []
    for device in devices:
        result = fcm_service.send_notification(
            token=device.push_token,
            title=title,
            body=body,
            data={"type": "test", "timestamp": str(timezone.now())},
        )

        # Log the notification
        NotificationLog.objects.create(
            user=request.user,
            device=device,
            notification_type="general",
            title=title,
            body=body,
            status="sent" if result.get("success") else "failed",
            error_message=result.get("error"),
            sent_at=timezone.now() if result.get("success") else None,
        )

        results.append({"device_id": str(device.id), "result": result})

    return Response(
        {"message": "Test notifications sent", "results": results},
        status=status.HTTP_200_OK,
    )
