# Push Notifications Setup Guide

This guide walks you through setting up Firebase Cloud Messaging (FCM) v1 API for push notifications in the Membership Auto app.

## Architecture Overview

The push notification system consists of:

1. **Backend Components**:
   - `notifications` Django app with Device and NotificationLog models
   - FCM v1 API service with OAuth2 authentication (not deprecated legacy API)
   - Utility functions for various notification types
   - REST API endpoints for device registration and notification management

2. **Frontend Components** (already implemented):
   - `usePushNotifications` hook for managing notification permissions
   - `push-notifications.ts` service for handling Expo notifications
   - Deep linking support for notification navigation

## Backend Setup

### 1. Install Required Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- `google-auth`: OAuth2 authentication for FCM v1 API
- `google-api-python-client`: Google API client library
- `requests`: HTTP library for API calls

### 2. Add Notifications App to Django Settings

Edit `backend/membership_auto/settings.py`:

```python
INSTALLED_APPS = [
    # ... other apps
    'notifications',
]
```

### 3. Configure Firebase Service Account

#### Step 3.1: Download Service Account Key from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project Settings**
4. Navigate to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file as `firebase-service-account.json`

#### Step 3.2: Add Service Account Path to Settings

Add to `backend/membership_auto/settings.py`:

```python
import os

# Firebase Cloud Messaging Configuration
FIREBASE_SERVICE_ACCOUNT_PATH = os.path.join(BASE_DIR, 'firebase-service-account.json')

# Store the JSON file in backend/ directory (same level as manage.py)
# Make sure to add firebase-service-account.json to .gitignore!
```

**IMPORTANT**: Add the service account file to `.gitignore`:

```
# .gitignore
firebase-service-account.json
```

### 4. Add Notification URLs

Edit `backend/membership_auto/urls.py`:

```python
urlpatterns = [
    # ... other URLs
    path("api/notifications/", include("notifications.urls")),
]
```

### 5. Run Database Migrations

```bash
python manage.py makemigrations notifications
python manage.py migrate
```

### 6. Verify Setup

Test the notification system:

```bash
# Start Django server
python manage.py runserver

# Use the test notification endpoint
# POST /api/notifications/test/
# Headers: Authorization: Bearer <your_jwt_token>
# Body: {
#   "title": "Test Notification",
#   "body": "Testing push notifications!"
# }
```

## Frontend Setup (Already Complete)

The frontend is already set up with:

1. **Push Notification Hook**: [mobile/hooks/usePushNotifications.ts](../mobile/hooks/usePushNotifications.ts)
   - Handles permission requests
   - Registers device tokens with backend
   - Sets up notification listeners

2. **Notification Service**: [mobile/services/notifications/push-notifications.ts](../mobile/services/notifications/push-notifications.ts)
   - Expo push notification configuration
   - Deep linking navigation based on notification type

3. **Device Registration**: Automatically called in the app root layout

## API Endpoints

### Device Management

#### Register Device
```
POST /api/notifications/devices/register/
Headers: Authorization: Bearer <token>
Body: {
  "platform": "ios" | "android" | "web",
  "push_token": "ExponentPushToken[...]" or "FCM_TOKEN",
  "device_name": "iPhone 15 Pro" (optional)
}
```

#### Unregister Device
```
POST /api/notifications/devices/unregister/
Headers: Authorization: Bearer <token>
Body: {
  "push_token": "ExponentPushToken[...]"
}
```

#### List User Devices
```
GET /api/notifications/devices/
Headers: Authorization: Bearer <token>
```

### Notification Management

#### Get Notification History
```
GET /api/notifications/history/
Headers: Authorization: Bearer <token>
```

#### Send Test Notification
```
POST /api/notifications/test/
Headers: Authorization: Bearer <token>
Body: {
  "title": "Test Title" (optional),
  "body": "Test Body" (optional)
}
```

## Notification Types & Deep Links

The system supports the following notification types with automatic deep linking:

1. **Appointment Reminder**
   - Type: `appointment_reminder`
   - Deep Link: `/(authenticated)/appointments`
   - Triggered: 24 hours before appointment

2. **Service Due**
   - Type: `service_due`
   - Deep Link: `/(authenticated)/service-schedule`
   - Triggered: When service becomes due

