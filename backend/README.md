# Membership Auto Backend API

Django REST API for Membership Auto - a subscription-based vehicle service & repair platform.

## Table of Contents

- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [WebSocket Chat](#websocket-chat)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Development](#development)

## Quick Start

### Prerequisites

- Python 3.12+
- PostgreSQL (optional, SQLite used by default)
- Virtual environment

### Installation

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source env/bin/activate  # On Windows: env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### API Documentation

Interactive API documentation (Swagger UI) is available at:
- **Swagger UI**: `http://localhost:8000/api/docs/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. All protected endpoints require a valid access token in the Authorization header.

### Authentication Flow

1. **Register** or **Login** to get access and refresh tokens
2. Include the access token in subsequent requests
3. When the access token expires, use the refresh token to get a new one

### Register

```http
POST /api/auth/register/
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "+1234567890",
  "referralCode": "REF-ABC123"  // Optional
}
```

**Response:**
```json
{
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "membershipId": null,
    "referralCode": "REF-XYZ789",
    "rewardsBalance": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Login

```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123",
  "deviceId": "device-uuid-123"  // Optional, for push notifications
}
```

**Response:** Same as register response

### Refresh Token

```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Using Access Token

Include the token in the Authorization header:

```http
GET /api/vehicles/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## API Endpoints

### Base URL

All API endpoints are prefixed with `/api/`

### Vehicles

#### List Vehicles

```http
GET /api/vehicles/
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user": "user-uuid",
    "vin": "1HGBH41JXMN109186",
    "make": "Honda",
    "model": "Civic",
    "trim": "EX",
    "year": 2020,
    "licensePlate": "ABC123",
    "odometer": 15000.50,
    "dongleId": null,
    "dongleConnectionType": null,
    "fuelType": "gasoline",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Add Vehicle

```http
POST /api/vehicles/
Authorization: Bearer <token>
Content-Type: application/json

{
  "vin": "1HGBH41JXMN109186",
  "make": "Honda",
  "model": "Civic",
  "trim": "EX",
  "year": 2020,
  "odometer": 15000.50,
  "fuelType": "gasoline"
}
```

#### Link OBD Dongle

```http
POST /api/vehicles/{vehicleId}/link-dongle/
Authorization: Bearer <token>
Content-Type: application/json

{
  "dongleId": "dongle-123",
  "connectionType": "BLE"  // BLE, WIFI, or CLOUD
}
```

### Telematics

#### Upload Telemetry Batch

```http
POST /api/telematics/{vehicleId}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle-uuid",
  "startTimestamp": 1704067200000,  // Unix timestamp in milliseconds
  "endTimestamp": 1704067800000,
  "samples": [
    {
      "t": 1704067200000,
      "speed": 45.5,
      "fuelRate": 2.3,
      "odometer": 15000.5
    }
  ]
}
```

**Response:**
```json
{
  "message": "Telemetry batch accepted"
}
```

### Appointments

#### Check Availability

```http
GET /api/appointments/availability/?locationId={locationId}&date=2024-01-15
Authorization: Bearer <token>
```

**Response:**
```json
{
  "availableSlots": [
    {
      "start": "2024-01-15T08:00:00Z",
      "end": "2024-01-15T08:30:00Z"
    },
    {
      "start": "2024-01-15T08:30:00Z",
      "end": "2024-01-15T09:00:00Z"
    }
  ]
}
```

#### Book Appointment

```http
POST /api/appointments/book/
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle-uuid",
  "locationId": "location-uuid",
  "startTime": "2024-01-15T10:00:00Z",
  "services": ["oil_change", "tire_rotation"]
}
```

#### List Appointments

```http
GET /api/appointments/upcoming/
Authorization: Bearer <token>
```

### Offers

#### List Offers

```http
GET /api/offers/?vehicleId={vehicleId}&lat=40.7128&lng=-74.0060
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Spring Maintenance Special",
    "description": "20% off all maintenance services",
    "terms": "Valid until March 31, 2024",
    "expiry": "2024-03-31T23:59:59Z",
    "eligibleMemberships": ["basic", "plus"],
    "locations": ["location-uuid-1"],
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Referrals

#### Get Referral Info

```http
GET /api/referrals/me/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": "REF-ABC123",
  "link": "https://membershipauto.com/r/REF-ABC123",
  "referrals": [
    {
      "id": "uuid",
      "referrerUser": "user-uuid",
      "referredUser": "referred-user-uuid",
      "code": "REF-ABC123",
      "status": "credited",
      "rewardsApplied": {},
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Chat

#### List Chat Threads

```http
GET /api/chat/threads/
Authorization: Bearer <token>
```

#### Get Messages

```http
GET /api/chat/threads/{threadId}/messages/?since=2024-01-01T00:00:00Z
Authorization: Bearer <token>
```

#### Send Message

```http
POST /api/chat/threads/{threadId}/messages/
Authorization: Bearer <token>
Content-Type: application/json

{
  "body": "Hello, I need help with my vehicle",
  "attachments": []
}
```

### Files

#### Get Presigned Upload URL

```http
POST /api/files/presign/
Authorization: Bearer <token>
Content-Type: application/json

