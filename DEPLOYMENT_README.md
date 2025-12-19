# Complete Deployment Package - Quick Start

Everything you need to deploy Membership Auto on AWS EC2 with Docker is in this directory.

---

## **Files Included**

```
membership-auto/
├── backend/
│   ├── Dockerfile (Build backend container)
│   ├── requirements.txt
│   └── membership_auto/
│       └── settings.py (Needs DEBUG=false)
│
├── frontend/
│   ├── Dockerfile (Build frontend container)
│   ├── package.json
│   └── .env.production (Set env vars here)
│
├── admin/
│   ├── Dockerfile (Build admin container)
│   ├── package.json
│   └── .env.production (Set env vars here)
│
├── docker-compose.yml (Orchestrates all containers)
├── nginx.conf (Reverse proxy configuration)
├── .env.production (Template for environment variables)
│
├── AWS_DEPLOYMENT_GUIDE.md (Step-by-step guide)
├── DEPLOYMENT_CHECKLIST.md (Things to verify)
├── SECRETS_MANAGEMENT.md (How to handle secrets)
└── README.md (This file)
```

---

## **Quick Start (5 Minutes)**

### 1. Prepare Secrets
```bash
# Get these ready:
- Neon PostgreSQL DATABASE_URL
- AWS IAM Access Key & Secret Key
- Domain name
```

### 2. Copy & Edit Template
```bash
cp .env.production .env
nano .env

# Fill in all values
```

### 3. SSH to EC2 & Deploy
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Go to project
cd /home/ubuntu/membership-auto

# Deploy
docker-compose up -d

# Check status
docker-compose ps
```

### 4. Run Migrations
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### 5. Access Application
```
- Frontend: https://yourdomain.com
- Admin: https://yourdomain.com/admin
- API: https://yourdomain.com/api/
```

---

## **Detailed Steps**

For comprehensive instructions, see [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md)

**Step-by-step covers:**
1. Launch EC2 instance
2. Install Docker & Docker Compose
3. Configure SSL certificates
4. Deploy with Docker Compose
5. Set up domain & DNS
6. Verify everything works

---

## **What Gets Deployed**

### Docker Containers (All on one EC2)
```
┌─ Nginx (Reverse Proxy, Port 80/443)
│  ├─ Routes / → Frontend (Port 3001)
│  ├─ Routes /admin → Admin (Port 3000)
│  └─ Routes /api, /chat/ws → Backend (Port 8000)
│
├─ Frontend (Next.js, Port 3001)
│  └─ Member dashboard
│
├─ Admin (Next.js, Port 3000)
│  └─ Admin dashboard
│
└─ Backend (Django + Daphne, Port 8000)
   ├─ REST API
   ├─ WebSocket chat
   └─ File uploads to S3
```

### External Services
- **Database:** Neon PostgreSQL (free tier)
- **Files:** AWS S3
- **Domain:** Your domain provider
- **DNS:** AWS Route 53 (optional)

---

## **Before Deployment Checklist**

### Required
- [ ] AWS account with EC2 access
- [ ] Domain name
- [ ] Neon PostgreSQL account & DATABASE_URL
- [ ] AWS IAM credentials with S3 access
- [ ] S3 bucket created (membership-auto-bckt)

### Prepared
- [ ] Repository cloned/pushed to GitHub
- [ ] Code ready in frontend/, admin/, backend/
- [ ] All Dockerfiles present
- [ ] docker-compose.yml present
- [ ] nginx.conf present

### Secrets Ready
- [ ] Django SECRET_KEY generated
- [ ] DATABASE_URL from Neon
- [ ] AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY
- [ ] Domain name for ALLOWED_HOSTS

---

## **Estimated Costs**

| Resource | Estimated Monthly Cost |
|----------|----------------------|
| EC2 t3.small (24/7) | ~$15 |
| Data transfer (100GB) | ~$10 |
| Neon PostgreSQL free tier | $0 |
| AWS S3 (10GB) | ~$0.30 |
| **Total** | **~$25/month** |

---

## **Architecture Overview**

```
Internet (Users)
    │
    ├─ HTTPS ──→ AWS Route 53 (DNS)
    │                 │
    ├─ yourdomain.com ─┘
    └─ admin.yourdomain.com
         │
    AWS EC2 Instance (Ubuntu)
         │
    ┌────┴────┬────────┐
    │          │        │
  Nginx    Frontend  Admin   Backend
