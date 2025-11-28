from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User
from .models import Vehicle, TelematicsSnapshot
from datetime import datetime
from django.utils import timezone


class VehicleAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="vehicle@example.com",
            password="testpass123",
        )
        self.client.force_authenticate(user=self.user)
        self.vehicle_list_url = reverse("vehicle-list-create")

    def test_create_vehicle(self):
        """Test creating a vehicle"""
        data = {
            "vin": "1HGBH41JXMN109186",
            "make": "Honda",
            "model": "Civic",
            "year": 2020,
            "odometer": 15000.50,
            "fuelType": "gasoline",
        }
        response = self.client.post(self.vehicle_list_url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["make"], "Honda")
        self.assertEqual(response.data["model"], "Civic")
        self.assertEqual(str(response.data["user"]), str(self.user.id))

    def test_list_vehicles(self):
        """Test listing user's vehicles"""
        Vehicle.objects.create(
            user=self.user,
            make="Honda",
            model="Civic",
            year=2020,
        )
        Vehicle.objects.create(
            user=self.user,
            make="Toyota",
            model="Camry",
            year=2021,
        )
        
        response = self.client.get(self.vehicle_list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_vehicles_other_user(self):
        """Test that users only see their own vehicles"""
        other_user = User.objects.create_user(
            email="other@example.com",
            password="testpass123",
        )
        Vehicle.objects.create(
            user=other_user,
            make="Ford",
            model="F-150",
            year=2022,
        )
        
        response = self.client.get(self.vehicle_list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_link_dongle(self):
        """Test linking OBD dongle to vehicle"""
        vehicle = Vehicle.objects.create(
            user=self.user,
            make="Honda",
            model="Civic",
            year=2020,
        )
        
        url = reverse("vehicle-link-dongle", kwargs={"id": vehicle.id})
        data = {
            "dongleId": "dongle-123",
            "connectionType": "BLE",
        }
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["dongleId"], "dongle-123")
        self.assertEqual(response.data["dongleConnectionType"], "BLE")
        
        # Verify in database
        vehicle.refresh_from_db()
        self.assertEqual(vehicle.dongle_id, "dongle-123")

    def test_link_dongle_invalid_vehicle(self):
        """Test linking dongle to non-existent vehicle"""
        url = reverse("vehicle-link-dongle", kwargs={"id": "00000000-0000-0000-0000-000000000000"})
        data = {
            "dongleId": "dongle-123",
            "connectionType": "BLE",
        }
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_link_dongle_invalid_connection_type(self):
        """Test linking dongle with invalid connection type"""
        vehicle = Vehicle.objects.create(
            user=self.user,
            make="Honda",
            model="Civic",
            year=2020,
        )
        
        url = reverse("vehicle-link-dongle", kwargs={"id": vehicle.id})
        data = {
            "dongleId": "dongle-123",
            "connectionType": "INVALID",
        }
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_telematics_upload(self):
        """Test uploading telemetry batch"""
        vehicle = Vehicle.objects.create(
            user=self.user,
            make="Honda",
            model="Civic",
            year=2020,
        )
        
        url = reverse("telematics-upload", kwargs={"vehicleId": vehicle.id})
        timestamp = int(datetime.now().timestamp() * 1000)
        data = {
            "vehicleId": str(vehicle.id),
            "startTimestamp": timestamp - 60000,
            "endTimestamp": timestamp,
            "samples": [
                {
                    "t": timestamp - 30000,
                    "speed": 45.5,
                    "fuelRate": 2.3,
                    "odometer": 15000.5,
                },
                {
                    "t": timestamp,
                    "speed": 50.0,
                    "fuelRate": 2.5,
                    "odometer": 15001.0,
                },
            ],
        }
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        
        # Verify snapshots were created
        snapshots = TelematicsSnapshot.objects.filter(vehicle=vehicle)
        self.assertGreater(snapshots.count(), 0)

    def test_telematics_upload_unauthorized_vehicle(self):
        """Test uploading telemetry for another user's vehicle"""
        other_user = User.objects.create_user(
            email="other@example.com",
            password="testpass123",
        )
        vehicle = Vehicle.objects.create(
            user=other_user,
            make="Honda",
            model="Civic",
            year=2020,
        )
        
        url = reverse("telematics-upload", kwargs={"vehicleId": vehicle.id})
        timestamp = int(datetime.now().timestamp() * 1000)
        data = {
            "vehicleId": str(vehicle.id),
            "startTimestamp": timestamp - 60000,
            "endTimestamp": timestamp,
        }
        response = self.client.post(url, data, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
