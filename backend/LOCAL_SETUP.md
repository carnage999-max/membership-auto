# Backend Local Testing Setup Guide

## Quick Start (SQLite - Development)

### 1. Install Dependencies

```bash
cd /home/binary/Desktop/membership-auto/backend

# Create virtual environment (if not already created)
python3 -m venv env

# Activate virtual environment
source env/bin/activate  # On Linux/Mac
# OR
env\Scripts\activate  # On Windows

# Install requirements
pip install -r requirements.txt
```

### 2. Run Migrations

```bash
# Apply database migrations (creates SQLite db.sqlite3 file)
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Superuser (Optional but Recommended)

```bash
python manage.py createsuperuser
# Follow prompts to create admin account
```

### 4. Run Development Server

```bash
python manage.py runserver
# Server will start at http://localhost:8000
```

### 5. Test the API

- API Docs: http://localhost:8000/api/docs/
- Admin Panel: http://localhost:8000/admin/

## Environment Variables (Optional for Local)

Your backend is already configured to use SQLite by default. No `.env` file needed for local testing!

However, if you want to customize settings, create `backend/.env`:

```bash
# Database (leave empty to use SQLite)
USE_POSTGRES=false

# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here

# CORS (already configured for localhost:3000)
# No changes needed

# AWS S3 (optional, leave empty for local file storage)
USE_S3=false
```

## Testing Authentication Endpoints

### Register a New User

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "password": "testpass123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "testpass123"
  }'
```

### Refresh Token

```bash
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

## Frontend Setup

1. **Update Frontend Environment:**

```bash
cd /home/binary/Desktop/membership-auto/frontend

# Create .env.local file
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
```

2. **Run Frontend:**

```bash
npm run dev
# Frontend will start at http://localhost:3000
```

## Testing the Full Flow

1. **Start Backend:**
   ```bash
   cd backend
   source env/bin/activate
   python manage.py runserver
   ```

2. **Start Frontend (in new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Registration:**
   - Visit: http://localhost:3000/login
   - Click "Sign Up" tab
   - Fill in the form
   - Submit
   - Should redirect to dashboard on success

4. **Test Login:**
   - Visit: http://localhost:3000/login
   - Click "Sign In" tab
   - Enter credentials
   - Submit
   - Should redirect to dashboard on success

## Switching to PostgreSQL (Production)

When you're ready to deploy, update your backend `.env`:

```bash
# Production Database
USE_POSTGRES=true
DB_NAME=membership_auto_prod
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_HOST=your-db-host.amazonaws.com
DB_PORT=5432

# Production Settings
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# S3 for File Storage
USE_S3=true
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
```

Then run migrations again:
```bash
python manage.py migrate
```

## Troubleshooting

### "No module named 'rest_framework'"
```bash
pip install -r requirements.txt
```

### "Table doesn't exist"
```bash
python manage.py migrate
```

### CORS Error in Browser
Your backend is already configured for `localhost:3000`. If using a different port:
- Update `CORS_ALLOWED_ORIGINS` in `settings.py`

### 401 Unauthorized
- Check token in browser dev tools (Application > Local Storage)
- Token might be expired (refresh should happen automatically)
- Backend might not be running

## Current Configuration Status

✅ **Already Configured:**
- SQLite database (default, no setup needed)
- JWT authentication with SimpleJWT
- CORS for localhost:3000
- User model with referral system
- All API endpoints ready

✅ **Ready for Testing:**
- Registration endpoint
- Login endpoint
- Token refresh endpoint
- All protected endpoints

🔧 **Optional Enhancements:**
- Create some test users via admin panel
- Add sample plans/memberships
- Test with Postman or the API docs

---

**You're all set!** Just run the migrations and start the server. Everything else is already configured for local development with SQLite.
