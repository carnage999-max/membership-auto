import { api } from './client';

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export const paymentService = {
  /**
   * Get available membership plans
   */
  getPlans: async () => {
    const response = await api.get<MembershipPlan[]>('/payments/plans/');
    return response.data;
  },

  /**
   * Create payment intent for subscription
   */
  createPaymentIntent: async (planId: string) => {
    const response = await api.post<PaymentIntent>('/payments/create-payment-intent/', {
      plan_id: planId,
    });
    return response.data;
  },

  /**
   * Subscribe to a plan
   */
  subscribe: async (planId: string, paymentMethodId: string) => {
    const response = await api.post<Subscription>('/payments/subscribe/', {
      plan_id: planId,
      payment_method_id: paymentMethodId,
    });
    return response.data;
  },

  /**
   * Get current subscription
   */
  getCurrentSubscription: async () => {
    const response = await api.get<Subscription>('/payments/subscription/', {
      suppressErrorToast: true,
    });
    return response.data;
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async () => {
    const response = await api.post<{ message: string }>('/payments/cancel-subscription/');
    return response.data;
  },

  /**
   * Get payment methods
   */
  getPaymentMethods: async () => {
    const response = await api.get('/payments/payment-methods/');
    return response.data;
  },

  /**
   * Add payment method
   */
  addPaymentMethod: async (paymentMethodId: string) => {
    const response = await api.post('/payments/add-payment-method/', {
      payment_method_id: paymentMethodId,
    });
    return response.data;
  },

  /**
   * Remove payment method
   */
  removePaymentMethod: async (paymentMethodId: string) => {
    const response = await api.delete(`/payments/payment-methods/${paymentMethodId}/`);
    return response.data;
  },

  /**
   * Set default payment method
   */
  setDefaultPaymentMethod: async (paymentMethodId: string) => {
    const response = await api.post('/payments/set-default-payment-method/', {
      payment_method_id: paymentMethodId,
    });
    return response.data;
  },
};
