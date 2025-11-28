from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Membership
from .serializers import UserSerializer
from referrals.models import Referral


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
    refresh_token = request.data.get("refreshToken")

    if not refresh_token:
        return Response(
            {"error": "Refresh token is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        return Response({"accessToken": access_token}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": "Invalid refresh token"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
