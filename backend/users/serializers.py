from rest_framework import serializers
from .models import User, Plan, Membership


class UserSerializer(serializers.ModelSerializer):
    referralCode = serializers.CharField(source="referral_code", read_only=True)
    membershipId = serializers.CharField(source="membership_id", read_only=True, allow_null=True)
    rewardsBalance = serializers.IntegerField(source="rewards_balance", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = User
        fields = ["id", "name", "email", "phone", "membershipId", "referralCode", "rewardsBalance", "createdAt"]
        read_only_fields = ["id", "createdAt", "referralCode", "rewardsBalance"]


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ["id", "name", "price_monthly", "tier", "features", "created_at"]


class MembershipSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ["id", "user", "plan", "status", "started_at", "next_billing_at", "cancelled_at"]

