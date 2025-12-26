import React from 'react';
import { Card } from '@/components/ui/card';
import { QuickActionButton } from '@/components/ui/quick-action-button';
import { QUICK_ACTIONS } from '@/constants';
import { offerService } from '@/services/api/offer.service';
import { vehicleService } from '@/services/api/vehicle.service';
import { useAuthStore } from '@/stores/auth.store';
import { useVehicleStore } from '@/stores/vehicle.store';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Gauge,
  HelpCircle,
  MapPin,
  Phone,
  Tag,
  Users,
} from 'lucide-react-native';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Map icon names to components
const iconMap: Record<string, any> = {
  tag: Tag,
  gauge: Gauge,
  car: Car,
  'help-circle': HelpCircle,
  'map-pin': MapPin,
  phone: Phone,
  users: Users,
};

const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { activeVehicleId, vehicles, setVehicles } = useVehicleStore();

  // Fetch vehicles
  const {
    data: vehiclesData,
    isLoading: vehiclesLoading,
    refetch: refetchVehicles,
  } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleService.getVehicles,
    enabled: !!user,
  });

  // Fetch offers
  const {
    data: offers,
    isLoading: offersLoading,
    refetch: refetchOffers,
  } = useQuery({
    queryKey: ['offers'],
    queryFn: () => offerService.getOffers(),
    enabled: !!user,
  });

  // Update local vehicle store when data is fetched
  React.useEffect(() => {
    if (vehiclesData) {
      setVehicles(vehiclesData);
    }
  }, [vehiclesData, setVehicles]);

  const isRefreshing = vehiclesLoading || offersLoading;

  const handleRefresh = () => {
    refetchVehicles();
    refetchOffers();
  };

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[number]) => {
    router.push(action.route as any);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#cba86e" />
      }
    >
      <View className="px-4 pt-4">
        {/* Welcome Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Member'}!
          </Text>
          <Text className="mt-1 text-sm text-textSecondary">Your automotive care dashboard</Text>
        </View>

        {/* Membership Status Card */}
        <Card className="mb-4" variant="elevated">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-foreground">Membership Status</Text>
            <View className="rounded-full bg-success/20 px-3 py-1">
              <Text className="text-xs font-semibold text-success">Active</Text>
            </View>
          </View>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <CheckCircle2 size={16} color="#4caf50" />
              <Text className="ml-2 text-sm text-textSecondary">Premium Plan • Renews Monthly</Text>
            </View>
            <View className="flex-row items-center">
              <Calendar size={16} color="#cba86e" />
              <Text className="ml-2 text-sm text-textSecondary">
                Next renewal: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Active Vehicle Card */}
        {activeVehicle && (
          <Card className="mb-4" variant="elevated">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Active Vehicle</Text>
              <View className="rounded-full bg-gold/20 px-3 py-1">
                <Text className="text-xs font-semibold text-gold">
                  {activeVehicle.odometer?.toLocaleString() || '0'} mi
                </Text>
              </View>
            </View>
            <View className="space-y-2">
              <Text className="text-base font-medium text-foreground">
                {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </Text>
              <View className="flex-row items-center">
                <Gauge size={16} color="#cba86e" />
                <Text className="ml-2 text-sm text-textSecondary">Health: Good • No alerts</Text>
              </View>
            </View>
          </Card>
        )}

        {/* No Vehicles Message */}
        {vehicles.length === 0 && !vehiclesLoading && (
          <Card className="mb-4" variant="elevated">
            <View className="items-center py-4">
              <Car size={40} color="#707070" />
              <Text className="mt-3 text-base font-medium text-foreground">No Vehicles Added</Text>
              <Text className="mt-1 text-center text-sm text-textSecondary">
                Add your first vehicle to get started with maintenance tracking
              </Text>
            </View>
          </Card>
        )}

        {/* Special Offers Banner */}
        {offers && offers.length > 0 && (
          <Card className="mb-4 border-2 border-gold/30 bg-gold/10" variant="elevated">
            <View className="flex-row items-start">
              <Tag size={20} color="#cba86e" className="mt-1" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-gold">
                  {offers.length} Special Offer{offers.length > 1 ? 's' : ''} Available!
                </Text>
                <Text className="mt-1 text-sm text-textSecondary">{offers[0].title}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <View className="mb-4">
          <Text className="mb-4 text-lg font-semibold text-foreground">Quick Actions</Text>
          <View className="flex-row flex-wrap">
            {QUICK_ACTIONS.map((action) => {
              const Icon = iconMap[action.icon];
              return (
                <View key={action.key} className="w-1/4 p-2">
                  <QuickActionButton
                    icon={Icon}
                    title={action.title}
                    onPress={() => handleQuickAction(action)}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Next Service Card (Placeholder) */}
        <Card className="mb-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-foreground">Next Service</Text>
            <AlertCircle size={20} color="#cba86e" />
          </View>
          <View>
            <Text className="mb-2 text-base font-medium text-foreground">
              Routine Maintenance
            </Text>
            <View className="flex-row items-center">
              <Calendar size={16} color="#707070" />
              <Text className="ml-2 text-sm text-textSecondary">
                Recommended at 5,000 miles or 3 months
              </Text>
            </View>
            <View className="mt-3 rounded-lg bg-gold/10 p-3">
              <Text className="text-xs font-medium text-gold">
                Includes: Oil change, tire rotation, brake inspection
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;
