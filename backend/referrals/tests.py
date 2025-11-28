from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User
from .models import Referral


class ReferralAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.referrer = User.objects.create_user(
            email="referrer@example.com",
            password="testpass123",
        )
        self.client.force_authenticate(user=self.referrer)

    def test_get_referral_info(self):
        """Test getting user's referral information"""
        url = reverse("referral-me")
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("code", response.data)
        self.assertIn("link", response.data)
        self.assertIn("referrals", response.data)
        self.assertEqual(response.data["code"], self.referrer.referral_code)
        self.assertIn(self.referrer.referral_code, response.data["link"])

    def test_apply_referral(self):
        """Test applying referral code during signup"""
        new_user = User.objects.create_user(
            email="newuser@example.com",
            password="testpass123",
        )
        
        url = reverse("referral-apply")
        data = {
            "code": self.referrer.referral_code,
            "newUserId": str(new_user.id),
        }
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["code"], self.referrer.referral_code)
        self.assertEqual(response.data["status"], "signed_up")
        
        # Verify referral was created
        referral = Referral.objects.get(
            referrer_user=self.referrer,
            referred_user=new_user,
        )
        self.assertIsNotNone(referral)

    def test_apply_invalid_referral_code(self):
        """Test applying invalid referral code"""
        new_user = User.objects.create_user(
            email="newuser2@example.com",
            password="testpass123",
        )
        
        url = reverse("referral-apply")
        data = {
            "code": "INVALID-CODE",
            "newUserId": str(new_user.id),
        }
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
