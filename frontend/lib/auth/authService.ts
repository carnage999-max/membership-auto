import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../api/config';
import { tokenStorage } from './tokenStorage';

export interface LoginCredentials {
  email: string;
  password: string;
  deviceId?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    membershipId: string | null;
    referralCode: string;
    rewardsBalance: number;
    createdAt: string;
  };
}

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      const { accessToken, refreshToken, user } = response.data;

      // Store tokens and user data
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);
      tokenStorage.setUser(user);

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );

      const { accessToken, refreshToken, user } = response.data;

      // Store tokens and user data
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);
      tokenStorage.setUser(user);

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  /**
   * Logout user
   */
  logout: (): void => {
    tokenStorage.clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  /**
   * Get current user from storage
   */
  getCurrentUser: () => {
    return tokenStorage.getUser();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return tokenStorage.isAuthenticated();
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<{ accessToken: string }>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      const { accessToken } = response.data;
      tokenStorage.setAccessToken(accessToken);

      return accessToken;
    } catch (error: any) {
      tokenStorage.clearAuth();
      throw new Error(error.response?.data?.error || 'Token refresh failed');
    }
  },
};
