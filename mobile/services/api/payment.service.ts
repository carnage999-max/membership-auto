import { api } from './client';
import type { Plan, PaymentIntent, Payment } from '@/types';

export const paymentService = {
  /**
   * Get all available membership plans
   */
  getPlans: async () => {
    const response = await api.get<Plan[]>('/payments/plans/');
    return response.data;
  },

  /**
   * Create a payment intent for a selected plan
   */
  createPaymentIntent: async (planId: string) => {
    const response = await api.post<PaymentIntent>('/payments/create-payment-intent/', {
      plan_id: planId,
    });
    return response.data;
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
  getPaymentHistory: async () => {
    const response = await api.get<Payment[]>('/payments/history/');
    return response.data;
  },
};
