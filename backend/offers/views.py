from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Offer
from .serializers import OfferSerializer


class OfferListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List offers for user"""
        vehicle_id = request.query_params.get("vehicleId")
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")

        # Get user's membership tier
        user_membership = request.user.memberships.filter(status="active").first()
        membership_tier = None
        if user_membership and user_membership.plan:
            membership_tier = user_membership.plan.tier

        # Base queryset - active offers that haven't expired
        offers = Offer.objects.filter(
            expiry__gt=timezone.now(),
        )

        # Filter by eligible memberships if user has a membership
        # Note: SQLite doesn't support contains lookup on JSON fields
        # In production with PostgreSQL, use: eligible_memberships__contains=[membership_tier]
        # For SQLite compatibility, we'll filter in Python
        if membership_tier:
            offers_list = list(offers)
            filtered_offers = [
                offer for offer in offers_list
                if not offer.eligible_memberships or membership_tier in offer.eligible_memberships
            ]
            # Return filtered offers directly
            serializer = OfferSerializer(filtered_offers, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # If location provided, could filter by nearby locations
        # For now, we'll return all eligible offers

        serializer = OfferSerializer(offers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
