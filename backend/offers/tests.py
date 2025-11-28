from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User, Plan, Membership
from .models import Offer
from django.utils import timezone
from datetime import timedelta


class OfferAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="offer@example.com",
            password="testpass123",
        )
        self.client.force_authenticate(user=self.user)
        
        # Create a plan and membership
        self.plan = Plan.objects.create(
            name="Basic Plan",
            price_monthly=59,
            tier="basic",
        )
        Membership.objects.create(
            user=self.user,
            plan=self.plan,
            status="active",
        )

    def test_list_offers(self):
        """Test listing offers"""
        Offer.objects.create(
            title="Spring Special",
            description="20% off maintenance",
            expiry=timezone.now() + timedelta(days=30),
            eligible_memberships=["basic", "plus"],
        )
        Offer.objects.create(
            title="Summer Special",
            description="30% off repairs",
            expiry=timezone.now() + timedelta(days=60),
            eligible_memberships=["premium"],
        )
        
        url = reverse("offer-list")
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        # Should include offers for basic tier
        self.assertGreater(len(response.data), 0)

    def test_list_offers_expired_filtered(self):
        """Test that expired offers are filtered out"""
        Offer.objects.create(
            title="Expired Offer",
            description="This should not appear",
            expiry=timezone.now() - timedelta(days=1),
        )
        Offer.objects.create(
            title="Valid Offer",
            description="This should appear",
            expiry=timezone.now() + timedelta(days=30),
        )
        
        url = reverse("offer-list")
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only return valid offer
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Valid Offer")