{
  "filename": "receipt.jpg",
  "contentType": "image/jpeg"
}
```

**Response:**
```json
{
  "url": "https://s3.example.com/presigned-url",
  "method": "PUT",
  "publicUrl": "https://s3.example.com/uploads/...",
  "fileId": "file-uuid"
}
```

## WebSocket Chat

The chat system supports real-time messaging via WebSocket.

### Connection

```javascript
// JavaScript example
const token = 'your-access-token';
const ws = new WebSocket(`ws://localhost:8000/chat/ws?token=${token}`);
```

### Message Types

#### Send Message

```json
{
  "type": "SEND",
  "threadId": "thread-uuid",
  "body": "Hello, I need help",
  "attachments": []
}
```

#### Receive Message

```json
{
  "type": "MESSAGE",
  "id": "message-uuid",
  "threadId": "thread-uuid",
  "body": "Hello, how can I help?",
  "sender": "support",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Typing Indicator

```json
{
  "type": "TYPING",
  "user": "user-uuid",
  "threadId": "thread-uuid"
}
```

### Example WebSocket Client

```javascript
const ws = new WebSocket(`ws://localhost:8000/chat/ws?token=${accessToken}`);

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'MESSAGE') {
    console.log('New message:', data);
  } else if (data.type === 'TYPING') {
    console.log('User typing:', data.user);
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket disconnected');
};

// Send a message
ws.send(JSON.stringify({
  type: 'SEND',
  threadId: 'thread-uuid',
  body: 'Hello!'
}));
```

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `202 Accepted` - Request accepted for processing
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Common Errors

#### Invalid Credentials

```http
POST /api/auth/login/
Status: 401 Unauthorized

{
  "error": "Invalid credentials"
}
```

#### Missing Required Field

```http
POST /api/vehicles/
Status: 400 Bad Request

{
  "vin": ["This field is required."]
}
```

#### Resource Not Found

```http
GET /api/vehicles/{invalid-id}/
Status: 404 Not Found

{
  "error": "Vehicle not found"
}
```

## Testing

The backend includes comprehensive test coverage for all API endpoints and models.

### Run All Tests

```bash
python manage.py test
```

### Run Tests for Specific Apps

```bash
python manage.py test users
python manage.py test vehicles
python manage.py test appointments
python manage.py test offers
python manage.py test referrals
python manage.py test chat
python manage.py test files
```

### Test Coverage

The test suite includes:
- **Authentication**: Registration, login, token refresh
- **Vehicles**: CRUD operations, dongle linking, telematics upload
- **Appointments**: Availability checking, booking, listing
- **Offers**: Listing and filtering by membership tier
- **Referrals**: Code generation, application, status tracking
- **Chat**: Thread management, message sending/receiving
- **Files**: Presigned URL generation

All 34 tests should pass. Run `python manage.py test --verbosity=2` for detailed output.

## Development

### Database

By default, the project uses SQLite. To use PostgreSQL:

1. Set environment variable: `USE_POSTGRES=true`
2. Configure database credentials via environment variables:
   - `DB_NAME=membership_auto`
   - `DB_USER=postgres`
   - `DB_PASSWORD=postgres`
   - `DB_HOST=localhost`
   - `DB_PORT=5432`

### Environment Variables

Create a `.env` file in the backend directory:

```env
USE_POSTGRES=false
DB_NAME=membership_auto
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key-here
DEBUG=True

# AWS S3 Configuration (for file uploads)
USE_S3=false
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=  # Optional: CloudFront domain
AWS_S3_PRESIGNED_URL_EXPIRATION=3600  # URL expiration in seconds
```

### AWS S3 Configuration

The file upload endpoint supports AWS S3 for storing user-uploaded files (receipts, photos, etc.).

#### Option 1: Environment Variables (Recommended for Development)

Set the following environment variables:

```bash
export USE_S3=true
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_STORAGE_BUCKET_NAME=your-bucket-name
export AWS_S3_REGION_NAME=us-east-1
```

Or add them to your `.env` file (see above).

#### Option 2: IAM Role (Recommended for Production)

If running on AWS infrastructure (EC2, ECS, Lambda), you can use an IAM role instead of credentials:

1. **Create an IAM Role** with S3 permissions:
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
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

2. **Attach the role** to your EC2 instance, ECS task, or Lambda function

3. **Set only these environment variables** (no credentials needed):
   ```bash
   export USE_S3=true
   export AWS_STORAGE_BUCKET_NAME=your-bucket-name
   export AWS_S3_REGION_NAME=us-east-1
   ```

The boto3 client will automatically use the IAM role credentials.

#### Option 3: AWS Credentials File

You can also use the AWS credentials file at `~/.aws/credentials`:

```ini
[default]
aws_access_key_id = your-access-key-id
aws_secret_access_key = your-secret-access-key
```

Then set:
```bash
export USE_S3=true
export AWS_STORAGE_BUCKET_NAME=your-bucket-name
export AWS_S3_REGION_NAME=us-east-1
```

#### S3 Bucket Setup

1. **Create an S3 bucket** in your AWS account
2. **Configure CORS** (if uploading from web browsers):
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["PUT", "POST", "GET"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
3. **Set bucket policy** (if needed for public access):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

#### Development Mode

If `USE_S3=false` or AWS credentials are not configured, the endpoint returns mock URLs for development/testing. This allows you to develop without AWS setup.

### CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`

To add more origins, update `CORS_ALLOWED_ORIGINS` in `settings.py`.

### JWT Token Lifetime

- Access Token: 1 hour
- Refresh Token: 7 days

Configure in `settings.py` under `SIMPLE_JWT`.

## Support

For API documentation and examples, visit:
- Swagger UI: `http://localhost:8000/api/docs/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

For issues or questions, contact the development team.

