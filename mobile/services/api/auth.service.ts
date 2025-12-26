import { AuthTokens, LoginCredentials, SignUpData, User } from '@/types';
import { api } from './client';

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<{ user: User } & AuthTokens>(
      '/users/login/',
      credentials
    );
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: SignUpData) => {
    const response = await api.post<{ user: User } & AuthTokens>(
      '/users/register/',
      data
    );
    return response.data;
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
  getProfile: async () => {
    const response = await api.get<User>('/users/profile/');
    return response.data;
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
