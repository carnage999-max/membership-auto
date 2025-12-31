from rest_framework import serializers
from .models import Payment
from users.models import Plan


class PlanSerializer(serializers.ModelSerializer):
    # For mobile app compatibility
    price = serializers.DecimalField(source='price_monthly', max_digits=10, decimal_places=2)
    interval = serializers.SerializerMethodField()
    stripePriceId = serializers.SerializerMethodField()
    popular = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = [
            "id",
            "name",
            "price_monthly",  # Keep for website compatibility
            "price",          # Add for mobile app
            "tier",
            "interval",
            "features",
            "stripePriceId",
            "popular",
        ]

    def get_interval(self, obj):
        # Default to 'month' - you can add an interval field to the model if needed
        return 'month'

    def get_stripePriceId(self, obj):
        # Return empty string for now - add stripe_price_id field to model later
        return ''

    def get_popular(self, obj):
        # Mark Premium tier as popular
        return obj.tier and obj.tier.lower() == 'premium'


class PaymentSerializer(serializers.ModelSerializer):
    plan_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id",
            "user",
            "plan",
            "plan_name",
            "stripe_payment_intent_id",
            "amount",
            "status",
            "created_at",
            "completed_at",
        ]

    def get_plan_name(self, obj):
        return obj.plan.name if obj.plan else None
