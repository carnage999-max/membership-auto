from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User
from .models import ChatThread, ChatMessage


class ChatAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="chat@example.com",
            password="testpass123",
        )
        self.client.force_authenticate(user=self.user)
        
        self.thread = ChatThread.objects.create(
            user=self.user,
            subject="Vehicle Issue",
        )

    def test_list_chat_threads(self):
        """Test listing user's chat threads"""
        ChatThread.objects.create(
            user=self.user,
            subject="Another Issue",
        )
        
        url = reverse("chat-thread-list")
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 2)

    def test_get_messages(self):
        """Test getting messages from a thread"""
        ChatMessage.objects.create(
            thread=self.thread,
            sender="user",
            body="Hello, I need help",
        )
        ChatMessage.objects.create(
            thread=self.thread,
            sender="support",
            body="How can I assist you?",
        )
        
        url = reverse("chat-message-list", kwargs={"thread_id": self.thread.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)

    def test_send_message(self):
        """Test sending a message"""
        url = reverse("chat-message-list", kwargs={"thread_id": self.thread.id})
        data = {
            "body": "I have a question about my vehicle",
            "attachments": [],
        }
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["body"], "I have a question about my vehicle")
        self.assertEqual(response.data["sender"], "user")
        
        # Verify message was saved
        message = ChatMessage.objects.get(id=response.data["id"])
        self.assertIsNotNone(message)

    def test_send_message_missing_body(self):
        """Test sending message without body"""
        url = reverse("chat-message-list", kwargs={"thread_id": self.thread.id})
        data = {"attachments": []}
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_messages_unauthorized_thread(self):
        """Test getting messages from another user's thread"""
        other_user = User.objects.create_user(
            email="other@example.com",
            password="testpass123",
        )
        other_thread = ChatThread.objects.create(
            user=other_user,
            subject="Other User's Thread",
        )
        
        url = reverse("chat-message-list", kwargs={"thread_id": other_thread.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
