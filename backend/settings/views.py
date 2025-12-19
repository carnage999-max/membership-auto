from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail
from django.conf import settings as django_settings
from django.utils import timezone
from .models import AdminSettings
import subprocess
import os
import shutil


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def admin_settings_view(request):
    """Get or update admin settings"""
    user = request.user

    # Get or create admin settings
    admin_settings, created = AdminSettings.objects.get_or_create(
        user=user,
        defaults={
            "name": user.name or user.email.split("@")[0],
            "email": user.email,
            "email_alerts": True,
            "appointment_reminders": True,
            "system_updates": False,
        },
    )

    if request.method == "GET":
        return Response(
            {
                "name": admin_settings.name,
                "email": admin_settings.email,
                "notifications": {
                    "emailAlerts": admin_settings.email_alerts,
                    "appointmentReminders": admin_settings.appointment_reminders,
                    "systemUpdates": admin_settings.system_updates,
                },
            }
        )

    elif request.method == "PUT":
        data = request.data

        # Update settings
        if "name" in data:
            admin_settings.name = data["name"]
        if "email" in data:
            admin_settings.email = data["email"]
            user.email = data["email"]
            user.save()

        # Update notification preferences
        if "notifications" in data:
            notifications = data["notifications"]
            admin_settings.email_alerts = notifications.get(
                "emailAlerts", admin_settings.email_alerts
            )
            admin_settings.appointment_reminders = notifications.get(
                "appointmentReminders", admin_settings.appointment_reminders
            )
            admin_settings.system_updates = notifications.get(
                "systemUpdates", admin_settings.system_updates
            )

        admin_settings.save()

        # Send confirmation email if email alerts are enabled
        if admin_settings.email_alerts:
            try:
                send_mail(
                    "Settings Updated - Membership Auto",
                    f'Your admin settings have been successfully updated on {timezone.now().strftime("%Y-%m-%d %H:%M:%S")}.\n\nIf you did not make this change, please contact support immediately.',
                    django_settings.DEFAULT_FROM_EMAIL,
                    [admin_settings.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Failed to send email: {e}")

        return Response(
            {
                "message": "Settings updated successfully",
                "name": admin_settings.name,
                "email": admin_settings.email,
            }
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change admin password"""
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response(
            {"error": "Both old and new passwords are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Verify old password
    if not check_password(old_password, user.password):
        return Response(
            {"error": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate new password
    if len(new_password) < 8:
        return Response(
            {"error": "New password must be at least 8 characters long"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Set new password
    user.set_password(new_password)
    user.save()

    # Send email notification
    try:
        admin_settings = AdminSettings.objects.get(user=user)
        if admin_settings.email_alerts:
            send_mail(
                "Password Changed - Membership Auto",
                f'Your admin password was successfully changed on {timezone.now().strftime("%Y-%m-%d %H:%M:%S")}.\n\nIf you did not make this change, please contact support immediately.',
                django_settings.DEFAULT_FROM_EMAIL,
                [admin_settings.email],
                fail_silently=True,
            )
    except Exception as e:
        print(f"Failed to send email: {e}")

    return Response({"message": "Password changed successfully"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def system_status_view(request):
    """Get system status"""
    from django.db import connection

    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_status = "healthy"
    except:
        db_status = "error"

    # Get last backup time (from file timestamp if exists)
    backup_dir = os.path.join(str(django_settings.BASE_DIR), "backups")
    last_backup = timezone.now()

    if os.path.exists(backup_dir):
        backups = [f for f in os.listdir(backup_dir) if f.endswith(".sqlite3")]
        if backups:
            latest_backup = max(
                backups, key=lambda f: os.path.getmtime(os.path.join(backup_dir, f))
            )
            last_backup = timezone.datetime.fromtimestamp(
                os.path.getmtime(os.path.join(backup_dir, latest_backup)),
                tz=timezone.get_current_timezone(),
            )

    return Response(
        {
            "database": db_status,
            "api": "online",
            "lastBackup": last_backup.isoformat(),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def database_backup_view(request):
    """Trigger database backup - supports both SQLite and PostgreSQL"""
    try:
        # Create backups directory if it doesn't exist
        backup_dir = os.path.join(str(django_settings.BASE_DIR), "backups")
        os.makedirs(backup_dir, exist_ok=True)

        # Get database configuration
        db_config = django_settings.DATABASES["default"]
        db_engine = db_config["ENGINE"]
        timestamp = timezone.now().strftime("%Y%m%d_%H%M%S")

        # Determine backup method based on database engine
        if "postgresql" in db_engine:
            # PostgreSQL backup using pg_dump
            backup_file = os.path.join(backup_dir, f"db_backup_{timestamp}.sql")

            # Build pg_dump command
            pg_dump_cmd = [
                "pg_dump",
                "-h",
                db_config.get("HOST", "localhost"),
                "-p",
                str(db_config.get("PORT", 5432)),
                "-U",
                db_config.get("USER", "postgres"),
                "-F",
                "c",  # Custom format (compressed)
                "-f",
                backup_file,
                db_config.get("NAME", "membership_auto"),
            ]

            # Set password as environment variable if provided
            env = os.environ.copy()
            if db_config.get("PASSWORD"):
                env["PGPASSWORD"] = db_config["PASSWORD"]

            result = subprocess.run(
                pg_dump_cmd, capture_output=True, text=True, env=env
            )

            if result.returncode != 0:
                return Response(
                    {"error": f"PostgreSQL backup failed: {result.stderr}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        elif "sqlite" in db_engine:
            # SQLite backup - simple file copy
            db_file = str(db_config["NAME"])
            backup_file = os.path.join(backup_dir, f"db_backup_{timestamp}.sqlite3")
            shutil.copy2(db_file, backup_file)

        else:
            return Response(
                {"error": f"Unsupported database engine: {db_engine}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Send notification email
        try:
            user = request.user
            admin_settings = AdminSettings.objects.get(user=user)
            if admin_settings.system_updates:
                send_mail(
                    "Database Backup Completed - Membership Auto",
                    f'Database backup was successfully completed on {timezone.now().strftime("%Y-%m-%d %H:%M:%S")}.\n\nBackup file: {os.path.basename(backup_file)}\nDatabase type: {"PostgreSQL" if "postgresql" in db_engine else "SQLite"}',
                    django_settings.DEFAULT_FROM_EMAIL,
                    [admin_settings.email],
                    fail_silently=True,
                )
        except Exception as e:
            print(f"Failed to send email: {e}")

        return Response(
            {
                "message": "Backup completed successfully",
                "backup_file": os.path.basename(backup_file),
                "database_type": (
                    "postgresql" if "postgresql" in db_engine else "sqlite"
                ),
            }
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