3. **Parking Reminder**
   - Type: `parking_reminder`
   - Deep Link: `/(authenticated)/parking`
   - Triggered: After 4 hours of parking

4. **Membership Update**
   - Type: `membership_update`
   - Deep Link: `/(authenticated)/profile`
   - Triggered: On membership changes

5. **Special Offer**
   - Type: `offer`
   - Deep Link: `/(authenticated)/offers`
   - Triggered: When new offers are available

## Sending Notifications from Backend

### Example: Send Parking Reminder

```python
from notifications.utils import send_parking_reminder

# Get parking spot
parking_spot = ParkingSpot.objects.get(id=parking_id)

# Send notification to user
send_parking_reminder(parking_spot)
```

### Example: Send Custom Notification

```python
from notifications.utils import send_notification_to_user

send_notification_to_user(
    user=user,
    title="Custom Notification",
    body="This is a custom message",
    notification_type="custom",
    data={
        "type": "custom",
        "custom_field": "value",
        "deepLink": "/(authenticated)/some-screen"
    },
    image_url="https://example.com/image.jpg"  # optional
)
```

## Token Types Supported

The FCM service supports both:

1. **FCM Tokens**: Native Firebase Cloud Messaging tokens
2. **Expo Push Tokens**: For React Native apps using Expo
   - Format: `ExponentPushToken[...]` or `ExpoPushToken[...]`
   - Automatically routes to Expo Push Notification service

## Troubleshooting

### Common Issues

1. **"No credentials found"**
   - Verify `FIREBASE_SERVICE_ACCOUNT_PATH` is set correctly
   - Ensure the service account JSON file exists and is readable

2. **"Invalid credentials"**
   - Re-download the service account key from Firebase Console
   - Verify you're using the correct Firebase project

3. **"Token not registered"**
   - The device token may be expired or invalid
   - User needs to re-register the device
   - Check if the device is marked as `is_active=True`

4. **Notifications not received on device**
   - Check notification permissions are granted on device
   - Verify device token is correctly registered in database
   - Check notification logs for delivery status
   - For iOS, ensure you have proper APNs certificates configured in Firebase

5. **OAuth2 token expired**
   - The service automatically refreshes tokens
   - Check Django logs for authentication errors

### Debug Mode

The FCM service logs all operations. Check Django logs:

```bash
# In your Django app
python manage.py runserver

# Watch for FCM-related logs:
# - "Sending FCM notification..."
# - "FCM notification sent successfully"
# - "FCM notification failed..."
```

### Testing

1. Use the test endpoint to verify setup:
   ```bash
   curl -X POST http://localhost:8000/api/notifications/test/ \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title": "Test", "body": "Hello!"}'
   ```

2. Check notification logs in the database:
   ```python
   from notifications.models import NotificationLog
   NotificationLog.objects.all().order_by('-created_at')[:10]
   ```

## Security Best Practices

1. **Never commit** the Firebase service account JSON to version control
2. **Restrict service account permissions** to only FCM in Firebase Console
3. **Use environment variables** for sensitive configuration in production
4. **Implement rate limiting** for notification endpoints to prevent abuse
5. **Validate notification data** before sending to prevent injection attacks

## Production Considerations

For production deployment:

1. Store `FIREBASE_SERVICE_ACCOUNT_PATH` as an environment variable
2. Use a secrets management service (AWS Secrets Manager, etc.)
3. Set up monitoring for notification delivery rates
4. Implement retry logic for failed notifications
5. Consider using Celery for async notification processing

## Migration from Legacy FCM API

This implementation uses **FCM v1 API**, not the deprecated legacy API:

- **Legacy API** (deprecated): Used server keys, simpler but being phased out
- **FCM v1 API** (current): Uses OAuth2 service accounts, more secure and feature-rich

If you have existing code using the legacy API, you'll need to:
1. Download a new service account key (not the legacy server key)
2. Update your client code to use the new token format
3. Migrate device tokens if needed

---

## Summary

You now have a complete push notification system with:
- ✅ FCM v1 API integration (not deprecated)
- ✅ Device registration and management
- ✅ Notification logging and history
- ✅ Multiple notification types with deep linking
- ✅ Support for both FCM and Expo push tokens
- ✅ Production-ready architecture

The only remaining step is to configure your Firebase service account credentials.
