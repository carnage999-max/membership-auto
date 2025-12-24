# Generated migration for subscription renewal fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_user_is_active_user_is_staff_user_is_superuser"),
    ]

    operations = [
        migrations.AlterField(
            model_name="membership",
            name="status",
            field=models.CharField(
                choices=[
                    ("active", "Active"),
                    ("expired", "Expired"),
                    ("cancelled", "Cancelled"),
                    ("paused", "Paused"),
                ],
                default="active",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="membership",
            name="expiry_reminder_sent",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="membership",
            name="last_renewal_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="membership",
            name="auto_renew",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="membership",
            name="renewal_failed_count",
            field=models.IntegerField(default=0),
        ),
    ]
