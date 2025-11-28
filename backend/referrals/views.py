from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Referral
from .serializers import ReferralSerializer
from users.models import User


class ReferralMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get referral status for caller"""
        user = request.user
        referrals_made = Referral.objects.filter(referrer_user=user)

        referral_info = {
            "code": user.referral_code,
            "link": f"https://membershipauto.com/r/{user.referral_code}",
            "referrals": ReferralSerializer(referrals_made, many=True).data,
        }

        return Response(referral_info, status=status.HTTP_200_OK)


class ReferralApplyView(APIView):
    permission_classes = [AllowAny]  # Called during signup

    def post(self, request):
        """Apply referral during signup"""
        code = request.data.get("code")
        new_user_id = request.data.get("newUserId")

        if not code:
            return Response(
                {"error": "code is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            referrer = User.objects.get(referral_code=code)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid referral code"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If newUserId is provided, create referral record
        if new_user_id:
            try:
                referred_user = User.objects.get(id=new_user_id)
                # Don't allow self-referral
                if referrer.id == referred_user.id:
                    return Response(
                        {"error": "Cannot refer yourself"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                
                # Create or update referral
                referral, created = Referral.objects.get_or_create(
                    referrer_user=referrer,
                    referred_user=referred_user,
                    defaults={"code": code, "status": "signed_up"},
                )

                if not created:
                    referral.status = "signed_up"
                    referral.save()

                # Apply rewards (would be handled by background task in production)
                # Referrer: 1 free month
                # Referred: 50% off first month

                serializer = ReferralSerializer(referral)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response(
                    {"error": "Invalid user ID"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            # Just validate the code
            return Response(
                {"message": "Referral code is valid", "code": code},
                status=status.HTTP_200_OK,
            )
