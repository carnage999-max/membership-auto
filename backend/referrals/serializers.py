from rest_framework import serializers
from .models import Referral


class ReferralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Referral
        fields = [
            "id",
            "referrer_user",
            "referred_user",
            "code",
            "status",
            "rewards_applied",
            "created_at",
        ]

