import uuid
from django.db import models
from django.utils import timezone
from users.models import User


class Referral(models.Model):
    STATUS_CHOICES = [
        ("invited", "Invited"),
        ("signed_up", "Signed Up"),
        ("credited", "Credited"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="referrals_made"
    )
    referred_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="referrals_received", null=True, blank=True
    )
    code = models.TextField()
    status = models.TextField(choices=STATUS_CHOICES, default="invited")
    rewards_applied = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "referrals"

    def __str__(self):
        return f"Referral: {self.referrer_user.email} -> {self.code}"
