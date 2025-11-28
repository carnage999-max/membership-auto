import uuid
from django.db import models
from django.utils import timezone


class Offer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    terms = models.TextField(blank=True, null=True)
    expiry = models.DateTimeField(blank=True, null=True)
    eligible_memberships = models.JSONField(default=list, blank=True)
    locations = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "offers"

    def __str__(self):
        return self.title
