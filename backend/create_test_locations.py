"""
Script to populate test data for locations
Run this to add sample service locations to the database
"""

import os
import django
import sys

# Setup Django
sys.path.append("/home/binary/Desktop/membership-auto/backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "membership_auto.settings")
django.setup()

from appointments.models import Location


def create_test_locations():
    """Create sample service locations"""

    locations_data = [
        {
            "name": "Downtown Service Center",
            "address": "123 Main Street, Downtown, CA 90001",
            "lat": 34.0522,
            "lng": -118.2437,
            "phone": "2135551234",
            "hours": {
                "monday": "8:00 AM - 6:00 PM",
                "tuesday": "8:00 AM - 6:00 PM",
                "wednesday": "8:00 AM - 6:00 PM",
                "thursday": "8:00 AM - 6:00 PM",
                "friday": "8:00 AM - 6:00 PM",
                "saturday": "9:00 AM - 4:00 PM",
                "sunday": "Closed",
            },
        },
        {
            "name": "Westside Auto Care",
            "address": "456 West Avenue, Westside, CA 90025",
            "lat": 34.0619,
            "lng": -118.4487,
            "phone": "3105552345",
            "hours": {
                "monday": "7:00 AM - 7:00 PM",
                "tuesday": "7:00 AM - 7:00 PM",
                "wednesday": "7:00 AM - 7:00 PM",
                "thursday": "7:00 AM - 7:00 PM",
                "friday": "7:00 AM - 7:00 PM",
                "saturday": "8:00 AM - 5:00 PM",
                "sunday": "9:00 AM - 3:00 PM",
            },
        },
        {
            "name": "North Valley Service",
            "address": "789 Valley Road, North Valley, CA 91401",
            "lat": 34.1936,
            "lng": -118.5426,
            "phone": "8185553456",
            "hours": {
                "monday": "8:00 AM - 6:00 PM",
                "tuesday": "8:00 AM - 6:00 PM",
                "wednesday": "8:00 AM - 6:00 PM",
                "thursday": "8:00 AM - 6:00 PM",
                "friday": "8:00 AM - 6:00 PM",
                "saturday": "9:00 AM - 2:00 PM",
                "sunday": "Closed",
            },
        },
        {
            "name": "East LA Motors",
            "address": "321 East Boulevard, East LA, CA 90022",
            "lat": 34.0239,
            "lng": -118.1552,
            "phone": "3235554567",
            "hours": {
                "monday": "7:30 AM - 5:30 PM",
                "tuesday": "7:30 AM - 5:30 PM",
                "wednesday": "7:30 AM - 5:30 PM",
                "thursday": "7:30 AM - 5:30 PM",
                "friday": "7:30 AM - 5:30 PM",
                "saturday": "8:00 AM - 3:00 PM",
                "sunday": "Closed",
            },
        },
        {
            "name": "South Bay Service Hub",
            "address": "555 Pacific Coast Highway, South Bay, CA 90254",
            "lat": 33.8829,
            "lng": -118.3932,
            "phone": "4245555678",
            "hours": {
                "monday": "8:00 AM - 6:00 PM",
                "tuesday": "8:00 AM - 6:00 PM",
                "wednesday": "8:00 AM - 6:00 PM",
                "thursday": "8:00 AM - 6:00 PM",
                "friday": "8:00 AM - 6:00 PM",
                "saturday": "9:00 AM - 4:00 PM",
                "sunday": "10:00 AM - 2:00 PM",
            },
        },
    ]

    created_count = 0
    for loc_data in locations_data:
        location, created = Location.objects.get_or_create(
            name=loc_data["name"], defaults=loc_data
        )
        if created:
            print(f"✅ Created: {location.name}")
            created_count += 1
        else:
            print(f"⏭️  Already exists: {location.name}")

    print(f"\n✨ Done! Created {created_count} new locations.")
    print(f"📍 Total locations in database: {Location.objects.count()}")


if __name__ == "__main__":
    print("🏢 Creating test service locations...\n")
    create_test_locations()
