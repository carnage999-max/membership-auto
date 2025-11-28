# AWS Deployment Guide - Membership Auto Backend

**Recommended: ECS with Fargate** for Daphne (ASGI) + WebSocket support.

## Why ECS over EC2?

✅ **Better for Daphne/WebSocket**: ECS with Application Load Balancer handles WebSocket connections natively  
✅ **Auto-scaling**: Automatically scales based on traffic  
✅ **Managed infrastructure**: No server management  
✅ **Container orchestration**: Easy updates and rollbacks  
✅ **Cost-effective**: Pay only for what you use (Fargate)  
✅ **Health checks**: Built-in container health monitoring  

EC2 requires manual scaling, server management, and more complex WebSocket setup.

## Architecture Overview

```
Internet → CloudFront → ALB → ECS Fargate (Daphne) → Neon DB
                              ↓
                           ElastiCache (Redis for WebSocket)
```

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Docker installed locally
- GitHub repository (for CI/CD)

## Step 1: Neon Database Setup

### Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Note your connection string:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

### Connection Pooling (Recommended)

Neon supports connection pooling. Use the pooled connection string:
```
postgresql://user:password@ep-xxx-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require
```

### Environment Variables for Neon

```bash
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=your-password
DB_HOST=ep-xxx-pooler.us-east-2.aws.neon.tech
DB_PORT=5432
```

## Step 2: Prepare Docker Image for ECS

### Update Dockerfile for Daphne

