import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.TextField(blank=True, null=True)
    membership_id = models.TextField(blank=True, null=True)
    referral_code = models.TextField(blank=True, null=True, unique=True)
    rewards_balance = models.IntegerField(default=0)
    role = models.TextField(default="member")
    settings = models.JSONField(default=dict, blank=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    # Django admin permissions
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def has_perm(self, perm, obj=None):
        """Does the user have a specific permission?"""
        return self.is_superuser

    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app `app_label`?"""
        return self.is_superuser

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["email"]),
        ]

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = generate_referral_code()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


def generate_referral_code():
    """Generate a unique referral code"""
    import secrets

    while True:
        code = f"REF-{secrets.token_urlsafe(6).upper()[:6]}"
        if not User.objects.filter(referral_code=code).exists():
            return code


class Plan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(blank=True, null=True)
    price_monthly = models.IntegerField()
    tier = models.TextField(blank=True, null=True)
    features = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "plans"

    def __str__(self):
        return f"{self.name} - ${self.price_monthly}/mo"


class Membership(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("expired", "Expired"),
        ("cancelled", "Cancelled"),
        ("paused", "Paused"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memberships")
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    started_at = models.DateTimeField(blank=True, null=True)
    next_billing_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    expiry_reminder_sent = models.BooleanField(
        default=False
    )  # Track if 7-day reminder sent
    last_renewal_at = models.DateTimeField(blank=True, null=True)
    auto_renew = models.BooleanField(
        default=True
    )  # Allow users to disable auto-renewal
    renewal_failed_count = models.IntegerField(
        default=0
    )  # Track failed renewal attempts

    class Meta:
        db_table = "memberships"

    def __str__(self):
        return f"{self.user.email} - {self.plan.name if self.plan else 'No Plan'}"

    @property
    def is_active(self):
        """Check if membership is currently active"""
        from django.utils import timezone

        return self.status == "active" and (
            self.next_billing_at is None or self.next_billing_at > timezone.now()
        )

    @property
    def days_until_renewal(self):
        """Calculate days until next billing"""
        from django.utils import timezone

        if not self.next_billing_at:
            return None
        delta = self.next_billing_at - timezone.now()
        return max(0, delta.days)


class PasswordResetToken(models.Model):
    """Password reset tokens for users"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="password_reset_tokens"
    )
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "password_reset_tokens"
        indexes = [
            models.Index(fields=["token"]),
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"Reset token for {self.user.email}"

    @property
    def is_expired(self):
        """Check if token has expired"""
        return timezone.now() > self.expires_at
