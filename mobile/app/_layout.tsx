import { ErrorBoundary } from '@components/error-boundary';
import Toaster from '@components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useCustomFonts from '@utils/hooks/use-custom-fonts';
import '@utils/i18n/config';
import { ApiProvider } from '@utils/providers/api-provider';
import { Slot, SplashScreen } from 'expo-router';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useCustomFonts({
    callback: async () => {
      await SplashScreen.hideAsync();
    },
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ApiProvider>
          <Slot />
          <Toaster />
        </ApiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
