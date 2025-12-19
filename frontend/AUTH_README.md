# Authentication System Documentation

## Overview

This frontend uses JWT (JSON Web Token) authentication with automatic token refresh, integrated with the Django backend using `djangorestframework-simplejwt`.

## Architecture

### Files Structure

```
lib/
├── api/
│   ├── config.ts           # API configuration and endpoints
│   └── apiClient.ts        # Axios instance with interceptors
├── auth/
│   ├── tokenStorage.ts     # Token storage utilities
│   └── authService.ts      # Authentication API calls
├── context/
│   └── AuthContext.tsx     # Global auth state management
└── components/
    └── ProtectedRoute.tsx  # Route protection wrapper
```

## Key Features

### 1. **Token Management**
- Access tokens stored in `localStorage`
- Refresh tokens stored in `localStorage`
- Automatic token refresh on 401 errors
- Token expiration handling

### 2. **Automatic Token Refresh**
- Axios interceptor detects 401 responses
- Automatically calls refresh endpoint
- Queues failed requests during refresh
- Retries failed requests with new token
- Redirects to login if refresh fails

### 3. **Auth Context**
- Global authentication state
- `useAuth()` hook for components
- Login, register, logout functions
- User data persistence

### 4. **Protected Routes**
- `ProtectedRoute` component
- Automatic redirect to `/login`
- Loading state while checking auth

## Usage

### Setup Environment Variable

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

### Login

```tsx
import { useAuth } from '@/lib/context/AuthContext';

function LoginComponent() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // User is now authenticated
      router.push('/dashboard');
    } catch (err) {
      // Handle error
    }
  };
}
```

### Register

```tsx
import { useAuth } from '@/lib/context/AuthContext';

function SignupComponent() {
  const { register } = useAuth();

  const handleSignup = async () => {
    try {
      await register(name, email, phone, password, referralCode);
      // User is now authenticated
      router.push('/dashboard');
    } catch (err) {
      // Handle error
    }
  };
}
```

### Protect a Page

```tsx
import ProtectedRoute from '@/lib/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        {/* Your protected content */}
      </div>
    </ProtectedRoute>
  );
}
```

### Make Authenticated API Calls

```tsx
import apiClient from '@/lib/api/apiClient';

// Token is automatically added to headers
const response = await apiClient.get('/api/vehicles/');
const vehicles = response.data;
```

### Logout

```tsx
import { useAuth } from '@/lib/context/AuthContext';

function Header() {
  const { logout, user } = useAuth();

  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

## API Endpoints

### Authentication

- **POST** `/api/auth/register/` - Register new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "password": "securepass123",
    "referralCode": "REF-ABC123" // optional
  }
  ```

- **POST** `/api/auth/login/` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "securepass123"
  }
  ```

- **POST** `/api/auth/refresh/` - Refresh access token
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```

### Response Format

All auth endpoints return:

```json
{
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "membershipId": null,
    "referralCode": "REF-ABC123",
    "rewardsBalance": 0,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

## Token Refresh Flow

1. User makes API request
2. If token expired (401), interceptor catches it
3. Refresh token sent to `/api/auth/refresh/`
4. New access token received and stored
5. Original request retried with new token
6. If refresh fails, user redirected to `/login`

## Security Notes

- Tokens stored in `localStorage` (consider `httpOnly` cookies for production)
- All API calls over HTTPS in production
- Tokens automatically cleared on logout
- Expired tokens trigger automatic refresh
- Failed refresh redirects to login

## Future Enhancements

- [ ] Add biometric authentication for mobile
- [ ] Implement remember me with longer-lived tokens
- [ ] Add session timeout warnings
- [ ] Implement secure token storage (httpOnly cookies)
- [ ] Add rate limiting on auth endpoints
- [ ] Implement 2FA (Two-Factor Authentication)
