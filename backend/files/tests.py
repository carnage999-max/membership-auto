from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User


class FileAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="file@example.com",
            password="testpass123",
        )
        self.client.force_authenticate(user=self.user)

    def test_get_presigned_url(self):
        """Test getting presigned upload URL"""
        url = reverse("file-presign")
        data = {
            "filename": "receipt.jpg",
            "contentType": "image/jpeg",
        }
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("url", response.data)
        self.assertIn("method", response.data)
        self.assertIn("publicUrl", response.data)
        self.assertIn("fileId", response.data)
        self.assertEqual(response.data["method"], "PUT")

    def test_get_presigned_url_missing_filename(self):
        """Test presigned URL request without filename"""
        url = reverse("file-presign")
        data = {"contentType": "image/jpeg"}
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
