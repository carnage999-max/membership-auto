from django.core.management.base import BaseCommand
from users.models import Plan


class Command(BaseCommand):
    help = 'Create membership plans'

    def handle(self, *args, **options):
        plans_data = [
            {
                'name': 'Basic',
                'price_monthly': 59,
                'tier': 'compact',
                'features': [
                    'All basic maintenance',
                    'Oil changes',
                    'Tire rotations',
                    'Basic diagnostics',
                ]
            },
            {
                'name': 'Plus',
                'price_monthly': 79,
                'tier': 'mid-size',
                'features': [
                    'Everything in Basic',
                    'Brake service',
                    'Belt replacements',
                    'Fluid flushes',
                ]
            },
            {
                'name': 'Premium',
                'price_monthly': 99,
                'tier': 'suv',
                'features': [
                    'Everything in Plus',
                    'Engine repairs',
                    'Transmission service',
                    'Advanced diagnostics',
                ]
            },
            {
                'name': 'Elite',
                'price_monthly': 159,
                'tier': 'luxury',
                'features': [
                    'Everything in Premium',
                    'Premium parts',
                    'Priority scheduling',
                    'Concierge service',
                ]
            }
        ]

        for plan_data in plans_data:
            plan, created = Plan.objects.get_or_create(
                name=plan_data['name'],
                defaults={
                    'price_monthly': plan_data['price_monthly'],
                    'tier': plan_data['tier'],
                    'features': plan_data['features'],
                }
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created plan: {plan.name} - ${plan.price_monthly}/mo')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Plan already exists: {plan.name}')
                )
