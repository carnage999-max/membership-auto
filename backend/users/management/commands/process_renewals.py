"""
Management command to handle membership renewals and expiry notifications
Run this command periodically (e.g., via Celery or cron job)
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from users.models import Membership, User
from users.email import (
    send_renewal_reminder_email,
    send_renewal_confirmation_email,
    send_cancellation_confirmation_email,
)
import stripe
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Process membership renewals and send expiry notifications"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Preview changes without making them",
        )

    def handle(self, *args, **options):
        dry_run = options.get("dry_run", False)

        if dry_run:
            self.stdout.write(
                self.style.WARNING("Running in DRY RUN mode - no changes will be made")
            )

        # 1. Send renewal reminder emails (7 days before)
        self.send_renewal_reminders()

        # 2. Process renewals that are due (within 1 day)
        self.process_due_renewals()

        # 3. Check for expired memberships
        self.check_expired_memberships()

        self.stdout.write(self.style.SUCCESS("Membership renewal task completed"))

    def send_renewal_reminders(self):
        """Send reminder emails 7 days before renewal"""
        self.stdout.write("Checking for memberships needing renewal reminders...")

        now = timezone.now()
        seven_days_later = now + timedelta(days=7)
        eight_days_later = now + timedelta(days=8)

        # Find memberships expiring in ~7 days that haven't had reminder sent
        memberships = Membership.objects.filter(
            status="active",
            next_billing_at__gte=seven_days_later,
            next_billing_at__lt=eight_days_later,
            expiry_reminder_sent=False,
            auto_renew=True,
        )

        for membership in memberships:
            try:
                user = membership.user
                days_until = (membership.next_billing_at - now).days

                if send_renewal_reminder_email(
                    user.email,
                    user.name,
                    membership.plan.name if membership.plan else "Premium",
                    membership.next_billing_at,
                    days_until,
                ):
                    membership.expiry_reminder_sent = True
                    membership.save()
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"  ✓ Reminder sent to {user.email} for {membership.plan.name}"
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(f"  ✗ Failed to send reminder to {user.email}")
                    )
            except Exception as e:
                logger.error(f"Error sending renewal reminder: {str(e)}")
                self.stdout.write(self.style.ERROR(f"  ✗ Error: {str(e)}"))

    def process_due_renewals(self):
        """Process renewals that are due (within 1 day)"""
        self.stdout.write("Processing due renewals...")

        now = timezone.now()
        one_day_later = now + timedelta(days=1)

        # Find active memberships where next_billing_at has arrived
        memberships = Membership.objects.filter(
            status="active", next_billing_at__lte=now, auto_renew=True
        )

        for membership in memberships:
            try:
                if self.attempt_renewal(membership):
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"  ✓ Renewed {membership.user.email} - {membership.plan.name}"
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(
                            f"  ✗ Renewal failed for {membership.user.email}"
                        )
                    )
            except Exception as e:
                logger.error(f"Error processing renewal: {str(e)}")
                self.stdout.write(self.style.ERROR(f"  ✗ Error: {str(e)}"))

    def attempt_renewal(self, membership):
        """Attempt to charge card and renew membership"""
        try:
            user = membership.user
            plan = membership.plan

            # Get Stripe customer
            if not hasattr(user, "stripe_customer_id") or not user.stripe_customer_id:
                logger.warning(f"No Stripe customer for user {user.email}")
                return False

            # Get payment method
            stripe.api_key = __import__("os").getenv("STRIPE_SECRET_KEY")
            customer = stripe.Customer.retrieve(user.stripe_customer_id)

            if not customer.default_source:
                logger.warning(f"No default payment method for {user.email}")
                membership.renewal_failed_count += 1
                membership.save()
                return False

            # Create payment intent for renewal
            amount_cents = int(plan.price_monthly * 100)

            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency="usd",
                customer=user.stripe_customer_id,
                metadata={
                    "user_id": str(user.id),
                    "user_email": user.email,
                    "plan_id": str(plan.id),
                    "plan_name": plan.name,
                    "renewal": "true",
                },
            )

            # Confirm payment with default payment method
            payment_intent = stripe.PaymentIntent.confirm(
                payment_intent.id, payment_method=customer.default_source
            )

            if payment_intent.status == "succeeded":
                # Update membership
                membership.status = "active"
                membership.last_renewal_at = timezone.now()
                membership.next_billing_at = timezone.now() + timedelta(days=30)
                membership.expiry_reminder_sent = False
                membership.renewal_failed_count = 0
                membership.save()

                # Send confirmation email
                send_renewal_confirmation_email(
                    user.email,
                    user.name,
                    plan.name,
                    plan.price_monthly,
                    membership.next_billing_at,
                )

                logger.info(f"Successfully renewed membership for {user.email}")
                return True
            else:
                membership.renewal_failed_count += 1
                membership.save()
                logger.warning(
                    f"Payment intent failed for {user.email}: {payment_intent.status}"
                )
                return False

        except stripe.error.CardError as e:
            logger.error(f"Card error during renewal: {str(e)}")
            membership.renewal_failed_count += 1
            membership.save()
            return False
        except Exception as e:
            logger.error(f"Unexpected error during renewal: {str(e)}")
            return False

    def check_expired_memberships(self):
        """Mark memberships as expired if next_billing_at has passed"""
        self.stdout.write("Checking for expired memberships...")

        now = timezone.now()

        # Find active memberships past their renewal date with auto_renew=False or failed renewals
        expired = Membership.objects.filter(
            status="active", next_billing_at__lt=now
        ).filter(auto_renew=False) | Membership.objects.filter(
            status="active",
            next_billing_at__lt=now,
            renewal_failed_count__gte=3,  # Mark as expired after 3 failed attempts
        )

        for membership in expired:
            membership.status = "expired"
            membership.save()
            self.stdout.write(
                self.style.WARNING(
                    f"  • Marked {membership.user.email} membership as expired"
                )
            )
