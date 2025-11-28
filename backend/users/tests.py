from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import User, Plan, Membership
import secrets


class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            name="Test User",
        )

    def test_user_creation(self):
        self.assertEqual(self.user.email, "test@example.com")
        self.assertTrue(self.user.check_password("testpass123"))
        self.assertIsNotNone(self.user.referral_code)
        self.assertEqual(self.user.role, "member")

    def test_referral_code_uniqueness(self):
        user2 = User.objects.create_user(
            email="test2@example.com",
            password="testpass123",
        )
        self.assertNotEqual(self.user.referral_code, user2.referral_code)


class AuthAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.refresh_url = reverse("refresh")

    def test_register_user(self):
        """Test user registration"""
        data = {
            "name": "John Doe",
            "email": "john@example.com",
            "password": "securepass123",
            "phone": "+1234567890",
        }
        response = self.client.post(self.register_url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("accessToken", response.data)
        self.assertIn("refreshToken", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "john@example.com")
        self.assertIsNotNone(response.data["user"]["referralCode"])

    def test_register_duplicate_email(self):
        """Test registration with duplicate email"""
        User.objects.create_user(
            email="existing@example.com",
            password="pass123",
        )
        
        data = {
            "email": "existing@example.com",
            "password": "pass123",
        }
        response = self.client.post(self.register_url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_register_missing_fields(self):
        """Test registration with missing required fields"""
        data = {"email": "test@example.com"}  # Missing password
        response = self.client.post(self.register_url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        """Test successful login"""
        User.objects.create_user(
            email="login@example.com",
            password="testpass123",
        )
        
        data = {
            "email": "login@example.com",
            "password": "testpass123",
        }
        response = self.client.post(self.login_url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("accessToken", response.data)
        self.assertIn("refreshToken", response.data)

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {
            "email": "wrong@example.com",
            "password": "wrongpass",
        }
        response = self.client.post(self.login_url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", response.data)

    def test_refresh_token(self):
        """Test token refresh"""
        user = User.objects.create_user(
            email="refresh@example.com",
            password="testpass123",
        )
        
        # Get refresh token by logging in
        login_data = {
            "email": "refresh@example.com",
            "password": "testpass123",
        }
        login_response = self.client.post(self.login_url, login_data, format="json")
        refresh_token = login_response.data["refreshToken"]
        
        # Refresh access token
        refresh_data = {"refreshToken": refresh_token}
        response = self.client.post(self.refresh_url, refresh_data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("accessToken", response.data)

    def test_refresh_token_invalid(self):
        """Test refresh with invalid token"""
        data = {"refreshToken": "invalid-token"}
        response = self.client.post(self.refresh_url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