Create/update `backend/Dockerfile`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install daphne for ASGI (already in requirements, but ensure it's there)
RUN pip install daphne

# Copy project
COPY . .

# Create directories
RUN mkdir -p staticfiles logs

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/schema/')"

# Run Daphne (ASGI server for WebSocket support)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "membership_auto.asgi:application"]
```

### Build and Test Locally

```bash
cd backend
docker build -t membership-auto:latest .
docker run -p 8000:8000 --env-file .env membership-auto:latest
```

## Step 3: Create AWS Resources

### 3.1 Create ECR Repository

```bash
aws ecr create-repository --repository-name membership-auto-backend --region us-east-1
```

### 3.2 Push Docker Image to ECR

```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag membership-auto:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/membership-auto-backend:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/membership-auto-backend:latest
```

### 3.3 Create ElastiCache Redis Cluster

For WebSocket support with Channels:

```bash
aws elasticache create-cache-cluster \
    --cache-cluster-id membership-auto-redis \
    --engine redis \
    --cache-node-type cache.t3.micro \
    --num-cache-nodes 1 \
    --region us-east-1
```

Note the Redis endpoint (e.g., `membership-auto-redis.xxxxx.cache.amazonaws.com:6379`)

### 3.4 Create Application Load Balancer

1. Go to EC2 → Load Balancers → Create Load Balancer
2. Choose **Application Load Balancer**
3. Configure:
   - **Name**: membership-auto-alb
   - **Scheme**: Internet-facing
   - **IP address type**: IPv4
   - **VPC**: Your VPC
   - **Subnets**: At least 2 public subnets
   - **Security groups**: Allow HTTP (80), HTTPS (443)
   - **Listeners**: HTTP (80) and HTTPS (443)
   - **Target group**: Create new (we'll configure in ECS task)

### 3.5 Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name membership-auto-cluster --region us-east-1
```

## Step 4: Create ECS Task Definition

Create `backend/ecs-task-definition.json`:

```json
{
  "family": "membership-auto-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "membership-auto-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/membership-auto-backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DJANGO_SETTINGS_MODULE",
          "value": "membership_auto.settings_production"
        },
        {
          "name": "USE_POSTGRES",
          "value": "true"
        },
        {
          "name": "USE_S3",
          "value": "true"
        }
      ],
      "secrets": [
        {
          "name": "SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:membership-auto/secret-key"
        },
        {
          "name": "DB_NAME",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:membership-auto/db-name"
        },
        {
          "name": "DB_USER",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:membership-auto/db-user"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:membership-auto/db-password"
        },
        {
          "name": "DB_HOST",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:membership-auto/db-host"
        },
        {
          "name": "AWS_ACCESS_KEY_ID",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:membership-auto/aws-access-key"
        },
        {
          "name": "AWS_SECRET_ACCESS_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:membership-auto/aws-secret-key"
        },
        {
          "name": "AWS_STORAGE_BUCKET_NAME",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:membership-auto/s3-bucket"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/membership-auto-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8000/api/schema/')\""],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### Register Task Definition

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region us-east-1
```

## Step 5: Store Secrets in AWS Secrets Manager

```bash
# Create secrets
aws secretsmanager create-secret --name membership-auto/secret-key --secret-string "your-secret-key" --region us-east-1
aws secretsmanager create-secret --name membership-auto/db-name --secret-string "neondb" --region us-east-1
aws secretsmanager create-secret --name membership-auto/db-user --secret-string "neondb_owner" --region us-east-1
aws secretsmanager create-secret --name membership-auto/db-password --secret-string "your-neon-password" --region us-east-1
aws secretsmanager create-secret --name membership-auto/db-host --secret-string "ep-xxx-pooler.us-east-2.aws.neon.tech" --region us-east-1
aws secretsmanager create-secret --name membership-auto/aws-access-key --secret-string "your-access-key" --region us-east-1
aws secretsmanager create-secret --name membership-auto/aws-secret-key --secret-string "your-secret-key" --region us-east-1
aws secretsmanager create-secret --name membership-auto/s3-bucket --secret-string "your-bucket-name" --region us-east-1
```

## Step 6: Create ECS Service

```bash
aws ecs create-service \
    --cluster membership-auto-cluster \
    --service-name membership-auto-backend \
    --task-definition membership-auto-backend \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<account-id>:targetgroup/membership-auto-tg/xxx,containerName=membership-auto-backend,containerPort=8000" \
    --region us-east-1
```

## Step 7: Configure ALB for WebSocket

1. Go to Target Group → membership-auto-tg
2. **Health checks**:
   - Path: `/api/schema/`
   - Protocol: HTTP
   - Port: 8000
3. **Attributes**:
   - **Stickiness**: Enable (for WebSocket connections)
   - **Deregistration delay**: 30 seconds

## Step 8: Update Settings for Production

Create `membership_auto/settings_production.py`:

```python
from .settings import *
import os

# Security
DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Database - Neon DB
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
            'sslmode': 'require',  # Neon requires SSL
        },
        # Connection pooling for Neon
        'CONN_MAX_AGE': 600,  # 10 minutes
    }
}

# Channel Layers - Redis (ElastiCache)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(os.environ.get('REDIS_HOST', 'localhost'), 6379)],
        },
    },
}

# CORS - Update with your Amplify frontend domain
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')

# AWS S3
USE_S3 = True
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')

# Static files (served via ALB or CloudFront)
STATIC_ROOT = '/app/staticfiles'
STATIC_URL = '/static/'

# Security headers
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

## Step 9: Run Migrations

```bash
# Get task ID
TASK_ID=$(aws ecs list-tasks --cluster membership-auto-cluster --service-name membership-auto-backend --query 'taskArns[0]' --output text | cut -d'/' -f3)

# Run migrations
aws ecs execute-command \
    --cluster membership-auto-cluster \
    --task $TASK_ID \
    --container membership-auto-backend \
    --command "python manage.py migrate" \
    --interactive
```

## Step 10: Set Up CloudFront (Optional but Recommended)

1. Create CloudFront distribution
2. Origin: Your ALB
3. Behaviors:
   - Cache static files (`/static/*`)
   - Don't cache API endpoints (`/api/*`)
4. SSL Certificate: Use ACM certificate

## Cost Estimation

**ECS Fargate (2 tasks):**
- 0.5 vCPU, 1GB RAM: ~$30/month

**ALB:**
- ~$16/month base + data transfer

**ElastiCache Redis (cache.t3.micro):**
- ~$15/month

**Neon DB:**
- Free tier or ~$19/month (Pro plan)

**S3:**
- Storage + requests: ~$5-10/month

**Total: ~$85-100/month** (excluding CloudFront)

## Auto-Scaling

Create auto-scaling policy:

```bash
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/membership-auto-cluster/membership-auto-backend \
    --min-capacity 2 \
    --max-capacity 10 \
    --region us-east-1
```

## Next Steps

- Set up CI/CD (see CI_CD.md)
- Configure CloudFront for static files
- Set up monitoring (CloudWatch)
- Configure backups

