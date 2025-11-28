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
    created_at = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

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
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memberships")
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.TextField(blank=True, null=True)
    started_at = models.DateTimeField(blank=True, null=True)
    next_billing_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "memberships"

    def __str__(self):
        return f"{self.user.email} - {self.plan.name if self.plan else 'No Plan'}"
