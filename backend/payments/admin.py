from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'plan')
    search_fields = ('user__email', 'stripe_payment_intent_id')
    readonly_fields = (
        'id',
        'stripe_payment_intent_id',
        'created_at',
        'completed_at',
    )
    fieldsets = (
        ('Payment Info', {
            'fields': ('id', 'user', 'plan', 'amount', 'status')
        }),
        ('Stripe Details', {
            'fields': ('stripe_payment_intent_id', 'stripe_customer_id', 'metadata'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )
