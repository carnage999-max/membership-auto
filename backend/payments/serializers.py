from rest_framework import serializers
from .models import Payment
from users.models import Plan


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            'id',
            'name',
            'price_monthly',
            'tier',
            'features',
        ]


class PaymentSerializer(serializers.ModelSerializer):
    plan_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'user',
            'plan',
            'plan_name',
            'stripe_payment_intent_id',
            'amount',
            'status',
            'created_at',
            'completed_at',
        ]
    
    def get_plan_name(self, obj):
        return obj.plan.name if obj.plan else None
