"""
Firebase Cloud Messaging (FCM) v1 API Service

This service uses the modern FCM v1 HTTP API (not the deprecated legacy API).
Requires google-auth and google-api-python-client packages.

Setup:
1. Download service account JSON from Firebase Console
2. Set FIREBASE_SERVICE_ACCOUNT_PATH in settings to the path of the JSON file
3. Install required packages: pip install google-auth google-api-python-client
"""

import json
import logging
from typing import Dict, List, Optional
from pathlib import Path
from django.conf import settings
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import requests

logger = logging.getLogger(__name__)


class FCMService:
    """Firebase Cloud Messaging v1 API Service"""

    FCM_ENDPOINT = "https://fcm.googleapis.com/v1/projects/{project_id}/messages:send"
    SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"]

    def __init__(self):
        self.project_id = None
        self.credentials = None
        self._initialize()

    def _initialize(self):
        """Initialize FCM service with credentials"""
        service_account_path = getattr(
            settings, "FIREBASE_SERVICE_ACCOUNT_PATH", None
        )

        if not service_account_path:
            logger.warning(
                "FIREBASE_SERVICE_ACCOUNT_PATH not configured. Push notifications disabled."
            )
            return

        try:
            service_account_file = Path(service_account_path)
            if not service_account_file.exists():
                logger.error(f"Service account file not found: {service_account_path}")
                return

            # Load service account credentials
            self.credentials = service_account.Credentials.from_service_account_file(
                str(service_account_file), scopes=self.SCOPES
            )

            # Extract project ID from service account file
            with open(service_account_file, "r") as f:
                service_account_info = json.load(f)
                self.project_id = service_account_info.get("project_id")

            logger.info(f"FCM initialized for project: {self.project_id}")

        except Exception as e:
            logger.error(f"Failed to initialize FCM service: {str(e)}")

    def _get_access_token(self) -> Optional[str]:
        """Get OAuth2 access token for FCM API"""
        if not self.credentials:
            return None

        try:
            # Refresh token if expired
            if not self.credentials.valid:
                self.credentials.refresh(Request())

            return self.credentials.token
        except Exception as e:
            logger.error(f"Failed to get access token: {str(e)}")
            return None

    def send_notification(
        self,
        token: str,
        title: str,
        body: str,
        data: Optional[Dict] = None,
        image_url: Optional[str] = None,
        priority: str = "high",
    ) -> Dict:
        """
        Send push notification using FCM v1 API

        Args:
            token: Device push token (Expo token or FCM token)
            title: Notification title
            body: Notification body
            data: Custom data payload
            image_url: Optional image URL to display in notification
            priority: Message priority ('high' or 'normal')

        Returns:
            Dict with success status and message/error
        """
        if not self.credentials or not self.project_id:
            return {
                "success": False,
                "error": "FCM not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH in settings.",
            }

        access_token = self._get_access_token()
        if not access_token:
            return {"success": False, "error": "Failed to get access token"}

        # Handle Expo push tokens (send via Expo's service instead)
        if token.startswith("ExponentPushToken[") or token.startswith("ExpoPushToken["):
            return self._send_expo_notification(token, title, body, data)

        # Build FCM message
        message = {
            "message": {
                "token": token,
                "notification": {"title": title, "body": body},
                "android": {
                    "priority": priority,
                    "notification": {
                        "sound": "default",
                        "color": "#cba86e",  # Brand color
                        "channel_id": "default",
                    },
                },
                "apns": {
                    "payload": {
                        "aps": {
                            "alert": {"title": title, "body": body},
                            "sound": "default",
                            "badge": 1,
                        }
                    }
                },
            }
        }

        # Add custom data if provided
        if data:
            message["message"]["data"] = {k: str(v) for k, v in data.items()}

        # Add image if provided
        if image_url:
            message["message"]["notification"]["image"] = image_url

        # Send request
        try:
            url = self.FCM_ENDPOINT.format(project_id=self.project_id)
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            }

            response = requests.post(url, headers=headers, json=message, timeout=10)

            if response.status_code == 200:
                logger.info(f"Notification sent successfully to {token[:20]}...")
                return {"success": True, "message_id": response.json().get("name")}
            else:
                error_msg = response.json().get("error", {}).get("message", "Unknown error")
                logger.error(
                    f"Failed to send notification: {response.status_code} - {error_msg}"
                )
                return {"success": False, "error": error_msg}

        except Exception as e:
            logger.error(f"Exception sending notification: {str(e)}")
            return {"success": False, "error": str(e)}

    def _send_expo_notification(
        self, token: str, title: str, body: str, data: Optional[Dict] = None
    ) -> Dict:
        """Send notification via Expo push service"""
        try:
            expo_message = {
                "to": token,
                "title": title,
                "body": body,
                "sound": "default",
                "priority": "high",
            }

            if data:
                expo_message["data"] = data

            response = requests.post(
                "https://exp.host/--/api/v2/push/send",
                json=expo_message,
                headers={"Content-Type": "application/json"},
                timeout=10,
            )

            if response.status_code == 200:
                result = response.json()
                if result.get("data", {}).get("status") == "ok":
                    return {"success": True, "message_id": result.get("data", {}).get("id")}
                else:
                    error = result.get("data", {}).get("message", "Unknown error")
                    return {"success": False, "error": error}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}

        except Exception as e:
            logger.error(f"Exception sending Expo notification: {str(e)}")
            return {"success": False, "error": str(e)}

    def send_multicast(
        self,
        tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict] = None,
        image_url: Optional[str] = None,
    ) -> Dict:
        """
        Send notification to multiple devices

        Returns:
            Dict with success_count, failure_count, and results list
        """
        results = []
        success_count = 0
        failure_count = 0

        for token in tokens:
            result = self.send_notification(token, title, body, data, image_url)
            results.append({"token": token[:20] + "...", "result": result})

            if result.get("success"):
                success_count += 1
            else:
                failure_count += 1

        return {
            "success_count": success_count,
            "failure_count": failure_count,
            "results": results,
        }


# Global FCM service instance
fcm_service = FCMService()
