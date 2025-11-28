import uuid
from django.db import models
from django.utils import timezone
from users.models import User


class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="files")
    filename = models.TextField()
    url = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "files"

    def __str__(self):
        return f"{self.filename} for {self.user.email}"
