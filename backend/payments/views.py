import os
import json
import stripe
from decimal import Decimal
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from datetime import timedelta

from .models import Payment
from .serializers import PlanSerializer, PaymentSerializer
from users.models import Plan, Membership

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')


@api_view(['GET'])
def list_plans(request):
    """Get all active membership plans"""
    plans = Plan.objects.all()
    serializer = PlanSerializer(plans, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Create a Stripe payment intent for a selected plan"""
    try:
        plan_id = request.data.get('plan_id')
        
        if not plan_id:
            return Response(
                {'error': 'plan_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response(
                {'error': 'Plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user = request.user
        
        # Create or get Stripe customer
        stripe_customer = None
        if user.stripe_customer_id:
            try:
                stripe_customer = stripe.Customer.retrieve(user.stripe_customer_id)
            except stripe.error.InvalidRequestError:
                # Customer ID is invalid, create new one
                pass
        
        if not stripe_customer:
            stripe_customer = stripe.Customer.create(
                email=user.email,
                name=f"{user.name}".strip() or user.email,
                metadata={
                    'user_id': str(user.id),
                    'user_email': user.email,
                }
            )
            user.stripe_customer_id = stripe_customer.id
            user.save()
        
        # Create payment intent
        amount_cents = int(plan.price_monthly * 100)  # Stripe uses cents
        
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='usd',
            customer=stripe_customer.id,
            metadata={
                'user_id': str(user.id),
                'user_email': user.email,
                'plan_id': str(plan.id),
                'plan_name': plan.name,
            }
        )
        
        # Create Payment record
        payment = Payment.objects.create(
            user=user,
            plan=plan,
            stripe_payment_intent_id=payment_intent.id,
            stripe_customer_id=stripe_customer.id,
            amount=plan.price_monthly,
            status='pending'
        )
        
        return Response({
            'client_secret': payment_intent.client_secret,
            'payment_id': str(payment.id),
            'amount': float(plan.price_monthly),
            'currency': 'usd',
            'publishable_key': os.getenv('STRIPE_PUBLISHABLE_KEY', ''),
        })
    
    except Exception as e:
        print(f"Error creating payment intent: {str(e)}")
        return Response(
            {'error': 'Failed to create payment intent'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_history(request):
    """Get user's payment history"""
    payments = Payment.objects.filter(user=request.user).order_by('-created_at')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@csrf_exempt
@require_http_methods(['POST'])
def stripe_webhook(request):
    """Handle Stripe webhook events"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)
    
    # Handle checkout.session.completed event
    if event['type'] == 'charge.succeeded':
        charge = event['data']['object']
        handle_payment_success(charge)
    
    return HttpResponse(status=200)


def handle_payment_success(charge):
    """Handle successful payment and create membership"""
    try:
        # Find payment by Stripe charge ID
        payment_intent_id = charge.get('payment_intent')
        
        if not payment_intent_id:
            print(f"No payment intent found in charge: {charge.get('id')}")
            return
        
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
        except Payment.DoesNotExist:
            print(f"Payment not found for intent: {payment_intent_id}")
            return
        
        # Check if already processed
        if payment.status == 'completed':
            print(f"Payment {payment.id} already processed")
            return
        
        # Update payment status
        payment.status = 'completed'
        payment.completed_at = timezone.now()
        payment.save()
        
        # Create or update membership
        user = payment.user
        plan = payment.plan
        
        if not plan:
            print(f"No plan associated with payment {payment.id}")
            return
        
        # Create or update membership
        membership, created = Membership.objects.update_or_create(
            user=user,
            defaults={
                'plan': plan,
                'status': 'active',
                'started_at': timezone.now(),
                'next_billing_at': timezone.now() + timedelta(days=30),
            }
        )
        
        action = "created" if created else "updated"
        print(f"Membership {action} for user {user.email}: {plan.name}")
        
    except Exception as e:
        print(f"Error handling payment success: {str(e)}")
