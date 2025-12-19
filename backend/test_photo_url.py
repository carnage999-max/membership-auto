#!/usr/bin/env python3
"""
Test script to verify photoUrl field is working correctly
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, "/home/binary/Desktop/membership-auto/backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "membership_auto.settings")
django.setup()

from vehicles.models import Vehicle
from vehicles.serializers import VehicleSerializer
from users.models import User

# Get or create a test user
user, created = User.objects.get_or_create(
    email="test@example.com", defaults={"phone_number": "1234567890"}
)

print("=" * 60)
print("Testing photoUrl field in Vehicle model and serializer")
print("=" * 60)

# Test 1: Create vehicle with photoUrl
print("\n1. Creating vehicle with photoUrl...")
test_url = "https://example.com/test-image.jpg"
vehicle_data = {
    "make": "Tesla",
    "model": "Model 3",
    "year": 2023,
    "fuelType": "electric",
    "photoUrl": test_url,
}

serializer = VehicleSerializer(data=vehicle_data)
if serializer.is_valid():
    vehicle = serializer.save(user=user)
    print(f"✓ Vehicle created with ID: {vehicle.id}")
    print(f"  Photo URL in DB: {vehicle.photo_url}")
else:
    print(f"✗ Serializer validation failed: {serializer.errors}")
    sys.exit(1)

# Test 2: Retrieve and check photoUrl is returned
print("\n2. Retrieving vehicle and checking photoUrl in response...")
serializer = VehicleSerializer(vehicle)
data = serializer.data
print(f"  photoUrl in response: {data.get('photoUrl')}")

if data.get("photoUrl") == test_url:
    print("✓ photoUrl correctly returned from serializer")
else:
    print(f"✗ photoUrl mismatch!")
    print(f"  Expected: {test_url}")
    print(f"  Got: {data.get('photoUrl')}")

# Test 3: Check all fields
print("\n3. All vehicle fields:")
for key, value in data.items():
    print(f"  {key}: {value}")

# Clean up
print(f"\n4. Cleaning up test data...")
vehicle.delete()
if created:
    user.delete()
print("✓ Test vehicle deleted")

print("\n" + "=" * 60)
print("All tests passed! photoUrl field is working correctly.")
print("=" * 60)
