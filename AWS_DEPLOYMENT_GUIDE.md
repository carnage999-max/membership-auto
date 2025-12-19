# Complete AWS Deployment Guide - Membership Auto

This guide covers deploying the entire application (Frontend, Admin, Backend) on a single AWS EC2 instance using Docker.

## **Architecture**

```
AWS EC2 Instance (t3.small)
│
├── Docker Container: Nginx (Reverse Proxy, Port 80/443)
│   ├── → Frontend (Port 3001)
│   ├── → Admin (Port 3000)
│   └── → Backend (Port 8000)
│
└── Docker Containers (Docker Compose)
    ├── Frontend (Next.js, Port 3001)
    ├── Admin (Next.js, Port 3000)
    ├── Backend (Django + Daphne, Port 8000)
    └── Nginx (Reverse Proxy)
```

---

## **Prerequisites**

- AWS Account with billing enabled
- Domain name (e.g., yourdomain.com)
- GitHub repository with your code
- Neon PostgreSQL database URL
- AWS IAM credentials for S3

---

## **Step 1: Launch EC2 Instance via AWS Console**

### 1.1 Go to AWS Console
- Login: https://console.aws.amazon.com
- Navigate to: **EC2 → Instances → Launch Instances**

### 1.2 Configure Instance
```
Name: membership-auto-production
AMI: Ubuntu 22.04 LTS (t3.small or larger)
Instance Type: t3.small (1 GB RAM, 1 vCPU) - minimum
  Or t3.medium (2 GB RAM) - recommended
Key Pair: Create new → membership-auto-key.pem
  (Download and keep safe!)
```

### 1.3 Network Settings
```
VPC: Default VPC
Security Group: Create new
  Inbound Rules:
  - SSH (22): 0.0.0.0/0 (your IP preferred)
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0
```

### 1.4 Storage
```
Root volume: 30 GB (gp3)
```

### 1.5 Launch
- Click "Launch Instance"
- Wait for instance to be "Running"
- Get the **Public IP** (e.g., 54.123.45.67)

---

## **Step 2: Connect to EC2 via SSH**

```bash
# Change key permissions
chmod 400 membership-auto-key.pem

# SSH into instance
ssh -i membership-auto-key.pem ubuntu@your-instance-public-ip

# Example:
ssh -i membership-auto-key.pem ubuntu@54.123.45.67
```

---

## **Step 3: Install Docker & Docker Compose**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Logout and login again
exit
ssh -i membership-auto-key.pem ubuntu@your-instance-public-ip

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

---

## **Step 4: Clone Repository**

```bash
# Install git
sudo apt install -y git

# Clone your repository
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/membership-auto.git
cd membership-auto

# Verify structure
ls -la
# Should show: frontend/, admin/, backend/, docker-compose.yml, nginx.conf
```

---

## **Step 5: Create SSL Certificates**

### Option A: Self-Signed (Testing)
```bash
sudo mkdir -p /home/ubuntu/membership-auto/ssl

# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /home/ubuntu/membership-auto/ssl/key.pem \
  -out /home/ubuntu/membership-auto/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Org/CN=yourdomain.com"

sudo chown ubuntu:ubuntu /home/ubuntu/membership-auto/ssl/*
```

### Option B: Let's Encrypt (Production)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-standalone

