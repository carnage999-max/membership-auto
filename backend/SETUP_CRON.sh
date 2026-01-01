#!/bin/bash
# Setup script for parking meter notifications cron job

echo "🚗 Setting up Parking Meter Notifications Cron Job"
echo ""

# Get the current directory
BACKEND_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Backend directory: $BACKEND_DIR"

# Detect Python executable
if [ -f "$BACKEND_DIR/../venv/bin/python" ]; then
    PYTHON_PATH="$BACKEND_DIR/../venv/bin/python"
    echo "✅ Using virtual environment Python: $PYTHON_PATH"
elif command -v python3 &> /dev/null; then
    PYTHON_PATH="$(which python3)"
    echo "✅ Using system Python3: $PYTHON_PATH"
else
    PYTHON_PATH="$(which python)"
    echo "⚠️  Using system Python: $PYTHON_PATH"
fi

# Create log directory
LOG_DIR="/var/log"
LOG_FILE="$LOG_DIR/parking_notifications.log"

echo ""
echo "📝 Creating log file..."
sudo touch "$LOG_FILE" 2>/dev/null || touch "$HOME/parking_notifications.log"

if [ -f "$LOG_FILE" ]; then
    sudo chmod 666 "$LOG_FILE" 2>/dev/null || chmod 666 "$HOME/parking_notifications.log"
    echo "✅ Log file created: $LOG_FILE"
else
    LOG_FILE="$HOME/parking_notifications.log"
    touch "$LOG_FILE"
    chmod 666 "$LOG_FILE"
    echo "✅ Log file created: $LOG_FILE (using home directory)"
fi

# Test the command first
echo ""
echo "🧪 Testing the notification command..."
cd "$BACKEND_DIR"
$PYTHON_PATH manage.py check_parking_meters

if [ $? -eq 0 ]; then
    echo "✅ Command executed successfully!"
else
    echo "❌ Command failed. Please fix errors before setting up cron."
    exit 1
fi

# Create the cron job entry
CRON_ENTRY="*/5 * * * * cd $BACKEND_DIR && $PYTHON_PATH manage.py check_parking_meters >> $LOG_FILE 2>&1"

echo ""
echo "📅 Cron job entry:"
echo "$CRON_ENTRY"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "check_parking_meters"; then
    echo "⚠️  Cron job already exists. Updating..."
    # Remove old entry and add new one
    (crontab -l 2>/dev/null | grep -v "check_parking_meters"; echo "$CRON_ENTRY") | crontab -
else
    echo "➕ Adding new cron job..."
    # Add new entry
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
fi

if [ $? -eq 0 ]; then
    echo "✅ Cron job installed successfully!"
else
    echo "❌ Failed to install cron job"
    exit 1
fi

echo ""
echo "📋 Current crontab:"
crontab -l | grep "check_parking_meters"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 To view logs in real-time:"
echo "   tail -f $LOG_FILE"
echo ""
echo "🔍 To verify cron job is running:"
echo "   crontab -l"
echo ""
echo "🗑️  To remove the cron job:"
echo "   crontab -e"
echo "   (then delete the line with 'check_parking_meters')"
echo ""
