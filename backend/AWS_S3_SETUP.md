# AWS S3 Setup Guide for Vehicle Photo Uploads

## Overview
The application now supports uploading vehicle photos directly to AWS S3 using presigned URLs. This guide will help you set up S3 and configure the backend.

## Architecture
1. **Frontend** requests a presigned URL from the backend
2. **Backend** generates a presigned PUT URL with S3 credentials
3. **Frontend** uploads the file directly to S3 using the presigned URL
4. **Backend** stores the public S3 URL in the database with the vehicle

## AWS S3 Setup

### Step 1: Create an S3 Bucket

1. Log into AWS Console → S3
2. Click **"Create bucket"**
3. Configure:
   - **Bucket name**: `membership-auto-uploads` (must be globally unique)
   - **Region**: `us-east-1` (or your preferred region)
   - **Block Public Access**: UNCHECK "Block all public access" (we need public read access)
   - **Bucket Versioning**: Enable (optional, for file history)
   - **Encryption**: Enable (recommended)

### Step 2: Configure CORS

Add CORS policy to allow uploads from your frontend:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://yourdomain.com"
        ],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3600
    }
]
```

To add this:
1. Go to your bucket → **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Click **Edit** and paste the JSON above
4. Update `AllowedOrigins` with your production domain

### Step 3: Configure Bucket Policy

Add a bucket policy to allow public read access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::membership-auto-uploads/*"
        }
    ]
}
```

To add this:
1. Go to your bucket → **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit** and paste the JSON above
4. Replace `membership-auto-uploads` with your bucket name

### Step 4: Create IAM User

1. Go to AWS Console → IAM → Users
2. Click **"Add users"**
3. User name: `membership-auto-s3-uploader`
4. Select **"Access key - Programmatic access"**
5. Click **Next: Permissions**
6. Click **"Attach existing policies directly"**
7. Search and select: **AmazonS3FullAccess** (or create custom policy below)
8. Click **Next** → **Create user**
9. **SAVE** the Access Key ID and Secret Access Key

### Step 5: (Optional) Create Custom IAM Policy

