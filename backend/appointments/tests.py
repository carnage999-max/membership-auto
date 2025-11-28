from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User
from vehicles.models import Vehicle
from .models import Appointment, Location
from datetime import datetime, timedelta
from django.utils import timezone


class AppointmentAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="appointment@example.com",
            password="testpass123",
        )
        self.client.force_authenticate(user=self.user)
        
        self.vehicle = Vehicle.objects.create(
            user=self.user,
            make="Honda",
            model="Civic",
            year=2020,
        )
        
        self.location = Location.objects.create(
            name="Main Service Center",
            address="123 Main St",
            lat=40.7128,
            lng=-74.0060,
        )

    def test_check_availability(self):
        """Test checking appointment availability"""
        url = reverse("appointment-availability")
        date = (timezone.now() + timedelta(days=7)).date()
        
        response = self.client.get(
            url,
            {"locationId": str(self.location.id), "date": date.isoformat()},
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("availableSlots", response.data)
        self.assertIsInstance(response.data["availableSlots"], list)

    def test_check_availability_missing_params(self):
        """Test availability check with missing parameters"""
        url = reverse("appointment-availability")
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_book_appointment(self):
        """Test booking an appointment"""
        url = reverse("appointment-book")
        start_time = timezone.now() + timedelta(days=7)
        
        data = {
            "vehicleId": str(self.vehicle.id),
            "locationId": str(self.location.id),
            "startTime": start_time.isoformat(),
            "services": ["oil_change", "tire_rotation"],
        }
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "scheduled")
        self.assertEqual(len(response.data["services"]), 2)

    def test_book_appointment_missing_fields(self):
        """Test booking appointment with missing required fields"""
        url = reverse("appointment-book")
        data = {"vehicleId": str(self.vehicle.id)}
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_appointments(self):
        """Test listing user's appointments"""
        Appointment.objects.create(
            user=self.user,
            vehicle=self.vehicle,
            location=self.location,
            start_time=timezone.now() + timedelta(days=7),
            status="scheduled",
        )
        Appointment.objects.create(
            user=self.user,
            vehicle=self.vehicle,
            location=self.location,
            start_time=timezone.now() + timedelta(days=14),
            status="scheduled",
        )
        
        url = reverse("appointment-list")
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
