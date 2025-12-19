# Secrets & Environment Variables Management

## **IMPORTANT: NEVER commit secrets to GitHub!**

### .gitignore Rules
```bash
# Make sure your .gitignore includes:
.env
.env.local
.env.production
.env*.local
ssl/
*.key
*.pem
```

---

## **Secrets You Need**

### 1. **SECRET_KEY** (Django)
```bash
# Generate using:
python3 -c 'import secrets; print(secrets.token_urlsafe(50))'

# Output example:
# _y7k-Qj8x9mK2pL5nR4sT6vW1zB3cD6eF9gH2jK5lM8
```

### 2. **Database URL** (Neon PostgreSQL)
```
Format:
postgresql://username:password@ep-xxx.neon.tech:5432/dbname?sslmode=require

Get from: Neon Console → Connection String
```

### 3. **AWS IAM Credentials**
```
Go to: AWS Console → IAM → Users → Your User → Create Access Key

Save:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
```

### 4. **Domain & SSL**
```
- Domain name (yourdomain.com)
- SSL certificate (from Let's Encrypt or self-signed)
- SSL private key
```

---

## **AWS Secrets Manager Integration (Optional)**

If you want to use AWS Secrets Manager instead of .env files:

### 1. Create Secret in AWS Console
```
Secrets Manager → Store a new secret

Secret type: Other type of secrets
Secret name: membership-auto/production
Secret value (JSON):
{
  "SECRET_KEY": "your-secret-key",
  "DATABASE_URL": "postgresql://...",
  "AWS_ACCESS_KEY_ID": "AKIA...",
  "AWS_SECRET_ACCESS_KEY": "...",
  "AWS_S3_CUSTOM_DOMAIN": "..."
}
```

### 2. Grant EC2 IAM Role Access
```
IAM → Roles → Create role for EC2
Permissions:
  - secretsmanager:GetSecretValue
  - secretsmanager:DescribeSecret
Resource: arn:aws:secretsmanager:region:account:secret:membership-auto/*
```

### 3. Attach Role to EC2 Instance
```
EC2 Console → Instance → Security → Modify IAM Role
```

### 4. Update Docker Container
```dockerfile
# In backend Dockerfile, add:
RUN pip install boto3

# In entrypoint script, fetch from Secrets Manager:
import json
import boto3
import os

client = boto3.client('secretsmanager', region_name='us-east-1')

try:
    secret = client.get_secret_value(SecretId='membership-auto/production')
    secrets = json.loads(secret['SecretString'])
    for key, value in secrets.items():
        os.environ[key] = value
except Exception as e:
    print(f"Error fetching secrets: {e}")
```

---

## **Environment Variables by Service**

### Backend (.env)
```env
# Django
DEBUG=false
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require

# AWS S3
USE_S3=true
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=membership-auto-bckt
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=membership-auto-bckt.s3.amazonaws.com
AWS_S3_PRESIGNED_URL_EXPIRATION=3600
```

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_WS_BASE_URL=wss://yourdomain.com
```

### Admin (.env.production)
```env
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com
```

---

## **How to Safely Set Secrets on EC2**

### Method 1: Via SSH and nano
```bash
ssh -i membership-auto-key.pem ubuntu@ec2-ip
cd /home/ubuntu/membership-auto
nano .env

# Then paste your secrets carefully
# Save: Ctrl+X → Y → Enter
```

### Method 2: Via SCP (Secure Copy)
```bash
# Create .env locally with all secrets filled in
# Then copy to EC2:
scp -i membership-auto-key.pem .env ubuntu@ec2-ip:/home/ubuntu/membership-auto/

# Then SSH to verify it's there
ssh -i membership-auto-key.pem ubuntu@ec2-ip
cat /home/ubuntu/membership-auto/.env
```

### Method 3: Via AWS Parameter Store
```bash
# Store in Parameter Store
aws ssm put-parameter \
  --name /membership-auto/production/database-url \
  --value "postgresql://..." \
  --type "SecureString"

