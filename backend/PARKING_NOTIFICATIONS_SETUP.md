# Parking Meter Notifications Setup

## Option 1: Using Cron Job (Simple - Recommended)

### 1. Test the command manually first:
```bash
cd /home/binary/Desktop/membership-auto/backend
python manage.py check_parking_meters
```

### 2. Set up cron job to run every 5 minutes:

**On your server (Linux/Mac):**
```bash
crontab -e
```

**Add this line:**
```
*/5 * * * * cd /home/binary/Desktop/membership-auto/backend && /usr/bin/python3 manage.py check_parking_meters >> /var/log/parking_notifications.log 2>&1
```

**Or if using a virtual environment:**
```
*/5 * * * * cd /home/binary/Desktop/membership-auto/backend && /home/binary/Desktop/membership-auto/venv/bin/python manage.py check_parking_meters >> /var/log/parking_notifications.log 2>&1
```

### 3. Create log directory:
```bash
sudo mkdir -p /var/log
sudo touch /var/log/parking_notifications.log
sudo chmod 666 /var/log/parking_notifications.log
```

### 4. Verify cron is running:
```bash
# Check if cron job is registered
crontab -l

# Check logs after 5 minutes
tail -f /var/log/parking_notifications.log
```

---

## Option 2: Using Celery Beat (Production - More Complex)

If you want a more robust solution for production with multiple scheduled tasks:

### 1. Install Celery:
```bash
pip install celery django-celery-beat django-celery-results
pip freeze > requirements.txt
```

### 2. Create `backend/celery.py`:
```python
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('membership_auto')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat schedule
app.conf.beat_schedule = {
    'check-parking-meters-every-5-minutes': {
        'task': 'notifications.tasks.check_parking_meters',
        'schedule': crontab(minute='*/5'),
    },
}
```

### 3. Update `backend/config/__init__.py`:
```python
from .celery import app as celery_app

__all__ = ('celery_app',)
```

### 4. Add to `backend/config/settings.py`:
```python
# Celery Configuration
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'django-db'
CELERY_CACHE_BACKEND = 'django-cache'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # ... existing apps
    'django_celery_beat',
    'django_celery_results',
]
```

### 5. Create `backend/notifications/tasks.py`:
```python
from celery import shared_task
from parking.models import ParkingSpot
from .utils import send_parking_meter_expiring_notification


@shared_task
def check_parking_meters():
    """Check for expiring parking meters and send notifications"""
    active_spots = ParkingSpot.objects.filter(
        active=True, timer_expires_at__isnull=False
    )

    for spot in active_spots:
        try:
            send_parking_meter_expiring_notification(spot)
        except Exception as e:
            print(f"Error processing spot {spot.id}: {str(e)}")

    return f"Checked {active_spots.count()} parking spots"
```

### 6. Run migrations:
```bash
python manage.py migrate django_celery_beat
python manage.py migrate django_celery_results
```

### 7. Start Celery worker and beat:

**Terminal 1 - Worker:**
```bash
celery -A config worker -l info
```

**Terminal 2 - Beat (scheduler):**
```bash
celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

### 8. For production, use systemd services:

**Create `/etc/systemd/system/celery-worker.service`:**
```ini
[Unit]
Description=Celery Worker
After=network.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/home/binary/Desktop/membership-auto/backend
ExecStart=/home/binary/Desktop/membership-auto/venv/bin/celery -A config worker --detach --loglevel=info
ExecStop=/home/binary/Desktop/membership-auto/venv/bin/celery -A config control shutdown
Restart=always

[Install]
WantedBy=multi-user.target
```

**Create `/etc/systemd/system/celery-beat.service`:**
```ini
[Unit]
Description=Celery Beat
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/home/binary/Desktop/membership-auto/backend
ExecStart=/home/binary/Desktop/membership-auto/venv/bin/celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
Restart=always

[Install]
WantedBy=multi-user.target
```

**Enable and start services:**
```bash
sudo systemctl enable celery-worker celery-beat
sudo systemctl start celery-worker celery-beat
sudo systemctl status celery-worker celery-beat
```

---

## Which Option Should You Choose?

### Use **Option 1 (Cron)** if:
- ✅ You only need parking meter notifications
- ✅ You want simplicity
- ✅ You don't want to add more dependencies
- ✅ You're hosting on a simple VPS

### Use **Option 2 (Celery)** if:
- ✅ You plan to add more scheduled tasks (appointment reminders, service notifications, etc.)
- ✅ You need more control over task execution
- ✅ You want better monitoring and retry logic
- ✅ You're scaling to handle many concurrent tasks

---

## Testing Notifications

### 1. Test on a specific user:
```bash
python manage.py test_notifications user@email.com parking_meter
```

### 2. Create a parking spot with timer expiring in 15 minutes:
```python
from parking.models import ParkingSpot
from django.utils import timezone
from datetime import timedelta

# In Django shell
spot = ParkingSpot.objects.create(
    user_id=1,  # Your user ID
    latitude=6.5355,
    longitude=3.3420,
    address="Test Location",
    timer_expires_at=timezone.now() + timedelta(minutes=15),
    active=True
)
```

### 3. Run the checker:
```bash
python manage.py check_parking_meters
```

You should see the notification sent!

---

## Current Status

✅ Backend notification functions implemented
✅ Mobile app handlers implemented
✅ Management commands created
⏳ **Need to set up either cron job OR Celery Beat**

**Recommendation**: Start with **Option 1 (Cron)** since it's simpler and requires zero changes to your existing setup.
