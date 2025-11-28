Chat WebSocket Protocol
=======================

Endpoint:
wss://api.membershipauto.example.com/chat/ws?token=ACCESS_TOKEN

Authentication:
- Include access token as query param or use subprotocol.

Message types:
- SEND: client -> server, payload { threadId, body, attachments }
- MESSAGE: server -> client, payload { id, threadId, body, sender, timestamp }
- TYPING: client -> server to indicate typing state
- ACK: server -> client to acknowledge delivery/read

Reconnect:
- Exponential backoff, resume token to fetch missed messages.

Fallback:
- If WebSocket unavailable, poll GET /chats/threads/{id}/messages?since={timestamp}