# Get certificate (stop Nginx first if running)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy to project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /home/ubuntu/membership-auto/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /home/ubuntu/membership-auto/ssl/key.pem
sudo chown ubuntu:ubuntu /home/ubuntu/membership-auto/ssl/*
```

---

## **Step 6: Configure Environment Variables**

```bash
cd /home/ubuntu/membership-auto

# Copy template
cp .env.production .env

# Edit with your values
nano .env
```

**Fill in:**
```env
# Backend
SECRET_KEY=generate-a-new-one (use: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
AWS_ACCESS_KEY_ID=your-iam-key
AWS_SECRET_ACCESS_KEY=your-iam-secret

# Frontend/Admin
FRONTEND_API_URL=https://yourdomain.com
FRONTEND_WS_URL=wss://yourdomain.com
ADMIN_API_URL=https://yourdomain.com
```

---

## **Step 7: Set Up Environment File for Docker**

```bash
# Create .env file for docker-compose
cat > /home/ubuntu/membership-auto/.env << EOF
DEBUG=false
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(50))')
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
DATABASE_URL=postgresql://neonuser:password@ep-xxx.neon.tech:5432/dbname?sslmode=require
USE_S3=true
AWS_ACCESS_KEY_ID=your-iam-key
AWS_SECRET_ACCESS_KEY=your-iam-secret
AWS_STORAGE_BUCKET_NAME=membership-auto-bckt
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=membership-auto-bckt.s3.amazonaws.com
FRONTEND_API_URL=https://yourdomain.com
FRONTEND_WS_URL=wss://yourdomain.com
ADMIN_API_URL=https://yourdomain.com
EOF
```

---

## **Step 8: Update Backend Settings for Production**

```bash
# Edit backend settings
nano /home/ubuntu/membership-auto/backend/membership_auto/settings.py
```

**Update:**
```python
# Line with DEBUG
DEBUG = False

# Add allowed hosts
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com', 'ec2-instance-ip']

# Update database URL (should be read from .env)
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    'https://yourdomain.com',
    'https://admin.yourdomain.com',
    'https://www.yourdomain.com',
]

# Static files
STATIC_ROOT = '/app/staticfiles'
STATIC_URL = '/static/'
```

---

## **Step 9: Build and Deploy with Docker Compose**

```bash
cd /home/ubuntu/membership-auto

# Build all images
docker-compose build

# Pull latest code (if needed)
git pull origin main

# Rebuild if needed
docker-compose build --no-cache

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## **Step 10: Run Database Migrations**

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

---

## **Step 11: Configure Domain (AWS Route 53)**

### 11.1 Go to Route 53
```
AWS Console → Route 53 → Hosted Zones → Your Domain
```

### 11.2 Create A Record
```
Name: yourdomain.com
Type: A
Value: your-ec2-public-ip
TTL: 300
```

### 11.3 Create CNAME Records
```
Name: www.yourdomain.com
Type: CNAME
Value: yourdomain.com
TTL: 300

Name: admin.yourdomain.com
Type: A
Value: your-ec2-public-ip
TTL: 300
```

---

## **Step 12: Verify Deployment**

```bash
# Check Docker containers
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs admin
docker-compose logs nginx

# Test endpoints
curl https://yourdomain.com
curl https://yourdomain.com/api/auth/login/
curl -i https://yourdomain.com/health
```

---

## **Step 13: Monitor & Maintain**

### Auto-restart on reboot
```bash
# Enable docker service
sudo systemctl enable docker

# Add to crontab for auto-startup
crontab -e

# Add:
@reboot cd /home/ubuntu/membership-auto && docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Nginx access logs
docker-compose logs nginx
```

### Update SSL certificates (Let's Encrypt)
```bash
# Renew certificate
sudo certbot renew --force-renewal

# Copy to project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /home/ubuntu/membership-auto/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /home/ubuntu/membership-auto/ssl/key.pem
sudo chown ubuntu:ubuntu /home/ubuntu/membership-auto/ssl/*

# Reload nginx
docker-compose exec nginx nginx -s reload
```

---

## **Step 14: Backup & Monitoring**

### Backup database
```bash
# Create backup script
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR
pg_dump $DATABASE_URL > $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql
# Upload to S3
aws s3 cp $BACKUP_DIR s3://your-backup-bucket/ --recursive
EOF

chmod +x /home/ubuntu/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup.sh
```

### Monitor with CloudWatch (AWS Console)
```
EC2 Console → Your Instance → Monitoring
- CPU Utilization
- Network traffic
- Disk usage
```

---

## **Troubleshooting**

### Containers won't start
```bash
docker-compose logs
docker-compose logs --tail 50 backend
```

### Permission denied errors
```bash
# Fix Docker permissions
sudo usermod -aG docker ubuntu
newgrp docker
```

### Database connection error
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
docker-compose exec backend python -c "import psycopg2; print('Database OK')"
```

### Out of memory
```bash
# Check memory
free -h

# Upgrade instance to t3.medium or larger
```

### SSL certificate expired
```bash
# Renew
sudo certbot renew --force-renewal
```

---

## **Summary of Deployment**

✅ EC2 instance running Ubuntu  
✅ Docker & Docker Compose installed  
✅ Application cloned from GitHub  
✅ SSL certificates configured  
✅ Environment variables set  
✅ Database migrations run  
✅ All services deployed and running  
✅ Domain configured in Route 53  
✅ HTTPS working  
✅ WebSocket chat working  

---

## **Cost Estimate (Monthly)**

| Service | Cost |
|---------|------|
| EC2 t3.small (730 hrs) | ~$15 |
| Data transfer (100 GB) | ~$10 |
| Route 53 (12k queries) | ~$0.50 |
| **Total** | **~$25.50/month** |

---

## **Next Steps**

1. Monitor application performance
2. Set up automated backups
3. Configure CloudWatch alarms
4. Plan for scaling (if needed)
5. Set up CI/CD pipeline (GitHub Actions)

