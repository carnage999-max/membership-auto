import { useAuthStore } from '@/stores/auth.store';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser().finally(() => setIsLoading(false));
  }, [loadUser]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d0d' }}>
        <ActivityIndicator size="large" color="#cba86e" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(authenticated)" />;
  }

  return <Redirect href="/(guest)" />;
}
