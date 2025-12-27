from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Membership
from .serializers import UserSerializer
from referrals.models import Referral
from .email import send_welcome_email


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    email = request.data.get("email")
    password = request.data.get("password")
    name = request.data.get("name")
    phone = request.data.get("phone")
    referral_code = request.data.get("referralCode")

    if not email or not password:
        return Response(
            {"error": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "User with this email already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create user (referral code will be auto-generated in save method)
    user = User.objects.create_user(
        email=email,
        password=password,
        name=name,
        phone=phone,
    )

    # Send welcome email
    send_welcome_email(user.email, user.name)

    # Handle referral if code provided
    if referral_code:
        try:
            referrer = User.objects.get(referral_code=referral_code)
            Referral.objects.create(
                referrer_user=referrer,
                referred_user=user,
                code=referral_code,
                status="signed_up",
            )
            # Apply referral rewards (50% off first month for referred, 1 free month for referrer)
            # This would be handled by a background task or signal in production
        except User.DoesNotExist:
            pass  # Invalid referral code, ignore

    # Generate tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    serializer = UserSerializer(user)
    return Response(
        {
            "accessToken": access_token,
            "refreshToken": str(refresh),
            "user": serializer.data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """Login user and return JWT tokens"""
    email = request.data.get("email")
    password = request.data.get("password")
    device_id = request.data.get("deviceId")  # For push notifications

    if not email or not password:
        return Response(
            {"error": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(email=email)
        if not user.check_password(password):
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
    except User.DoesNotExist:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Generate tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    serializer = UserSerializer(user)
    return Response(
        {
            "accessToken": access_token,
            "refreshToken": str(refresh),
            "user": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh access token using refresh token"""
    # Accept both 'refresh' and 'refreshToken' for compatibility
    refresh_token = request.data.get("refresh") or request.data.get("refreshToken")

    if not refresh_token:
        return Response(
            {"error": "Refresh token is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        # Return both formats for compatibility
        return Response({
            "access": access_token,
            "accessToken": access_token
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": "Invalid refresh token"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


@api_view(["GET", "PATCH"])
def profile(request):
    """Get or update user profile"""
    user = request.user

    if request.method == "GET":
        # Get user's membership info
        membership = Membership.objects.filter(user=user).first()

        data = {
            "id": str(user.id),
            "email": user.email,
            "name": user.name or "",
            "first_name": user.name.split()[0] if user.name else "",
            "last_name": (
                " ".join(user.name.split()[1:])
                if user.name and len(user.name.split()) > 1
                else ""
            ),
            "phone": user.phone or "",
            "membership_id": user.membership_id or f"MEM-{str(user.id)[:8].upper()}",
            "membership_plan": (
                membership.plan.name if membership and membership.plan else None
            ),
            "membership_status": (
                membership.status if membership else "No Active Membership"
            ),
            "monthly_fee": (
                membership.plan.price_monthly if membership and membership.plan else 0
            ),
            "renewal_date": (
                membership.next_billing_at.isoformat()
                if membership and membership.next_billing_at
                else None
            ),
            "can_cancel": membership and membership.status == "active",
            "can_reactivate": membership
            and membership.status in ["expired", "cancelled"],
            "auto_renew": membership.auto_renew if membership else False,
            "referral_code": user.referral_code,
            "rewards_balance": user.rewards_balance,
            "settings": user.settings or {},
        }
        return Response(data, status=status.HTTP_200_OK)

    elif request.method == "PATCH":
        # Update profile
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        phone = request.data.get("phone")
        settings = request.data.get("settings")

        if first_name is not None or last_name is not None:
            name_parts = []
            if first_name:
                name_parts.append(first_name)
            if last_name:
                name_parts.append(last_name)
            user.name = " ".join(name_parts)

        if phone is not None:
            user.phone = phone

        if settings is not None:
            user.settings = settings

        user.save()

        return Response(
            {"message": "Profile updated successfully"}, status=status.HTTP_200_OK
        )


@api_view(["POST"])
def change_password(request):
    """Change user password"""
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response(
            {"error": "Both old and new passwords are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not user.check_password(old_password):
        return Response(
            {"error": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(new_password) < 8:
        return Response(
            {"error": "New password must be at least 8 characters long"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()

    return Response(
        {"message": "Password changed successfully"}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def savings(request):
    """Calculate and return member savings"""
    from appointments.models import Appointment
    from decimal import Decimal
    from datetime import datetime, timedelta
    from django.db.models import Sum, Count

    user = request.user

    # Get user's membership
    try:
        membership = Membership.objects.get(user=user)
    except Membership.DoesNotExist:
        # Return empty savings data for users without a membership yet
        return Response(
            {
                "total_saved": 0.0,
                "services_used": 0,
                "total_paid": 0.0,
                "net_savings": 0.0,
                "monthly_breakdown": [],
                "average_per_service": 0.0,
                "membership_plan": None,
                "monthly_fee": 0.0,
            },
            status=status.HTTP_200_OK,
        )

    # Calculate savings from appointments
    # Assumption: Member pays $0 for covered services, non-members would pay full price
    completed_appointments = Appointment.objects.filter(user=user, status="completed")

    # Mock pricing data (in production, this would come from a pricing table)
    service_prices = {
        "oil-change": Decimal("45.00"),
        "tire-rotation": Decimal("35.00"),
        "brake-inspection": Decimal("50.00"),
        "multi-point-inspection": Decimal("40.00"),
        "air-filter-replacement": Decimal("25.00"),
        "battery-check": Decimal("20.00"),
        "fluid-top-off": Decimal("15.00"),
        "wiper-replacement": Decimal("20.00"),
        "diagnostic": Decimal("80.00"),
        "general": Decimal("50.00"),  # default price
    }

    total_saved = Decimal("0.00")
    services_used = 0
    monthly_breakdown = {}

    for appointment in completed_appointments:
        # Get service price (default to general if not found)
        service_type = appointment.service_type or "general"
        price = service_prices.get(service_type, service_prices["general"])
        total_saved += price
        services_used += 1

        # Group by month for breakdown
        if appointment.scheduled_at:
            month_key = appointment.scheduled_at.strftime("%Y-%m")
            if month_key not in monthly_breakdown:
                monthly_breakdown[month_key] = {
                    "month": appointment.scheduled_at.strftime("%B %Y"),
                    "amount": Decimal("0.00"),
                    "services": 0,
                }
            monthly_breakdown[month_key]["amount"] += price
            monthly_breakdown[month_key]["services"] += 1

    # Calculate membership cost
    membership_cost = membership.plan.price_monthly or Decimal("0.00")

    # Calculate months of membership
    if membership.started_at:
        months_active = max(
            1, (datetime.now().date() - membership.started_at.date()).days // 30
        )
    else:
        months_active = 1

    total_paid = membership_cost * months_active
    net_savings = total_saved - total_paid

    # Convert monthly breakdown to list
    monthly_list = [
        {**data, "amount": float(data["amount"])}
        for data in sorted(
            monthly_breakdown.values(), key=lambda x: x["month"], reverse=True
        )
    ]

    response_data = {
        "total_saved": float(total_saved),
        "services_used": services_used,
        "total_paid": float(total_paid),
        "net_savings": float(net_savings),
        "monthly_breakdown": monthly_list[:12],  # Last 12 months
        "average_per_service": (
            float(total_saved / services_used) if services_used > 0 else 0
        ),
        "membership_plan": membership.plan.name if membership.plan else "Unknown",
        "monthly_fee": float(membership_cost),
    }

    return Response(response_data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_membership(request):
    """Cancel user's active membership"""
    from django.utils import timezone
    from .email import send_cancellation_confirmation_email

    user = request.user
    reason = request.data.get("reason", "")

    try:
        # Get active membership
        membership = Membership.objects.get(user=user, status="active")
    except Membership.DoesNotExist:
        return Response(
            {"error": "No active membership to cancel"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Cancel the membership
    membership.status = "cancelled"
    membership.cancelled_at = timezone.now()
    membership.save()

    # Send confirmation email
    send_cancellation_confirmation_email(
        user.email, user.name, membership.plan.name if membership.plan else "Premium"
    )

    return Response(
        {
            "message": "Membership cancelled successfully",
            "membership_status": membership.status,
            "cancelled_at": membership.cancelled_at.isoformat(),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reactivate_membership(request):
    """Reactivate an expired or cancelled membership"""
    from django.utils import timezone
    from datetime import timedelta

    user = request.user

    try:
        # Get expired/cancelled membership
        membership = Membership.objects.get(
            user=user, status__in=["expired", "cancelled"]
        )
    except Membership.DoesNotExist:
        return Response(
            {"error": "No inactive membership to reactivate"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Reactivate the membership
    membership.status = "active"
    membership.started_at = timezone.now()
    membership.next_billing_at = timezone.now() + timedelta(days=30)
    membership.expiry_reminder_sent = False
    membership.renewal_failed_count = 0
    membership.cancelled_at = None
    membership.save()

    return Response(
        {
            "message": "Membership reactivated successfully",
            "membership_status": membership.status,
            "renewal_date": membership.next_billing_at.isoformat(),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_auto_renew(request):
    """Toggle auto-renewal for membership"""
    user = request.user
    auto_renew = request.data.get("auto_renew")

    if auto_renew is None:
        return Response(
            {"error": "auto_renew parameter is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        membership = Membership.objects.get(user=user)
        membership.auto_renew = bool(auto_renew)
        membership.save()

        return Response(
            {
                "message": f'Auto-renewal {"enabled" if auto_renew else "disabled"}',
                "auto_renew": membership.auto_renew,
            },
            status=status.HTTP_200_OK,
        )
    except Membership.DoesNotExist:
        return Response(
            {"error": "No membership found"}, status=status.HTTP_404_NOT_FOUND
        )
