from django.urls import path
from . import views

urlpatterns = [
    path('plans/', views.list_plans, name='list-plans'),
    path('create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('confirm-payment/', views.confirm_payment, name='confirm-payment'),
    path('history/', views.payment_history, name='payment-history'),
    path('webhook/', views.stripe_webhook, name='stripe-webhook'),
]
