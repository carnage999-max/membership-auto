import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { serviceService } from '@/services/api/service.service';
import { vehicleService } from '@/services/api/vehicle.service';
import { useQuery } from '@tanstack/react-query';
import {
  Wrench,
  Calendar,
  Clock,
  AlertCircle,
  Car,
  Gauge,
  ChevronRight,
} from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { RecommendedService } from '@/types';

const ServiceScheduleScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  // Fetch vehicles
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleService.getVehicles,
  });

  // Fetch service schedules
  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ['serviceSchedules', selectedVehicle],
    queryFn: () => serviceService.getSchedules(selectedVehicle),
    enabled: !!selectedVehicle,
  });

  // Set first vehicle as default
  React.useEffect(() => {
    if (vehicles && vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0].id);
    }
  }, [vehicles, selectedVehicle]);

  const handleBookService = (schedule: RecommendedService) => {
    router.push('/(authenticated)/book-appointment' as any);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-textSecondary';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error/20 border-error';
      case 'medium':
        return 'bg-warning/20 border-warning';
      case 'low':
        return 'bg-success/20 border-success';
      default:
        return 'bg-surface border-border';
    }
  };

  const renderServiceCard = (schedule: RecommendedService) => (
    <Card key={schedule.id} className="mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Wrench size={18} color="#cba86e" />
            <Text className="ml-2 text-lg font-bold text-foreground">
              {schedule.service.name}
            </Text>
          </View>
          <Text className="text-sm text-textSecondary mb-2">
            {schedule.service.description}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded ${getPriorityBgColor(schedule.priority)}`}>
          <Text className={`text-xs font-semibold capitalize ${getPriorityColor(schedule.priority)}`}>
            {schedule.priority}
          </Text>
        </View>
      </View>

      {/* Due Information */}
      <View className="space-y-2 mb-3">
        {schedule.dueByMileage && (
          <View className="flex-row items-center">
            <Gauge size={16} color="#707070" />
            <Text className="ml-2 text-sm text-textSecondary">
              Due at {schedule.dueByMileage.toLocaleString()} miles
            </Text>
          </View>
        )}

        {schedule.dueByDate && (
          <View className="flex-row items-center">
            <Calendar size={16} color="#707070" />
            <Text className="ml-2 text-sm text-textSecondary">
              Due by {new Date(schedule.dueByDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        <View className="flex-row items-center">
          <Clock size={16} color="#707070" />
          <Text className="ml-2 text-sm text-textSecondary">
            Estimated duration: {schedule.service.estimatedDuration} minutes
          </Text>
        </View>
      </View>

      {/* Reason */}
      {schedule.reason && (
        <View className="bg-surface p-3 rounded-lg mb-3">
          <View className="flex-row items-start">
            <AlertCircle size={16} color="#cba86e" className="mt-0.5" />
            <Text className="ml-2 text-sm text-foreground flex-1">{schedule.reason}</Text>
          </View>
        </View>
      )}

      {/* Membership Status */}
      {schedule.service.includedInMembership ? (
        <View className="bg-gold/10 border border-gold p-2 rounded-lg mb-3">
          <Text className="text-sm font-semibold text-gold text-center">
            Included in Your Membership
          </Text>
        </View>
      ) : schedule.service.price && (
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm text-textSecondary">Estimated Cost:</Text>
          <Text className="text-lg font-bold text-foreground">
            ${schedule.service.price.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Book Button */}
      <Button
        variant={schedule.priority === 'high' ? 'primary' : 'outline'}
        size="sm"
        onPress={() => handleBookService(schedule)}
        rightIcon={<ChevronRight size={18} color={schedule.priority === 'high' ? '#ffffff' : '#cba86e'} />}
      >
        Book This Service
      </Button>
    </Card>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground">Service Schedule</Text>
            <Text className="text-sm text-textSecondary">
              Recommended maintenance for your vehicle
            </Text>
          </View>

          {/* Vehicle Selector */}
          {vehiclesLoading ? (
            <Card className="mb-4">
              <ActivityIndicator color="#cba86e" />
            </Card>
          ) : vehicles && vehicles.length > 0 ? (
            <Card className="mb-4">
              <Text className="text-sm font-medium text-textSecondary mb-2">Select Vehicle</Text>
              <View className="flex-row flex-wrap gap-2">
                {vehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    onPress={() => setSelectedVehicle(vehicle.id)}
                    className={`flex-row items-center px-3 py-2 rounded-lg border ${
                      selectedVehicle === vehicle.id
                        ? 'bg-gold/20 border-gold'
                        : 'bg-surface border-border'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Car size={16} color={selectedVehicle === vehicle.id ? '#cba86e' : '#707070'} />
                    <Text
                      className={`ml-2 text-sm font-medium ${
                        selectedVehicle === vehicle.id ? 'text-gold' : 'text-foreground'
                      }`}
                    >
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          ) : (
            <Card className="mb-4 items-center py-6">
              <Text className="text-sm text-textSecondary">No vehicles added yet</Text>
            </Card>
          )}

          {/* Service Schedules */}
          {selectedVehicle && (
            <>
              {schedulesLoading ? (
                <Card className="items-center py-8">
                  <ActivityIndicator color="#cba86e" />
                </Card>
              ) : schedules && schedules.length > 0 ? (
                <>
                  {/* Priority Info Banner */}
                  <Card className="mb-4 bg-gold/10 border-gold">
                    <Text className="text-sm text-foreground">
                      Services are ordered by priority. High priority services should be scheduled soon.
                    </Text>
                  </Card>

                  {/* Service List */}
                  <View className="space-y-3">
                    {schedules
                      .sort((a, b) => {
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        return (
                          priorityOrder[a.priority as keyof typeof priorityOrder] -
                          priorityOrder[b.priority as keyof typeof priorityOrder]
                        );
                      })
                      .map((schedule) => renderServiceCard(schedule))}
                  </View>
                </>
              ) : (
                <Card className="items-center py-12">
                  <Wrench size={48} color="#cba86e" />
                  <Text className="mt-4 text-lg font-semibold text-foreground">
                    No Services Due
                  </Text>
                  <Text className="mt-2 text-center text-sm text-textSecondary px-8">
                    Your vehicle is up to date! We'll notify you when service is needed.
                  </Text>
                </Card>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ServiceScheduleScreen;
