import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatThread, ChatMessage

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get token from query string
        token = self.scope.get("query_string", b"").decode().split("token=")[-1].split("&")[0]
        
        if not token:
            await self.close()
            return

        # Authenticate user
        user = await self.authenticate_token(token)
        if not user:
            await self.close()
            return

        self.user = user
        self.room_group_name = f"chat_{user.id}"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get("type")

            if message_type == "SEND":
                thread_id = data.get("threadId")
                body = data.get("body")
                attachments = data.get("attachments", [])

                if thread_id and body:
                    message = await self.save_message(thread_id, body, attachments)
                    if message:
                        # Send message to room group
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                "type": "chat_message",
                                "message": {
                                    "id": str(message.id),
                                    "threadId": str(thread_id),
                                    "body": message.body,
                                    "sender": message.sender,
                                    "timestamp": message.created_at.isoformat(),
                                }
                            }
                        )

            elif message_type == "TYPING":
                # Broadcast typing indicator
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "typing_indicator",
                        "user": str(self.user.id),
                        "threadId": data.get("threadId"),
                    }
                )

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Invalid JSON"}))

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "type": "MESSAGE",
            **event["message"]
        }))

    async def typing_indicator(self, event):
        # Send typing indicator to WebSocket
        await self.send(text_data=json.dumps({
            "type": "TYPING",
            "user": event["user"],
            "threadId": event.get("threadId"),
        }))

    @database_sync_to_async
    def authenticate_token(self, token):
        """Authenticate JWT token and return user"""
        from rest_framework_simplejwt.tokens import AccessToken
        try:
            access_token = AccessToken(token)
            user_id = access_token["user_id"]
            return User.objects.get(id=user_id)
        except Exception:
            return None

    @database_sync_to_async
    def save_message(self, thread_id, body, attachments):
        """Save message to database"""
        try:
            thread = ChatThread.objects.get(id=thread_id, user=self.user)
            message = ChatMessage.objects.create(
                thread=thread,
                sender="user",
                body=body,
                attachments=attachments,
            )
            return message
        except ChatThread.DoesNotExist:
            return None

