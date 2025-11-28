from rest_framework import serializers
from .models import Offer


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = [
            "id",
            "title",
            "description",
            "terms",
            "expiry",
            "eligible_memberships",
            "locations",
            "created_at",
        ]

