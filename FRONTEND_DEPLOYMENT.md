# Frontend Deployment - AWS Amplify

Deploy the Membership Auto frontend (Next.js/React) to AWS Amplify.

## Why AWS Amplify?

✅ **Automatic CI/CD**: Deploys on every git push  
✅ **Built-in CDN**: Global content delivery  
✅ **SSL Certificates**: Automatic HTTPS  
✅ **Environment Variables**: Easy configuration  
✅ **Preview Deployments**: Test PRs before merge  
✅ **Cost-effective**: Free tier available  

## Prerequisites

- AWS Account
- GitHub repository with frontend code
- Backend API URL (your ECS ALB endpoint)

## Step 1: Prepare Frontend

### Environment Variables

Create `.env.production` in your frontend:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

### Update API Configuration

In your frontend API client, use environment variables:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### CORS Configuration

Ensure your backend allows Amplify domain:

```python
# backend/membership_auto/settings_production.py
CORS_ALLOWED_ORIGINS = [
    "https://main.d1234567890.amplifyapp.com",  # Amplify auto-generated domain
    "https://yourdomain.com",  # Your custom domain
]
```

## Step 2: Deploy via Amplify Console

### 2.1 Connect Repository

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Select your Git provider (GitHub, GitLab, Bitbucket)
4. Authorize and select your repository
5. Select the branch (usually `main`)

### 2.2 Configure Build Settings

Amplify will auto-detect Next.js. Verify build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/.next
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
      - frontend/.next/cache/**/*
```

If your frontend is in a subdirectory, update paths accordingly.

### 2.3 Environment Variables

In Amplify Console → App settings → Environment variables:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

### 2.4 Custom Domain (Optional)

1. Go to App settings → Domain management
2. Add your domain
3. Follow DNS configuration instructions
4. Amplify will provision SSL certificate automatically

## Step 3: Configure Rewrites for Next.js

If using Next.js App Router, add `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/.next
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
      - frontend/.next/cache/**/*
  customHeaders:
    - pattern: '**/*'
      headers:
        - key: 'X-Frame-Options'
          value: 'DENY'
        - key: 'X-Content-Type-Options'
          value: 'nosniff'
        - key: 'X-XSS-Protection'
          value: '1; mode=block'
        - key: 'Strict-Transport-Security'
          value: 'max-age=31536000; includeSubDomains'
  rewrites:
    - source: '/api/<*>'
      target: 'https://api.yourdomain.com/api/<*>'
      status: '200'
      type: 'PROXY'
```

## Step 4: WebSocket Configuration

For WebSocket connections, you'll need to proxy through Amplify or connect directly:

### Option 1: Direct WebSocket Connection

```typescript
// Connect directly to your ALB
const ws = new WebSocket('wss://api.yourdomain.com/chat/ws?token=' + token);
```

### Option 2: API Gateway WebSocket (Advanced)

For better WebSocket management, consider API Gateway WebSocket API in front of your ECS service.

## Step 5: Preview Deployments

Amplify automatically creates preview deployments for pull requests:

1. Create a PR in your repository
2. Amplify will build and deploy a preview
3. Share preview URL for testing
4. Preview is automatically deleted when PR is closed

## Step 6: Monitoring

### Amplify Console

- View build logs
- Monitor deployment status
- Check error rates

### Custom Analytics

Add analytics to your frontend:

```typescript
// lib/analytics.ts
export const trackEvent = (event: string, data?: any) => {
  if (typeof window !== 'undefined') {
    // Send to your analytics service
    console.log('Event:', event, data);
  }
};
```

## Step 7: CI/CD Integration

Amplify automatically deploys on:
- Push to main branch → Production
- Push to other branches → Preview
- Pull requests → Preview

You can also trigger manual deployments from the console.

## Cost Estimation

**AWS Amplify:**
- Free tier: 15 GB storage, 5 GB served per month
- Paid: $0.15/GB served, $0.023/GB stored
- Typical cost: $5-20/month for small-medium traffic

## Troubleshooting

### Build Failures

1. Check build logs in Amplify Console
2. Verify Node.js version (set in `package.json` or Amplify settings)
3. Check environment variables are set correctly

### API Connection Issues

1. Verify CORS settings in backend
2. Check API URL is correct
3. Verify backend is accessible from Amplify

### WebSocket Issues

1. Ensure ALB supports WebSocket (stickiness enabled)
2. Check WebSocket URL format
3. Verify token is included in connection

## Best Practices

1. **Use environment variables**: Never hardcode API URLs
2. **Enable preview deployments**: Test before merging
3. **Monitor build times**: Optimize if builds are slow
4. **Set up custom domain**: Better for SEO and branding
5. **Enable caching**: Reduce build times and costs

## Next Steps

- Set up custom domain
- Configure CDN caching rules
- Add monitoring and analytics
- Set up staging environment

