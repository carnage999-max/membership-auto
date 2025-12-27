import { api } from './client';
import type { User } from '@/types';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface SavingsData {
  total_savings: number;
  breakdown: {
    service_discounts: number;
    fuel_savings: number;
    referral_rewards: number;
    membership_perks: number;
  };
  period: string;
}

export const userService = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await api.get<User>('/users/profile/');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put<User>('/users/profile/', data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordData) => {
    const response = await api.post<{ message: string }>('/users/change-password/', data);
    return response.data;
  },

  /**
   * Get total savings
   */
  getSavings: async () => {
    const response = await api.get<SavingsData>('/users/savings/', {
      suppressErrorToast: true,
    });
    return response.data;
  },

  /**
   * Cancel membership
   */
  cancelMembership: async (reason?: string) => {
    const response = await api.post<{ message: string; cancelled_at: string }>(
      '/users/cancel-membership/',
      { reason }
    );
    return response.data;
  },

  /**
   * Reactivate membership
   */
  reactivateMembership: async () => {
    const response = await api.post<{ message: string; reactivated_at: string }>(
      '/users/reactivate-membership/'
    );
    return response.data;
  },

  /**
   * Toggle auto-renew
   */
  toggleAutoRenew: async (enabled: boolean) => {
    const response = await api.post<{ message: string; auto_renew: boolean }>(
      '/users/toggle-auto-renew/',
      { enabled }
    );
    return response.data;
  },

  /**
   * Send contact message
   */
  sendContact: async (data: {
    name: string;
    email: string;
    phone?: string;
    userType?: string;
    message: string;
  }) => {
    const response = await api.post<{ message: string }>('/users/contact/', data);
    return response.data;
  },
};
