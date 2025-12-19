# WebSocket Real-Time Chat API

## Overview

The Membership Auto platform includes a fully implemented WebSocket-based real-time chat system using Django Channels. This allows bidirectional communication between users and support staff without polling.

## Architecture

```
Frontend (Next.js)
    ↕ WebSocket Connection
Django Channels (ASGI)
    ↕ Channel Layer (In-Memory / Redis)
PostgreSQL (Message Persistence)
```

### Backend Components

- **Consumer**: `backend/chat/consumers.py` - `ChatConsumer` class handles WebSocket connections
- **Routing**: `backend/chat/routing.py` - WebSocket URL patterns
- **ASGI**: `backend/membership_auto/asgi.py` - Application entry point with protocol routing
- **Models**: `backend/chat/models.py` - `ChatThread` and `ChatMessage`
- **Channel Layer**: In-memory (development) or Redis (production)

### Frontend Components

- **Chat Page**: `frontend/app/dashboard/chat/page.tsx` - React component with WebSocket integration
- **Service**: `frontend/lib/api/chatService.ts` - WebSocket connection helper and REST API fallback

## WebSocket Connection

### Endpoint

```
ws://localhost:8000/chat/ws/?token={JWT_ACCESS_TOKEN}
```

For production with HTTPS:
```
wss://your-domain.com/chat/ws/?token={JWT_ACCESS_TOKEN}
```

### Authentication

WebSocket connections are authenticated using JWT tokens passed in the query string:

