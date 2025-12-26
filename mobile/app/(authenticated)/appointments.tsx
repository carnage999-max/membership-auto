import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { appointmentService } from '@/services/api/appointment.service';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Plus, ChevronRight } from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Appointment } from '@/types';
import { router } from 'expo-router';

const AppointmentsScreen = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: appointments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['appointments'],
    queryFn: appointmentService.getUpcoming,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    // Navigate to appointment details (would need to create this screen)
    Alert.alert(
      'Appointment Details',
      `Service: ${appointment.service_type}\nDate: ${new Date(appointment.date).toLocaleDateString()}\nTime: ${appointment.time}\nLocation: ${appointment.location_name || 'N/A'}`,
      [{ text: 'OK' }]
    );
  };

  const handleBookNew = () => {
    // Navigate to booking flow (would need to create this screen)
    Alert.alert(
      'Book Appointment',
      'Appointment booking flow coming soon',
      [{ text: 'OK' }]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#cba86e" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#cba86e"
          />
        }
      >
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground">My Appointments</Text>
            <Text className="mt-1 text-sm text-textSecondary">
              Manage your service appointments
            </Text>
          </View>

          {/* Book New Appointment Button */}
          <TouchableOpacity
            onPress={handleBookNew}
            className="mb-6 flex-row items-center justify-center rounded-xl bg-gold py-4"
            activeOpacity={0.7}
          >
            <Plus size={20} color="#0d0d0d" />
            <Text className="ml-2 text-base font-semibold text-background">
              Book New Appointment
            </Text>
          </TouchableOpacity>

          {/* Appointments List */}
          {!appointments || appointments.length === 0 ? (
            <Card className="items-center py-12">
              <Calendar size={64} color="#707070" />
              <Text className="mt-4 text-lg font-semibold text-foreground">
                No Appointments
              </Text>
              <Text className="mt-2 text-center text-sm text-textSecondary">
                You don't have any upcoming appointments.
              </Text>
              <Text className="mt-1 text-center text-sm text-textSecondary">
                Book one to get started!
              </Text>
            </Card>
          ) : (
            <View className="gap-4">
              {appointments.map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  onPress={() => handleAppointmentPress(appointment)}
                  activeOpacity={0.7}
                >
                  <Card className="p-4">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        {/* Service Type */}
                        <Text className="text-lg font-semibold text-foreground">
                          {appointment.service_type}
                        </Text>

                        {/* Date */}
                        <View className="mt-3 flex-row items-center">
                          <Calendar size={16} color="#cba86e" />
                          <Text className="ml-2 text-sm text-textSecondary">
                            {formatDate(appointment.date)}
                          </Text>
                        </View>

                        {/* Time */}
                        <View className="mt-2 flex-row items-center">
                          <Clock size={16} color="#cba86e" />
                          <Text className="ml-2 text-sm text-textSecondary">
                            {appointment.time}
                          </Text>
                        </View>

                        {/* Location */}
                        {appointment.location_name && (
                          <View className="mt-2 flex-row items-center">
                            <MapPin size={16} color="#cba86e" />
                            <Text className="ml-2 flex-1 text-sm text-textSecondary">
                              {appointment.location_name}
                            </Text>
                          </View>
                        )}

                        {/* Status Badge */}
                        <View className="mt-3">
                          <View
                            className={`self-start rounded-full px-3 py-1 ${
                              appointment.status === 'confirmed'
                                ? 'bg-success/20'
                                : appointment.status === 'pending'
                                  ? 'bg-gold/20'
                                  : 'bg-textMuted/20'
                            }`}
                          >
                            <Text
                              className={`text-xs font-medium ${
                                appointment.status === 'confirmed'
                                  ? 'text-success'
                                  : appointment.status === 'pending'
                                    ? 'text-gold'
                                    : 'text-textMuted'
                              }`}
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Arrow Icon */}
                      <ChevronRight size={20} color="#707070" />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AppointmentsScreen;
