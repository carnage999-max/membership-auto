import Toaster from '@components/ui/toaster';
import { Toast } from '@components/ui/toast';
import { ErrorBoundary } from '@components/error-boundary';
import * as Sentry from '@sentry/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useCustomFonts from '@utils/hooks/use-custom-fonts';
import '@utils/i18n/config';
import { ApiProvider } from '@utils/providers/api-provider';
import { isRunningInExpoGo } from 'expo';
import { Slot, SplashScreen, useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import '../global.css';

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  debug: __DEV__,
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_SENTRY_ENV || 'development',
  integrations: [navigationIntegration],
  enableNativeFramesTracking: !isRunningInExpoGo(),
  tracesSampleRate: 1.0,
  beforeSend: (event, hint) => {
    // Don't send events in development unless DSN is configured
    if (__DEV__ && !process.env.EXPO_PUBLIC_SENTRY_DSN) {
      return null;
    }
    return event;
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        // Log mutation errors to Sentry
        Sentry.captureException(error, {
          tags: {
            errorType: 'mutation',
          },
        });
      },
    },
  },
});

// Keep splash screen visible while we fetch fonts and other assets
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, fontError] = useCustomFonts({
    callback: async () => {
      await SplashScreen.hideAsync();
    },
  });

  // Capture the NavigationContainer ref and register it with the instrumentation.
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ApiProvider>
          <Slot />
          <Toaster />
          <Toast />
        </ApiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default Sentry.wrap(RootLayout);
