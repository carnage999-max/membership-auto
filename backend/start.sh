#!/bin/bash

# Quick Start Script for Membership Auto Backend
# Run this script to set up and start the backend server

set -e  # Exit on error

echo "🚀 Starting Membership Auto Backend Setup..."
echo ""

# Check if virtual environment exists
if [ ! -d "env" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv env
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source env/bin/activate

# Install requirements
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

echo "✅ Dependencies installed"
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py makemigrations
python manage.py migrate

echo "✅ Database ready"
echo ""

# Check if superuser exists
echo "👤 Checking for superuser..."
python manage.py shell << EOF
from users.models import User
if not User.objects.filter(role='admin').exists():
    print("No admin user found. You can create one with: python manage.py createsuperuser")
else:
    print("Admin user exists")
EOF

echo ""
echo "✅ Backend setup complete!"
echo ""

# Check if daphne is installed
if ! python -c "import daphne" 2>/dev/null; then
    echo "⚠️  Daphne not found. Installing for WebSocket support..."
    pip install daphne --quiet
    echo "✅ Daphne installed"
fi

echo "📝 Quick Info:"
echo "   - Database: SQLite (db.sqlite3)"
echo "   - API Docs: http://localhost:8000/api/docs/"
echo "   - Admin Panel: http://localhost:8000/admin/"
echo "   - WebSocket: ws://localhost:8000/chat/ws/"
echo ""
echo "🎯 Starting ASGI server with WebSocket support..."
echo "   Server will run at: http://localhost:8000"
echo "   Press Ctrl+C to stop"
echo ""

# Start the server with Daphne (ASGI server with WebSocket support)
daphne -b 0.0.0.0 -p 8000 membership_auto.asgi:application
