import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '@/constants';
import * as SecureStore from 'expo-secure-store';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import useToastStore from '@/utils/stores/toast-store';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing token to prevent race conditions
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _suppressErrorToast?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request to retry after refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/users/refresh/`, {
          refresh: refreshToken,
        });

        // Handle both 'access' and 'accessToken' field names
        const newAccessToken = response.data.access || response.data.accessToken;

        if (!newAccessToken) {
          throw new Error('No access token in response');
        }

        // Save new access token
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

        isRefreshing = false;
        processQueue(null, newAccessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        // Refresh failed, clear tokens and redirect to login
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

        // Show error toast
        useToastStore.getState().setToast({
          type: 'error',
          message: 'Session expired. Please login again.',
        });

        // Import auth store dynamically to avoid circular dependency
        const { useAuthStore } = await import('@/stores/auth.store');

        // Clear auth state and redirect to login
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });

        return Promise.reject(refreshError);
      }
    }

    // Only show error toast if not suppressed
    if (!originalRequest._suppressErrorToast) {
      const errorMessage = handleApiError(error);
      useToastStore.getState().setToast({
        type: 'error',
        message: errorMessage,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      return error.response.data?.message || 'An error occurred';
    } else if (error.request) {
      // Request made but no response
      return 'Network error. Please check your connection.';
    }
  }

  return 'An unexpected error occurred';
};

// Extended config type with suppressErrorToast option
export interface ApiRequestConfig extends AxiosRequestConfig {
  suppressErrorToast?: boolean;
}

// Type-safe API wrapper
export const api = {
  get: <T = any>(url: string, config?: ApiRequestConfig) => {
    const axiosConfig = { ...config };
    if (config?.suppressErrorToast) {
      (axiosConfig as any)._suppressErrorToast = true;
    }
    return apiClient.get<T>(url, axiosConfig);
  },

  post: <T = any>(url: string, data?: any, config?: ApiRequestConfig) => {
    const axiosConfig = { ...config };
    if (config?.suppressErrorToast) {
      (axiosConfig as any)._suppressErrorToast = true;
    }
    return apiClient.post<T>(url, data, axiosConfig);
  },

  put: <T = any>(url: string, data?: any, config?: ApiRequestConfig) => {
    const axiosConfig = { ...config };
    if (config?.suppressErrorToast) {
      (axiosConfig as any)._suppressErrorToast = true;
    }
    return apiClient.put<T>(url, data, axiosConfig);
  },

  patch: <T = any>(url: string, data?: any, config?: ApiRequestConfig) => {
    const axiosConfig = { ...config };
    if (config?.suppressErrorToast) {
      (axiosConfig as any)._suppressErrorToast = true;
    }
    return apiClient.patch<T>(url, data, axiosConfig);
  },

  delete: <T = any>(url: string, config?: ApiRequestConfig) => {
    const axiosConfig = { ...config };
    if (config?.suppressErrorToast) {
      (axiosConfig as any)._suppressErrorToast = true;
    }
    return apiClient.delete<T>(url, config);
  },
};
