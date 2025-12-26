import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { vehicleService } from '@/services/api/vehicle.service';
import { useAuthStore } from '@/stores/auth.store';
import { useVehicleStore } from '@/stores/vehicle.store';
import { useQuery } from '@tanstack/react-query';
import { Car, CheckCircle2, Gauge, Plus } from 'lucide-react-native';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VehiclesScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { vehicles, activeVehicleId, setVehicles, setActiveVehicle } = useVehicleStore();

  const {
    data: vehiclesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleService.getVehicles,
    enabled: !!user,
  });

  React.useEffect(() => {
    if (vehiclesData) {
      setVehicles(vehiclesData);
    }
  }, [vehiclesData, setVehicles]);

  const handleSetActive = (vehicleId: string) => {
    setActiveVehicle(vehicleId);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#cba86e" />
        }
      >
        <View className="px-4 pt-4">
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-foreground">My Vehicles</Text>
              <Text className="mt-1 text-sm text-textSecondary">
                {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
              </Text>
            </View>
            <Button size="sm" leftIcon={<Plus size={16} color="#0d0d0d" />}>
              Add
            </Button>
          </View>

          {vehicles.length === 0 && !isLoading && (
            <Card className="items-center py-12">
              <Car size={64} color="#707070" />
              <Text className="mt-4 text-lg font-semibold text-foreground">No Vehicles Yet</Text>
              <Text className="mt-2 text-center text-sm text-textSecondary">
                Add your first vehicle to start tracking maintenance
              </Text>
              <Button className="mt-6" leftIcon={<Plus size={20} color="#0d0d0d" />}>
                Add Your First Vehicle
              </Button>
            </Card>
          )}

          {vehicles.map((vehicle) => {
            const isActive = vehicle.id === activeVehicleId;

            return (
              <Card
                key={vehicle.id}
                className={'mb-4 ' + (isActive ? 'border-2 border-gold' : '')}
                variant="elevated"
              >
                {isActive && (
                  <View className="mb-3 rounded-full bg-gold/20 self-start px-3 py-1">
                    <Text className="text-xs font-semibold text-gold">Active Vehicle</Text>
                  </View>
                )}

                <View className="mb-3">
                  <Text className="text-xl font-bold text-foreground">
                    {vehicle.year} {vehicle.make}
                  </Text>
                  <Text className="mt-1 text-base text-textSecondary">{vehicle.model}</Text>
                </View>

                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Gauge size={16} color="#cba86e" />
                    <Text className="ml-2 text-sm text-textSecondary">
                      {vehicle.odometer?.toLocaleString() || '0'} miles
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <CheckCircle2 size={16} color="#4caf50" />
                    <Text className="ml-2 text-sm text-success">Health: Good</Text>
                  </View>
                </View>

                {vehicle.vin && (
                  <View className="mb-4 rounded-lg bg-surface p-3">
                    <Text className="text-xs text-textMuted">VIN</Text>
                    <Text className="mt-1 text-xs font-mono text-textSecondary">{vehicle.vin}</Text>
                  </View>
                )}

                <View className="flex-row items-center justify-between pt-4 border-t border-border">
                  {!isActive && (
                    <TouchableOpacity onPress={() => handleSetActive(vehicle.id)} className="flex-1 mr-2">
                      <View className="rounded-lg bg-gold/10 py-2 px-4 items-center">
                        <Text className="text-sm font-semibold text-gold">Set as Active</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default VehiclesScreen;
