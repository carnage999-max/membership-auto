import { STORAGE_KEYS } from '@/constants';
import { authService } from '@/services/api/auth.service';
import { LoginCredentials, SignUpData, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const { user, accessToken, refreshToken } = await authService.login(credentials);

          // Save tokens securely
          await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

          set({ user, isAuthenticated: true, isLoading: false });

          // Navigate to authenticated area
          router.replace('/(authenticated)');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (data: SignUpData) => {
        try {
          set({ isLoading: true, error: null });

          const { user, accessToken, refreshToken } = await authService.register(data);

          // Save tokens securely
          await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

          set({ user, isAuthenticated: true, isLoading: false });

          // Navigate to authenticated area
          router.replace('/(authenticated)');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          // Call logout API (optional, for server-side cleanup)
          try {
            await authService.logout();
          } catch (error) {
            // Ignore logout API errors, continue with local cleanup
            console.error('Logout API error:', error);
          }

          // Clear secure tokens
          await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

          // Clear user data
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });

          // Navigate to login
          router.replace('/(guest)');
        } catch (error) {
          console.error('Logout error:', error);
          set({ isLoading: false });
        }
      },

      loadUser: async () => {
        try {
          const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

          if (!token) {
            set({ isAuthenticated: false, user: null });
            return;
          }

          // If we have a token and persisted user data, use that first
          const currentState = get();
          if (currentState.user && currentState.isAuthenticated) {
            // Already have user data from persistence, try to refresh in background
            set({ isLoading: false });

            // Try to refresh user data in background (don't block)
            authService.getProfile()
              .then((user) => set({ user }))
              .catch((error) => console.warn('Background profile refresh failed:', error));

            return;
          }

          set({ isLoading: true });

          const user = await authService.getProfile();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          console.error('Load user error:', error);

          // Only clear tokens on 401 (unauthorized), not on 500 (server error)
          if (error?.response?.status === 401) {
            await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
            set({ user: null, isAuthenticated: false, isLoading: false });
          } else {
            // Keep existing persisted state on server errors
            const currentState = get();
            if (currentState.user) {
              set({ isAuthenticated: true, isLoading: false });
            } else {
              set({ isAuthenticated: false, isLoading: false });
            }
          }
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: STORAGE_KEYS.USER_DATA,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
