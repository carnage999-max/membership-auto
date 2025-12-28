import { AuthTokens, LoginCredentials, SignUpData, User } from '@/types';
import { api } from './client';

// Transform snake_case API response to camelCase User type
const transformUserData = (data: any): User => {
  return {
    id: data.id,
    email: data.email,
    phone: data.phone,
    name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
    membershipId: data.membership_id || data.membershipId,
    membershipPlan: data.membership_plan || data.membershipPlan || null,
    membershipStatus: data.membership_status || data.membershipStatus || 'unknown',
    monthlyFee: data.monthly_fee ?? data.monthlyFee ?? 0,
    renewalDate: data.renewal_date || data.renewalDate || null,
    canCancel: data.can_cancel ?? data.canCancel ?? false,
    canReactivate: data.can_reactivate ?? data.canReactivate ?? false,
    autoRenew: data.auto_renew ?? data.autoRenew ?? false,
    referralCode: data.referral_code || data.referralCode || '',
    rewardsBalance: data.rewards_balance ?? data.rewardsBalance ?? 0,
    createdAt: data.created_at || data.createdAt || '',
    updatedAt: data.updated_at || data.updatedAt || '',
  };
};

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<any>('/users/login/', credentials);
    const data = response.data;
    return {
      user: transformUserData(data.user || data),
      accessToken: data.accessToken || data.access_token || data.access,
      refreshToken: data.refreshToken || data.refresh_token || data.refresh,
    };
  },

  /**
   * Register new user
   */
  register: async (data: SignUpData) => {
    const response = await api.post<any>('/users/register/', data);
    const responseData = response.data;
    return {
      user: transformUserData(responseData.user || responseData),
      accessToken: responseData.accessToken || responseData.access_token || responseData.access,
      refreshToken: responseData.refreshToken || responseData.refresh_token || responseData.refresh,
    };
  },

  /**
   * Logout user (client-side only)
   */
  logout: async () => {
    // No backend logout endpoint needed, just clear local storage
    return Promise.resolve();
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string) => {
    const response = await api.post<{ message: string }>('/users/forgot-password/', { email });
    return response.data;
  },

  /**
   * Reset password with code
   */
  resetPassword: async (email: string, code: string, newPassword: string) => {
    const response = await api.post<{ message: string }>('/users/reset-password/', {
      email,
      code,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (options?: { suppressErrorToast?: boolean }) => {
    const response = await api.get<any>('/users/profile/', {
      suppressErrorToast: options?.suppressErrorToast,
    });
    return transformUserData(response.data);
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>) => {
    const response = await api.put<User>('/users/profile/', data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post<{ message: string }>('/users/change-password/', {
      old_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string) => {
    const response = await api.post<AuthTokens>('/users/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};
