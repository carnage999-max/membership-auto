import { api } from './client';
import type { Plan, PaymentIntent, Payment } from '@/types';

// Transform snake_case API response to camelCase Plan type
const transformPlanData = (data: any): Plan => {
  return {
    id: data.id,
    name: data.name,
    priceMonthly: data.price_monthly ?? data.priceMonthly ?? 0,
    tier: data.tier || '',
    features: data.features || [],
    createdAt: data.created_at || data.createdAt || '',
  };
};

// Transform snake_case API response to camelCase PaymentIntent type
const transformPaymentIntent = (data: any): PaymentIntent => {
  return {
    clientSecret: data.client_secret || data.clientSecret,
    paymentId: data.payment_id || data.paymentId,
    amount: data.amount ?? 0,
    currency: data.currency || 'usd',
    publishableKey: data.publishable_key || data.publishableKey || '',
  };
};

// Transform snake_case API response to camelCase Payment type
const transformPaymentData = (data: any): Payment => {
  return {
    id: data.id,
    userId: data.user_id || data.userId || data.user,
    planId: data.plan_id || data.planId || data.plan,
    planName: data.plan_name || data.planName || '',
    amount: data.amount ?? 0,
    currency: data.currency || 'usd',
    status: data.status || 'pending',
    stripePaymentIntentId: data.stripe_payment_intent_id || data.stripePaymentIntentId,
    createdAt: data.created_at || data.createdAt || '',
    completedAt: data.completed_at || data.completedAt,
  };
};

export const paymentService = {
  /**
   * Get all available membership plans
   */
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get<any[]>('/payments/plans/');
    return response.data.map(transformPlanData);
  },

  /**
   * Create a payment intent for a selected plan
   */
  createPaymentIntent: async (planId: string): Promise<PaymentIntent> => {
    const response = await api.post<any>('/payments/create-payment-intent/', {
      plan_id: planId,
    });
    return transformPaymentIntent(response.data);
  },

  /**
   * Confirm payment after successful Stripe payment
   */
  confirmPayment: async (paymentId: string) => {
    const response = await api.post<{ message: string; membership_created: boolean; plan_name: string }>(
      '/payments/confirm-payment/',
      {
        payment_id: paymentId,
      }
    );
    return response.data;
  },

  /**
   * Get payment history
   */
  getPaymentHistory: async (): Promise<Payment[]> => {
    const response = await api.get<any[]>('/payments/history/');
    return response.data.map(transformPaymentData);
  },
};
