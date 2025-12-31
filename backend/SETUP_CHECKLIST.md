# Push Notifications - Quick Setup Checklist

Follow these steps to get push notifications working:

## ☐ 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

## ☐ 2. Add to Django Settings

Edit `backend/membership_auto/settings.py`:

```python
INSTALLED_APPS = [
    # ... existing apps
    'notifications',  # Add this line
]

# Add at the end of the file
import os
FIREBASE_SERVICE_ACCOUNT_PATH = os.path.join(BASE_DIR, 'firebase-service-account.json')
```

## ☐ 3. Download Firebase Service Account Key

1. Go to https://console.firebase.google.com/
2. Select your project
3. Click ⚙️ → Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save as `backend/firebase-service-account.json`

## ☐ 4. Add to .gitignore

Edit `backend/.gitignore`:
```
firebase-service-account.json
```

## ☐ 5. Add Notification URLs

Edit `backend/membership_auto/urls.py`:

```python
urlpatterns = [
    # ... existing URLs
    path("api/notifications/", include("notifications.urls")),
]
```

## ☐ 6. Run Migrations

```bash
python manage.py makemigrations notifications
python manage.py migrate
```

## ☐ 7. Test the Setup

```bash
python manage.py runserver
```

Then test with a registered device using:
```
POST /api/notifications/test/
Headers: Authorization: Bearer <your_jwt_token>
Body: {"title": "Test", "body": "Hello!"}
```

---

## That's It! 🎉

The frontend is already configured and will automatically register devices when users launch the app.

For detailed information, see [PUSH_NOTIFICATIONS_SETUP.md](./PUSH_NOTIFICATIONS_SETUP.md)
