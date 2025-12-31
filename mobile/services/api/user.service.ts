import { api } from './client';
import type { User } from '@/types';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UpdateNotificationSettingsData {
  settings: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    appointmentReminders?: boolean;
    membershipUpdates?: boolean;
    promotionalOffers?: boolean;
    serviceReminders?: boolean;
  };
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
    // Split name into first_name and last_name for backend
    const nameParts = data.name?.split(' ') || [];
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    const payload = {
      first_name,
      last_name,
      phone: data.phone,
    };

    const response = await api.patch<{ message: string }>('/users/profile/', payload);
    return response.data;
  },

  /**
   * Update notification settings
   */
  updateNotificationSettings: async (data: UpdateNotificationSettingsData) => {
    const response = await api.patch<{ message: string }>('/users/profile/', data);
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