```javascript
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:8000/chat/ws/?token=${token}`);
```

**Backend validates the token** in `ChatConsumer.authenticate_token()` using `rest_framework_simplejwt`.

## Message Protocol

### Client → Server Messages

#### 1. Send Message

```json
{
  "type": "SEND",
  "threadId": "550e8400-e29b-41d4-a716-446655440000",
  "body": "Hello, I need help with my appointment",
  "attachments": ["https://example.com/image.jpg"]
}
```

**Fields:**
- `type` (string, required): Must be `"SEND"`
- `threadId` (UUID string, required): ID of the chat thread
- `body` (string, required): Message content
- `attachments` (array, optional): URLs to attached files

#### 2. Typing Indicator

```json
{
  "type": "TYPING",
  "threadId": "550e8400-e29b-41d4-a716-446655440000",
  "isTyping": true
}
```

**Fields:**
- `type` (string, required): Must be `"TYPING"`
- `threadId` (UUID string, required): ID of the chat thread
- `isTyping` (boolean, required): `true` when user starts typing, `false` when stops

### Server → Client Messages

#### 1. New Message

```json
{
  "type": "message",
  "message": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "threadId": "550e8400-e29b-41d4-a716-446655440000",
    "sender": "support",
    "body": "Hi! How can I help you today?",
    "attachments": [],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Fields:**
- `type` (string): `"message"`
- `message` (object): Message data
  - `id` (UUID string): Message ID
  - `threadId` (UUID string): Thread ID
  - `sender` (string): `"user"` or `"support"`
  - `body` (string): Message content
  - `attachments` (array): URLs to attachments
  - `timestamp` (ISO 8601 string): Message creation time

#### 2. Typing Indicator

```json
{
  "type": "typing",
  "threadId": "550e8400-e29b-41d4-a716-446655440000",
  "isTyping": true
}
```

## Frontend Implementation

### React Hook Example

```typescript
import { useState, useEffect, useRef } from 'react';
import chatService from '@/lib/api/chatService';
import { tokenStorage } from '@/lib/auth/tokenStorage';

function ChatComponent() {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    connectWebSocket();
    return () => disconnectWebSocket();
  }, []);

  const connectWebSocket = () => {
    const token = tokenStorage.getAccessToken();
    const wsUrl = chatService.getWebSocketUrl(token);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log('Connected');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => console.log('Disconnected');

    wsRef.current = ws;
  };

  const disconnectWebSocket = () => {
    wsRef.current?.close();
  };

  const sendMessage = (threadId: string, body: string) => {
    wsRef.current?.send(JSON.stringify({
      type: 'SEND',
      threadId,
      body,
    }));
  };

  return (/* Your UI */);
}
```

## Backend Configuration

### Development (In-Memory Channel Layer)

Already configured in `backend/membership_auto/settings.py`:

```python
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}
```

**Limitation**: Only works with a single server process. Not suitable for production.

### Production (Redis Channel Layer)

For production deployments with multiple workers, use Redis:

1. **Install Redis channel layer:**
   ```bash
   pip install channels-redis
   ```

2. **Update settings.py:**
   ```python
   CHANNEL_LAYERS = {
       "default": {
           "BACKEND": "channels_redis.core.RedisChannelLayer",
           "CONFIG": {
               "hosts": [("localhost", 6379)],
               # Or use environment variable
               # "hosts": [os.environ.get('REDIS_URL', 'redis://localhost:6379')],
           },
       },
   }
   ```

3. **Start Redis:**
   ```bash
   redis-server
   ```

## Running the Server

### Development

Use Daphne (included with Django Channels):

```bash
cd backend
daphne -b 0.0.0.0 -p 8000 membership_auto.asgi:application
```

Or Uvicorn:

```bash
pip install uvicorn
uvicorn membership_auto.asgi:application --host 0.0.0.0 --port 8000 --reload
```

### Production

Use Daphne with systemd or supervisor:

```bash
daphne -b 0.0.0.0 -p 8000 membership_auto.asgi:application
```

Or Uvicorn with Gunicorn:

```bash
gunicorn membership_auto.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Testing

### Manual Test with Browser Console

1. **Get JWT token:**
   ```bash
   curl -X POST http://localhost:8000/api/auth/login/ \
        -H 'Content-Type: application/json' \
        -d '{"username":"testuser","password":"testpass123"}'
   ```

2. **Open browser console and connect:**
   ```javascript
   const token = 'YOUR_JWT_TOKEN_HERE';
   const ws = new WebSocket(`ws://localhost:8000/chat/ws/?token=${token}`);
   
   ws.onopen = () => console.log('Connected!');
   ws.onmessage = (e) => console.log('Received:', JSON.parse(e.data));
   ws.onerror = (e) => console.error('Error:', e);
   
   // Send a message
   ws.send(JSON.stringify({
     type: 'SEND',
     threadId: 'YOUR_THREAD_ID',
     body: 'Test message'
   }));
   ```

### Python Test Script

Use the provided test script:

```bash
cd backend
pip install websockets  # If not already installed
python test_websocket.py
```

Follow the prompts to enter your JWT token.

## Security Considerations

1. **Token Validation**: Every connection validates JWT token on connect
2. **Origin Validation**: `AllowedHostsOriginValidator` prevents cross-origin attacks
3. **User Isolation**: Users can only access their own chat rooms (enforced by room naming: `chat_{user.id}`)
4. **HTTPS/WSS**: Always use WSS (WebSocket Secure) in production
5. **Token Expiration**: Clients must handle token refresh and reconnection

## Troubleshooting

### Connection Refused

- Ensure server is running with ASGI (Daphne/Uvicorn)
- Check `ALLOWED_HOSTS` in settings includes your domain
- Verify firewall allows WebSocket connections

### Messages Not Appearing

- Check channel layer is configured correctly
- Verify token is valid and not expired
- Ensure threadId exists in database
- Check browser console for errors

### Production Issues

- Use Redis channel layer instead of in-memory
- Configure Redis with persistence
- Monitor Redis memory usage
- Use WebSocket load balancer (nginx, HAProxy)

## API Fallback

The frontend automatically falls back to REST API if WebSocket fails:

```typescript
// Frontend sends via WebSocket when connected
wsRef.current?.send(JSON.stringify(message));

// Falls back to REST API
await chatService.sendMessage(threadId, { body });
```

REST endpoints:
- `POST /api/chat/threads/{threadId}/messages/` - Send message
- `GET /api/chat/threads/{threadId}/messages/` - Get messages

## Status

✅ **Fully Implemented**
- Backend WebSocket consumer with JWT auth
- Frontend React hooks with auto-reconnection
- Message persistence to PostgreSQL
- Real-time broadcasting via channel groups
- Typing indicators
- REST API fallback

## Next Steps (Optional Enhancements)

- [ ] Add read receipts (track when messages are seen)
- [ ] File upload for attachments
- [ ] Voice messages
- [ ] Message reactions/emoji
- [ ] Thread status updates (closed/reopened)
- [ ] Support agent assignment
- [ ] Message search
- [ ] Export conversation history

