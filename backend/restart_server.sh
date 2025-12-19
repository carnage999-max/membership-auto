#!/bin/bash

echo "🔄 Restarting Backend Server..."
echo ""

# Find and kill existing Django processes
echo "Stopping existing Django processes..."
pkill -f "manage.py runserver" || echo "No existing process found"

# Wait a moment
sleep 2

# Start the server
echo ""
echo "Starting Django server..."
cd /home/binary/Desktop/membership-auto/backend
python3 manage.py runserver