For better security, create a restricted policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::membership-auto-uploads/*"
        },
        {
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::membership-auto-uploads"
        }
    ]
}
```

## Backend Configuration

### Update `.env` file

Add these variables to `backend/.env`:

```bash
# AWS S3 Configuration
USE_S3=true
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_STORAGE_BUCKET_NAME=membership-auto-uploads
AWS_S3_REGION_NAME=us-east-1

# Optional: CloudFront CDN (for faster global delivery)
# AWS_S3_CUSTOM_DOMAIN=d1234567890.cloudfront.net

# Optional: Presigned URL expiration (default: 3600 = 1 hour)
# AWS_S3_PRESIGNED_URL_EXPIRATION=3600
```

**Replace with your actual values:**
- `AWS_ACCESS_KEY_ID`: From IAM user creation (Step 4)
- `AWS_SECRET_ACCESS_KEY`: From IAM user creation (Step 4)
- `AWS_STORAGE_BUCKET_NAME`: Your bucket name from Step 1
- `AWS_S3_REGION_NAME`: Your bucket region from Step 1

### Install boto3 (if not already installed)

```bash
cd backend
pip install boto3
pip freeze > requirements.txt
```

### Apply Database Migration

```bash
cd backend
python3 manage.py migrate vehicles
```

## Testing

### Test S3 Upload from Backend

```bash
cd backend
python3 manage.py shell
```

```python
from files.views import get_s3_client
from django.conf import settings

# Test S3 connection
s3_client = get_s3_client()
response = s3_client.list_buckets()
print("Buckets:", [bucket['Name'] for bucket in response['Buckets']])

# Test presigned URL generation
url = s3_client.generate_presigned_url(
    'put_object',
    Params={
        'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
        'Key': 'test/hello.txt',
        'ContentType': 'text/plain',
    },
    ExpiresIn=3600
)
print("Presigned URL:", url)
```

### Test Upload from Frontend

1. Start the backend: `cd backend && python3 manage.py runserver`
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to: http://localhost:3000/dashboard/vehicles
4. Click **"Add Vehicle"**
5. Fill in vehicle details
6. Click **"Choose File"** and select an image
7. Submit the form
8. Check your S3 bucket - the image should be uploaded!

## File Structure in S3

Files are organized as:
```
uploads/{user_id}/{file_id}/{filename}
```

Example:
```
uploads/123e4567-e89b-12d3-a456-426614174000/789f1234-e56b-78c9-d012-345678901234/car-photo.jpg
```

## Production Considerations

### 1. Use CloudFront CDN (Optional but Recommended)

CloudFront provides:
- Faster global delivery
- HTTPS support
- Caching
- DDoS protection

Setup:
1. AWS Console → CloudFront → Create Distribution
2. Origin: Your S3 bucket
3. Copy the CloudFront domain (e.g., `d1234567890.cloudfront.net`)
4. Add to `.env`: `AWS_S3_CUSTOM_DOMAIN=d1234567890.cloudfront.net`

### 2. Use IAM Roles (for EC2/ECS/Lambda)

Instead of hardcoding credentials, use IAM roles:
1. Create an IAM role with S3 permissions
2. Attach the role to your EC2/ECS/Lambda
3. Remove `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from `.env`
4. Keep `USE_S3=true` and `AWS_STORAGE_BUCKET_NAME`

The boto3 client will automatically use the IAM role.

### 3. Enable Lifecycle Policies

Automatically delete old files to save costs:
1. S3 Bucket → Management tab → Lifecycle rules
2. Create rule to delete objects after 365 days (or your preference)

### 4. Enable S3 Versioning

Protect against accidental deletion:
1. S3 Bucket → Properties tab → Bucket Versioning
2. Enable versioning

### 5. Set Up Monitoring

1. S3 Bucket → Metrics tab → Enable Request Metrics
2. CloudWatch alarms for:
   - Upload failures
   - Storage size
   - Request counts

## Troubleshooting

### Error: "Failed to generate presigned URL"

**Causes:**
- Invalid AWS credentials
- IAM user lacks S3 permissions
- Bucket doesn't exist
- Wrong region

**Fix:**
1. Verify credentials in `.env`
2. Check IAM user has S3 permissions
3. Verify bucket name and region

### Error: "CORS policy blocked"

**Causes:**
- CORS not configured on S3 bucket
- Wrong origin in CORS policy

**Fix:**
1. Add CORS policy (see Step 2)
2. Update `AllowedOrigins` with your frontend URL

### Error: "Access Denied" when viewing image

**Causes:**
- Bucket policy missing
- Public access blocked

**Fix:**
1. Add bucket policy (see Step 3)
2. Uncheck "Block all public access"

### Images not uploading

**Check:**
1. Backend logs: `python3 manage.py runserver` (check terminal)
2. Frontend console: Browser DevTools → Console tab
3. Network tab: Check if presign request succeeds
4. S3 bucket: Verify file appears after upload

## Security Best Practices

1. ✅ **Use IAM roles** in production (not hardcoded keys)
2. ✅ **Restrict IAM permissions** to only what's needed
3. ✅ **Enable S3 encryption** at rest
4. ✅ **Use HTTPS** for all uploads (CloudFront helps)
5. ✅ **Validate file types** on frontend and backend
6. ✅ **Limit file sizes** to prevent abuse
7. ✅ **Scan uploads** for malware (optional: AWS S3 Virus Scanning)
8. ✅ **Monitor costs** with AWS Budgets

## Cost Estimation

**S3 Storage:**
- $0.023 per GB/month (standard storage)
- Average photo: 2-5 MB
- 1000 users × 3 vehicles × 3 MB = 9 GB = ~$0.21/month

**S3 Requests:**
- PUT requests: $0.005 per 1000
- GET requests: $0.0004 per 1000
- 1000 uploads/month = $0.005

**Data Transfer:**
- First 10 TB out: $0.09 per GB
- With CloudFront: First 1 TB free

**Total estimated cost:** < $5/month for small-medium traffic

## Support

For issues, check:
1. AWS S3 documentation: https://docs.aws.amazon.com/s3/
2. boto3 documentation: https://boto3.amazonaws.com/v1/documentation/api/latest/index.html
3. Backend logs for detailed error messages
