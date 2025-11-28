# Deployment Guide - Membership Auto Backend

This guide covers deploying the Membership Auto Django backend to production.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Production Settings](#production-settings)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Deployment Platforms](#deployment-platforms)
- [Docker Deployment](#docker-deployment)
- [Security Checklist](#security-checklist)
- [Monitoring & Logging](#monitoring--logging)
- [Backup Strategy](#backup-strategy)
- [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

- [ ] All tests passing (`python manage.py test`)
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Secret key changed from default
- [ ] DEBUG set to False
- [ ] ALLOWED_HOSTS configured
- [ ] Static files collected
- [ ] SSL/TLS certificates configured
- [ ] Database backups configured
- [ ] Monitoring and logging set up

## Production Settings

### Create Production Settings File

Create `membership_auto/settings_production.py`:

```python
from .settings import *
import os

# Security
DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Database - Use PostgreSQL in production
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}

# Security Headers
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Static Files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

# Media Files (if not using S3)
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'django.log'),
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# CORS - Update with your frontend domain
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
CORS_ALLOW_CREDENTIALS = True

# AWS S3 (if using)
USE_S3 = os.environ.get('USE_S3', 'true').lower() == 'true'
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')

# Channel Layers (for WebSocket) - Use Redis in production
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(os.environ.get('REDIS_HOST', 'localhost'), 6379)],
        },
    },
}
```

### Use Production Settings

Set environment variable:
```bash
export DJANGO_SETTINGS_MODULE=membership_auto.settings_production
```

Or update `manage.py`:
```python
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'membership_auto.settings_production')
```

## Database Setup

### PostgreSQL Setup

1. **Install PostgreSQL** (if not using managed service):
   ```bash
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Create Database and User**:
   ```sql
   CREATE DATABASE membership_auto;
   CREATE USER membership_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE membership_auto TO membership_user;
   \c membership_auto
   GRANT ALL ON SCHEMA public TO membership_user;
   ```

3. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Create Superuser**:
   ```bash
   python manage.py createsuperuser
   ```

### Managed Database Services

#### AWS RDS
- Create PostgreSQL instance
- Set security group to allow connections from your app servers
- Use connection string in environment variables

#### Heroku Postgres
- Automatically provisioned with `heroku addons:create heroku-postgresql`
- Connection string in `DATABASE_URL` environment variable

#### DigitalOcean Managed Database
- Create PostgreSQL cluster
- Whitelist your app servers
- Use connection string provided

## Environment Variables

### Required Variables

Create a `.env` file or set in your deployment platform:

```bash
# Django
SECRET_KEY=your-super-secret-key-here-min-50-chars
DEBUG=False
ALLOWED_HOSTS=api.yourdomain.com,yourdomain.com
DJANGO_SETTINGS_MODULE=membership_auto.settings_production

# Database
USE_POSTGRES=true
DB_NAME=membership_auto
DB_USER=membership_user
DB_PASSWORD=secure-password
DB_HOST=your-db-host
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# AWS S3
USE_S3=true
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1

# Redis (for WebSocket)
REDIS_HOST=your-redis-host
REDIS_PORT=6379

# JWT (optional - adjust token lifetimes)
ACCESS_TOKEN_LIFETIME=3600  # 1 hour
REFRESH_TOKEN_LIFETIME=604800  # 7 days
```

### Generate Secret Key

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## Deployment Platforms

### AWS (EC2/ECS/Elastic Beanstalk)

#### EC2 Deployment

1. **Launch EC2 Instance**:
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Install Dependencies**:
   ```bash
   sudo apt-get update
   sudo apt-get install python3-pip python3-venv nginx postgresql-client
   ```

3. **Deploy Application**:
   ```bash
   git clone https://github.com/yourusername/membership-auto.git
   cd membership-auto/backend
   python3 -m venv env
   source env/bin/activate
   pip install -r requirements.txt
   ```

4. **Configure Gunicorn**:
   ```bash
   pip install gunicorn
   ```
   
   Create `gunicorn_config.py`:
   ```python
   bind = "127.0.0.1:8000"
   workers = 4
   worker_class = "sync"
   timeout = 120
   keepalive = 5
   ```

5. **Create Systemd Service** (`/etc/systemd/system/membership-auto.service`):
   ```ini
   [Unit]
   Description=Membership Auto Gunicorn
   After=network.target

   [Service]
   User=ubuntu
   Group=www-data
   WorkingDirectory=/home/ubuntu/membership-auto/backend
   Environment="PATH=/home/ubuntu/membership-auto/backend/env/bin"
   ExecStart=/home/ubuntu/membership-auto/backend/env/bin/gunicorn \
       --config gunicorn_config.py \
       membership_auto.wsgi:application

   [Install]
   WantedBy=multi-user.target
   ```

6. **Start Service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start membership-auto
   sudo systemctl enable membership-auto
   ```

7. **Configure Nginx** (`/etc/nginx/sites-available/membership-auto`):
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name api.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

       client_max_body_size 100M;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /static/ {
           alias /home/ubuntu/membership-auto/backend/staticfiles/;
       }

       location /media/ {
           alias /home/ubuntu/membership-auto/backend/media/;
       }
   }
   ```

8. **Enable Site and Restart Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/membership-auto /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

#### ECS Deployment

1. **Create Docker Image** (see Docker section below)
2. **Push to ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
   docker tag membership-auto:latest your-account.dkr.ecr.us-east-1.amazonaws.com/membership-auto:latest
   docker push your-account.dkr.ecr.us-east-1.amazonaws.com/membership-auto:latest
   ```
3. **Create ECS Task Definition** with environment variables
4. **Create ECS Service** with Application Load Balancer
5. **Configure ALB** for HTTPS

### Heroku

1. **Install Heroku CLI**

2. **Login and Create App**:
   ```bash
   heroku login
   heroku create membership-auto-api
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set DEBUG=False
   heroku config:set ALLOWED_HOSTS=membership-auto-api.herokuapp.com
   # ... set all other variables
   ```

4. **Add PostgreSQL**:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

5. **Add Redis** (for WebSocket):
   ```bash
   heroku addons:create heroku-redis:hobby-dev
   ```

6. **Deploy**:
   ```bash
   git push heroku main
   ```

7. **Run Migrations**:
   ```bash
   heroku run python manage.py migrate
   heroku run python manage.py createsuperuser
   ```

8. **Collect Static Files**:
   ```bash
   heroku run python manage.py collectstatic --noinput
   ```

### DigitalOcean App Platform

1. **Create App** from GitHub repository
2. **Configure Build Command**:
   ```bash
   cd backend && pip install -r requirements.txt
   ```
3. **Configure Run Command**:
   ```bash
   cd backend && gunicorn membership_auto.wsgi:application --bind 0.0.0.0:8080
   ```
4. **Add Environment Variables** in App Settings
5. **Add Database** component (PostgreSQL)
6. **Add Redis** component (for WebSocket)

## Docker Deployment

### Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "membership_auto.wsgi:application"]
```

### Docker Compose

Create `backend/docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: membership_auto
      POSTGRES_USER: membership_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  web:
    build: .
    command: gunicorn membership_auto.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  static_volume:
```

### Build and Run

```bash
docker-compose build
docker-compose up -d
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
```

## Security Checklist

### Before Going Live

- [ ] **Change SECRET_KEY** - Never use default
- [ ] **Set DEBUG=False** - Never in production
- [ ] **Configure ALLOWED_HOSTS** - Restrict to your domains
- [ ] **Enable HTTPS** - SSL/TLS certificates
- [ ] **Secure Cookies** - SESSION_COOKIE_SECURE, CSRF_COOKIE_SECURE
- [ ] **Security Headers** - HSTS, XSS protection, etc.
- [ ] **Database Credentials** - Strong passwords, separate user
- [ ] **AWS Credentials** - Use IAM roles when possible
- [ ] **API Rate Limiting** - Consider django-ratelimit
- [ ] **CORS Configuration** - Only allow your frontend domains
- [ ] **Remove Debug Toolbar** - If installed
- [ ] **Review Admin Access** - Limit admin users
- [ ] **Backup Strategy** - Automated backups configured

### Additional Security Packages

```bash
pip install django-ratelimit django-cors-headers
```

## Monitoring & Logging

### Application Monitoring

#### Sentry (Error Tracking)

1. **Install**:
   ```bash
   pip install sentry-sdk
   ```

2. **Configure** (`settings_production.py`):
   ```python
   import sentry_sdk
   from sentry_sdk.integrations.django import DjangoIntegration

   sentry_sdk.init(
       dsn=os.environ.get('SENTRY_DSN'),
       integrations=[DjangoIntegration()],
       traces_sample_rate=0.1,
       send_default_pii=True,
   )
   ```

#### Application Performance Monitoring

- **New Relic**: `pip install newrelic`
- **Datadog APM**: `pip install ddtrace`
- **AWS CloudWatch**: Built-in with AWS deployments

### Logging

Configure logging in `settings_production.py` (see example above).

For centralized logging:
- **AWS CloudWatch Logs**
- **Papertrail**
- **Loggly**
- **ELK Stack** (Elasticsearch, Logstash, Kibana)

## Backup Strategy

### Database Backups

#### Automated PostgreSQL Backups

Create `scripts/backup_db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="membership_auto_$DATE.sql"

pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_DIR/$FILENAME

# Keep only last 30 days
find $BACKUP_DIR -name "membership_auto_*.sql" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/$FILENAME s3://your-backup-bucket/db-backups/
```

#### Cron Job

```bash
0 2 * * * /path/to/backup_db.sh
```

#### Managed Database Backups

- **AWS RDS**: Automated backups enabled by default
- **Heroku Postgres**: Automatic daily backups
- **DigitalOcean**: Automated backups available

### File Backups

If using S3:
- Enable **S3 Versioning**
- Enable **S3 Lifecycle Policies** for cost optimization
- Consider **S3 Cross-Region Replication**

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Test connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Check Django connection
python manage.py dbshell
```

#### Static Files Not Loading

```bash
# Collect static files
python manage.py collectstatic --noinput

# Check permissions
chmod -R 755 staticfiles/
```

#### WebSocket Not Working

1. Check Redis connection
2. Verify CHANNEL_LAYERS configuration
3. Check ASGI application setup
4. Verify WebSocket URL routing

#### High Memory Usage

- Reduce Gunicorn workers
- Enable worker recycling
- Check for memory leaks
- Consider upgrading instance size

### Health Check Endpoint

Add to `membership_auto/urls.py`:

```python
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'database': 'connected' if check_db() else 'disconnected',
    })
```

## Post-Deployment

1. **Verify Endpoints**:
   - Test authentication
   - Test API endpoints
   - Test WebSocket connection

2. **Monitor Logs**:
   - Check for errors
   - Monitor response times
   - Watch for security alerts

3. **Set Up Alerts**:
   - Error rate thresholds
   - Response time alerts
   - Database connection failures

4. **Documentation**:
   - Update API documentation
   - Document any custom configurations
   - Share deployment details with team

## Rollback Procedure

1. **Database Rollback**:
   ```bash
   python manage.py migrate app_name migration_number
   ```

2. **Code Rollback**:
   ```bash
   git checkout previous-commit
   # Redeploy
   ```

3. **Restore from Backup**:
   ```bash
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup.sql
   ```

## Support

For deployment issues:
- Check application logs
- Review error tracking (Sentry)
- Consult platform-specific documentation
- Contact DevOps team

