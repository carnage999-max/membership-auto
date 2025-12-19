#!/usr/bin/env python3
"""
WebSocket Connection Test Script

Tests the real-time chat WebSocket connection.
Run this after starting the Django server with Daphne/Uvicorn.
"""

import asyncio
import websockets
import json
import sys
from getpass import getpass


async def test_websocket(token: str):
    """Test WebSocket connection with JWT token"""
    uri = f"ws://localhost:8000/chat/ws/?token={token}"

    print(f"🔌 Connecting to: {uri}")

    try:
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")

            # Send a test message
            test_message = {
                "type": "SEND",
                "threadId": "test-thread-id",  # Replace with actual thread ID
                "body": "Test message from WebSocket client",
            }

            print(f"📤 Sending test message: {test_message}")
            await websocket.send(json.dumps(test_message))

            # Wait for response
            print("⏳ Waiting for server response...")
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"📥 Received response: {response}")
                data = json.loads(response)

                if data.get("type") == "message":
                    print("✅ Server echoed message correctly!")
                else:
                    print(f"⚠️  Unexpected response type: {data.get('type')}")

            except asyncio.TimeoutError:
                print("⚠️  No response received within 5 seconds")

            # Keep connection open for a bit
            print("🔍 Keeping connection open for 3 seconds...")
            await asyncio.sleep(3)

            print("✅ Test completed successfully!")

    except websockets.exceptions.WebSocketException as e:
        print(f"❌ WebSocket error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


def get_jwt_token():
    """Get JWT token from user"""
    print("\n" + "=" * 60)
    print("WebSocket Connection Test")
    print("=" * 60)
    print("\nTo test the WebSocket connection, you need a valid JWT token.")
    print("You can get this by:")
    print("  1. Login to the frontend app")
    print("  2. Open browser DevTools > Application > Local Storage")
    print("  3. Copy the 'access_token' value")
    print("\nOr use curl to login:")
    print("  curl -X POST http://localhost:8000/api/auth/login/ \\")
    print("       -H 'Content-Type: application/json' \\")
    print('       -d \'{"username":"your_username","password":"your_password"}\'')
    print("\n")

    token = input("Enter your JWT access token: ").strip()
    if not token:
        print("❌ Token is required!")
        sys.exit(1)

    return token


if __name__ == "__main__":
    print("\n🚀 Starting WebSocket test...\n")

    # Get token from user
    token = get_jwt_token()

    # Run async test
    try:
        asyncio.run(test_websocket(token))
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(0)
