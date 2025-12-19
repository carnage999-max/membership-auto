from django.db import models
from django.conf import settings


class AdminSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="admin_settings",
    )
    name = models.CharField(max_length=255)
    email = models.EmailField()
    email_alerts = models.BooleanField(default=True)
    appointment_reminders = models.BooleanField(default=True)
    system_updates = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Admin Setting"
        verbose_name_plural = "Admin Settings"

    def __str__(self):
        return f"Settings for {self.user.username}"
