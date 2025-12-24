import os
import json
import stripe
import logging
from decimal import Decimal
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from datetime import timedelta

from .models import Payment
from .serializers import PlanSerializer, PaymentSerializer
from users.models import Plan, Membership

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")


@api_view(["GET"])
@permission_classes([AllowAny])
def list_plans(request):
    """Get all active membership plans"""
    plans = Plan.objects.all()
    serializer = PlanSerializer(plans, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Create a Stripe payment intent for a selected plan"""
    try:
        plan_id = request.data.get("plan_id")

        if not plan_id:
            logger.warning(
                f"Payment intent request missing plan_id from user {request.user.id}"
            )
            return Response(
                {"error": "plan_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            logger.warning(f"Plan not found: {plan_id}")
            return Response(
                {"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND
            )

        user = request.user
        logger.info(f"Creating payment intent for user {user.id}, plan {plan.id}")

        # Create or get Stripe customer
        stripe_customer = None
        if user.stripe_customer_id:
            try:
                stripe_customer = stripe.Customer.retrieve(user.stripe_customer_id)
            except stripe.error.InvalidRequestError as e:
                logger.warning(
                    f"Invalid Stripe customer ID {user.stripe_customer_id}: {str(e)}"
                )
                # Customer ID is invalid, create new one
                pass

        if not stripe_customer:
            try:
                stripe_customer = stripe.Customer.create(
                    email=user.email,
                    name=(user.name or user.email).strip(),
                    metadata={
                        "user_id": str(user.id),
                        "user_email": user.email,
                    },
                )
                user.stripe_customer_id = stripe_customer.id
                user.save()
                logger.info(
                    f"Created new Stripe customer {stripe_customer.id} for user {user.id}"
                )
            except stripe.error.StripeError as e:
                logger.error(f"Failed to create Stripe customer: {str(e)}")
                return Response(
                    {"error": f"Failed to create payment customer: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # Create payment intent
        amount_cents = int(plan.price_monthly * 100)  # Stripe uses cents

        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency="usd",
                customer=stripe_customer.id,
                setup_future_usage="off_session",  # Save payment method for future use
                metadata={
                    "user_id": str(user.id),
                    "user_email": user.email,
                    "plan_id": str(plan.id),
                    "plan_name": plan.name,
                },
            )
            logger.info(
                f"Created payment intent {payment_intent.id} for user {user.id}, amount {amount_cents} cents"
            )
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create payment intent: {str(e)}")
            return Response(
                {"error": f"Failed to create payment intent: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Create Payment record
        try:
            payment = Payment.objects.create(
                user=user,
                plan=plan,
                stripe_payment_intent_id=payment_intent.id,
                stripe_customer_id=stripe_customer.id,
                amount=plan.price_monthly,
                status="pending",
            )
            logger.info(f"Created payment record {payment.id}")
        except Exception as e:
            logger.error(f"Failed to create payment record: {str(e)}")
            return Response(
                {"error": f"Failed to save payment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "client_secret": payment_intent.client_secret,
                "payment_id": str(payment.id),
                "amount": float(plan.price_monthly),
                "currency": "usd",
                "publishable_key": os.getenv("STRIPE_PUBLISHABLE_KEY", ""),
            }
        )

    except Exception as e:
        logger.error(
            f"Unhandled error creating payment intent: {str(e)}", exc_info=True
        )
        return Response(
            {"error": "Failed to create payment intent"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def payment_history(request):
    """Get user's payment history"""
    payments = Payment.objects.filter(user=request.user).order_by("-created_at")
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    """Confirm payment and create/update membership after successful payment"""
    try:
        payment_id = request.data.get("payment_id")

        if not payment_id:
            logger.warning(
                f"Confirm payment request missing payment_id from user {request.user.id}"
            )
            return Response(
                {"error": "payment_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Get the payment
        try:
            payment = Payment.objects.get(id=payment_id, user=request.user)
        except Payment.DoesNotExist:
            logger.warning(f"Payment {payment_id} not found for user {request.user.id}")
            return Response(
                {"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if already processed
        if payment.status == "completed":
            logger.info(f"Payment {payment_id} already completed")
            return Response(
                {"message": "Payment already completed", "membership_created": False},
                status=status.HTTP_200_OK,
            )

        # Mark payment as completed
        payment.status = "completed"
        payment.completed_at = timezone.now()
        payment.save()
        logger.info(f"Updated payment {payment_id} status to completed")

        # Create or update membership
        plan = payment.plan
        if not plan:
            logger.error(f"No plan associated with payment {payment_id}")
            return Response(
                {"error": "No plan associated with payment"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Create or update membership with 30-day billing cycle
        membership, created = Membership.objects.update_or_create(
            user=request.user,
            defaults={
                "plan": plan,
                "status": "active",
                "started_at": timezone.now(),
                "next_billing_at": timezone.now() + timedelta(days=30),
            },
        )

        action = "created" if created else "updated"
        logger.info(f"Membership {action} for user {request.user.email}: {plan.name}")

        return Response(
            {
                "message": "Payment confirmed and membership activated",
                "membership_created": created,
                "plan_name": plan.name,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        logger.error(f"Error confirming payment: {str(e)}", exc_info=True)
        return Response(
            {"error": "Failed to confirm payment"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    """Handle Stripe webhook events"""
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        logger.warning("Webhook payload could not be decoded")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        logger.warning("Webhook signature verification failed")
        return HttpResponse(status=400)

    # Handle payment success events
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        logger.info(
            f"Handling payment_intent.succeeded event for {payment_intent.get('id')}"
        )
        handle_payment_success(payment_intent)
    elif event["type"] == "charge.succeeded":
        # Also handle charge.succeeded as fallback
        charge = event["data"]["object"]
        logger.info(f"Handling charge.succeeded event for {charge.get('id')}")
        handle_payment_success(charge)

    return HttpResponse(status=200)


def handle_payment_success(event_data):
    """Handle successful payment and create membership from webhook"""
    try:
        # Get payment intent ID from event data
        # For payment_intent.succeeded events, id is the payment_intent_id
        # For charge.succeeded events, payment_intent is the ID we need
        payment_intent_id = event_data.get("id") or event_data.get("payment_intent")

        if not payment_intent_id:
            logger.warning(f"No payment intent found in event: {event_data.get('id')}")
            return

        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
        except Payment.DoesNotExist:
            logger.warning(f"Payment not found for intent: {payment_intent_id}")
            return

        # Check if already processed
        if payment.status == "completed":
            logger.info(f"Payment {payment.id} already processed, skipping")
            return

        # Update payment status
        payment.status = "completed"
        payment.completed_at = timezone.now()
        payment.save()
        logger.info(f"Payment {payment.id} marked as completed")

        # Create or update membership
        user = payment.user
        plan = payment.plan

        if not plan:
            logger.error(f"No plan associated with payment {payment.id}")
            return

        # Create or update membership with 30-day billing cycle
        membership, created = Membership.objects.update_or_create(
            user=user,
            defaults={
                "plan": plan,
                "status": "active",
                "started_at": timezone.now(),
                "next_billing_at": timezone.now() + timedelta(days=30),
            },
        )

        action = "created" if created else "updated"
        logger.info(f"Membership {action} for user {user.email}: {plan.name}")

    except Exception as e:
        logger.error(f"Error handling payment success: {str(e)}", exc_info=True)