(Nginx    (Port      (Port   (Port
 80/443)  3001)      3000)   8000)
    │      (Next.js)
    │      Member       (Next.js)
    │      Dashboard    Admin Panel
    └──────────────────────────┘
           Containers
           (Docker)

External:
- Neon PostgreSQL (Database)
- AWS S3 (File Storage)
```

---

## **Key Features Deployed**

✅ **Member Dashboard**
- 14 pages with full functionality
- Service scheduling & appointments
- Real-time chat with WebSocket
- Vehicle management
- Interactive location map

✅ **Admin Dashboard**
- 10 pages with full functionality
- Member management
- Analytics & revenue tracking
- Chat support
- Service & appointment management

✅ **Backend API**
- 60+ REST endpoints
- JWT authentication
- WebSocket for chat
- S3 file uploads
- PostgreSQL database

✅ **Security**
- HTTPS/SSL encryption
- JWT tokens
- CORS configured
- Rate limiting
- Security headers

---

## **Deployment Timeline**

| Phase | Duration |
|-------|----------|
| AWS Setup | 15 min |
| Docker Install | 10 min |
| Project Clone | 5 min |
| Configuration | 15 min |
| Docker Build | 15 min |
| Database Setup | 10 min |
| DNS Configuration | 10 min |
| Testing | 15 min |
| **Total** | **~1.5 hours** |

---

## **Post-Deployment**

### Monitoring
```bash
# Check containers
docker-compose ps

# View logs
docker-compose logs -f

# Monitor resources
docker stats
```

### Maintenance
```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Update code
git pull origin main
docker-compose build
docker-compose up -d

# Check health
curl https://yourdomain.com/health
```

### Troubleshooting
```bash
# Container logs
docker-compose logs backend

# SSH into container
docker-compose exec backend bash

# Run migrations
docker-compose exec backend python manage.py migrate

# Check database
docker-compose exec backend python manage.py dbshell
```

---

## **Important: Secrets Management**

**CRITICAL:** 
- Never commit `.env` file to GitHub
- Add `.env` to `.gitignore`
- Store secrets securely
- Rotate credentials regularly
- Use AWS Secrets Manager for production

See [SECRETS_MANAGEMENT.md](SECRETS_MANAGEMENT.md) for details

---

## **Getting Help**

### Deployment Issues
1. Check [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md)
2. Review logs: `docker-compose logs -f`
3. Verify secrets in `.env` file
4. Check Docker container status: `docker-compose ps`

### Documentation
- Docker Compose: https://docs.docker.com/compose/
- AWS EC2: https://docs.aws.amazon.com/ec2/
- Neon PostgreSQL: https://neon.tech/docs/
- Let's Encrypt: https://letsencrypt.org/

---

## **Next Steps After Deployment**

1. ✅ Test all functionality
2. ✅ Set up automated backups
3. ✅ Configure CloudWatch monitoring
4. ✅ Set up SSL auto-renewal
5. ✅ Plan for scaling
6. ✅ Document your setup
7. ✅ Brief team on production URL
8. ✅ Monitor logs regularly

---

## **Quick Reference Commands**

```bash
# Deploy
docker-compose up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild specific service
docker-compose build --no-cache backend
docker-compose up -d backend

# Database migrations
docker-compose exec backend python manage.py migrate

# Create admin user
docker-compose exec backend python manage.py createsuperuser

# SSH into container
docker-compose exec backend bash

# Check backend logs
docker-compose logs -f backend

# Reload Nginx
docker-compose exec nginx nginx -s reload

# View system resources
docker stats
```

---

## **Support & Resources**

- **AWS Documentation:** https://docs.aws.amazon.com/
- **Docker:** https://docs.docker.com/
- **Django:** https://docs.djangoproject.com/
- **Next.js:** https://nextjs.org/docs
- **PostgreSQL:** https://www.postgresql.org/docs/

---

## **Deployment Status**

When deployment is complete, you'll have:

```
✅ Production environment running
✅ Frontend accessible at https://yourdomain.com
✅ Admin accessible at https://yourdomain.com/admin
✅ API responding at https://yourdomain.com/api
✅ WebSocket chat working
✅ SSL/HTTPS secured
✅ Database connected
✅ S3 file uploads working
✅ Auto-restart on failure
✅ Logs accessible
✅ Monitoring configured
```

**You're now production-ready! 🚀**

