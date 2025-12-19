#!/bin/bash

# Start Django with WebSocket support using Daphne
# Daphne is the recommended ASGI server for Django Channels

echo "🚀 Starting Django with WebSocket support (ASGI via Daphne)..."
echo ""

# Check if daphne is installed
if ! python -c "import daphne" 2>/dev/null; then
    echo "⚠️  Daphne is not installed. Installing now..."
    pip install daphne
    echo ""
fi

# Check if channels is installed
if ! python -c "import channels" 2>/dev/null; then
    echo "⚠️  Django Channels is not installed. Installing now..."
    pip install channels
    echo ""
fi

# Apply migrations if needed
echo "📦 Checking for pending migrations..."
python manage.py migrate --check 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Pending migrations detected. Running migrations..."
    python manage.py migrate
    echo ""
fi

echo "✅ Starting ASGI server..."
echo "   - HTTP endpoint: http://localhost:8000"
echo "   - WebSocket endpoint: ws://localhost:8000/chat/ws/"
echo "   - Press Ctrl+C to stop"
echo ""

# Start Daphne
daphne -b 0.0.0.0 -p 8000 membership_auto.asgi:application