# Retrieve in EC2
aws ssm get-parameter \
  --name /membership-auto/production/database-url \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text
```

---

## **Rotating Secrets**

### Rotating AWS Credentials
```bash
# 1. Create new IAM user with same permissions
# 2. Generate new access key
# 3. Update .env with new credentials
# 4. Restart backend container
docker-compose restart backend

# 5. Delete old access key from IAM console
# 6. Save new key somewhere safe
```

### Rotating SECRET_KEY
```bash
# 1. Generate new key
python3 -c 'import secrets; print(secrets.token_urlsafe(50))'

# 2. Update .env
# 3. This invalidates all existing sessions (ok for production)
# 4. Restart backend
docker-compose restart backend
```

### Rotating Database Password
```
1. Go to Neon Console
2. Reset password
3. Update DATABASE_URL in .env
4. Verify connection works
5. Restart backend
docker-compose exec backend python manage.py dbshell
```

---

## **Backup Secrets**

### Create Secure Backup
```bash
# Encrypt and backup secrets
gpg --symmetric --cipher-algo AES256 .env
# This creates .env.gpg

# Store .env.gpg in secure location (not GitHub!)
# Store passphrase separately

# To restore
gpg --decrypt .env.gpg > .env
```

### AWS Backup (Recommended)
```bash
# Store in AWS Secrets Manager
aws secretsmanager create-secret \
  --name membership-auto-backup \
  --secret-string file://.env

# List all secrets
aws secretsmanager list-secrets

# Retrieve
aws secretsmanager get-secret-value \
  --secret-id membership-auto-backup \
  --query SecretString \
  --output text > .env.backup
```

---

## **Security Best Practices**

✅ **DO:**
- Use strong random secrets (50+ characters)
- Store secrets in .env (NOT in .env.template)
- Add .env to .gitignore
- Use separate credentials for production
- Rotate secrets regularly (quarterly minimum)
- Use AWS Secrets Manager for automatic rotation
- Backup secrets securely
- Use HTTPS/SSL for all traffic
- Use AWS IAM roles instead of hardcoded credentials
- Enable MFA on AWS console
- Use separate AWS accounts for dev/prod

❌ **DON'T:**
- Commit .env to GitHub
- Share credentials via email or chat
- Use same credentials for dev and prod
- Use simple/predictable secrets
- Log secrets in application logs
- Commit docker build files with secrets
- Use HTTP (only HTTPS)
- Commit private keys (.pem files)
- Use credentials in Docker images
- Share AWS account credentials

---

## **Emergency: Credentials Compromised**

If you accidentally commit or expose credentials:

```bash
# 1. Stop application immediately
docker-compose down

# 2. Remove exposed credentials
# - Regenerate Django SECRET_KEY
# - Rotate AWS access keys
# - Reset database password
# - Regenerate SSL certificates if needed

# 3. Check GitHub history
git log --all --full-history -- .env
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all

# 4. Force push (careful!)
git push origin --force --all

# 5. Update .env with new secrets
nano .env

# 6. Restart application
docker-compose up -d

# 7. Monitor logs for any suspicious activity
docker-compose logs -f
```

---

## **Verification Checklist**

Before deploying to production:

- [ ] .env file created with all secrets filled in
- [ ] .env NOT in git repository
- [ ] .env added to .gitignore
- [ ] SECRET_KEY is strong (50+ characters)
- [ ] DATABASE_URL is from Neon (with ?sslmode=require)
- [ ] AWS credentials valid and tested
- [ ] S3 bucket name correct
- [ ] Domain names in ALLOWED_HOSTS
- [ ] CORS origins configured
- [ ] SSL certificates downloaded
- [ ] .env backed up securely
- [ ] No secrets in docker-compose.yml
- [ ] No secrets in Dockerfile
- [ ] No secrets in code comments

