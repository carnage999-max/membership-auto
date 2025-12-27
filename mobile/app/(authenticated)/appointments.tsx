import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { appointmentService } from '@/services/api/appointment.service';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Plus, ChevronRight, X, Car, Wrench } from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Appointment } from '@/types';
import { router } from 'expo-router';

const AppointmentsScreen = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

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
    setSelectedAppointment(appointment);
  };

  const handleBookNew = () => {
    router.push('/book-appointment');
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getServiceName = (appointment: Appointment) => {
    if (appointment.services && appointment.services.length > 0) {
      return appointment.services.map((s) => s.name).join(', ');
    }
    return 'Service Appointment';
  };

  const getStatusStyle = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return { bg: 'bg-success/20', text: 'text-success' };
      case 'scheduled':
        return { bg: 'bg-gold/20', text: 'text-gold' };
      case 'in_progress':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400' };
      case 'completed':
        return { bg: 'bg-green-500/20', text: 'text-green-400' };
      case 'cancelled':
        return { bg: 'bg-error/20', text: 'text-error' };
      default:
        return { bg: 'bg-textMuted/20', text: 'text-textMuted' };
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
              {appointments.map((appointment) => {
                const statusStyle = getStatusStyle(appointment.status);
                return (
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
                            {getServiceName(appointment)}
                          </Text>

                          {/* Date */}
                          <View className="mt-3 flex-row items-center">
                            <Calendar size={16} color="#cba86e" />
                            <Text className="ml-2 text-sm text-textSecondary">
                              {formatDate(appointment.startTime)}
                            </Text>
                          </View>

                          {/* Time */}
                          <View className="mt-2 flex-row items-center">
                            <Clock size={16} color="#cba86e" />
                            <Text className="ml-2 text-sm text-textSecondary">
                              {formatTime(appointment.startTime)}
                            </Text>
                          </View>

                          {/* Location */}
                          {appointment.locationId && (
                            <View className="mt-2 flex-row items-center">
                              <MapPin size={16} color="#cba86e" />
                              <Text className="ml-2 flex-1 text-sm text-textSecondary">
                                Location: {appointment.locationId}
                              </Text>
                            </View>
                          )}

                          {/* Status Badge */}
                          <View className="mt-3">
                            <View
                              className={`self-start rounded-full px-3 py-1 ${statusStyle.bg}`}
                            >
                              <Text className={`text-xs font-medium ${statusStyle.text}`}>
                                {appointment.status.charAt(0).toUpperCase() +
                                  appointment.status.slice(1).replace('_', ' ')}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Arrow Icon */}
                        <ChevronRight size={20} color="#707070" />
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Appointment Detail Modal */}
      <Modal
        visible={selectedAppointment !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedAppointment(null)}
      >
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
            <Text className="text-xl font-bold text-foreground">Appointment Details</Text>
            <TouchableOpacity
              onPress={() => setSelectedAppointment(null)}
              activeOpacity={0.7}
            >
              <X size={24} color="#707070" />
            </TouchableOpacity>
          </View>

          {selectedAppointment && (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
            >
              {/* Service Type Header */}
              <View className="items-center mb-6">
                <View className="w-20 h-20 rounded-full bg-gold/20 items-center justify-center mb-4">
                  <Wrench size={40} color="#cba86e" />
                </View>
                <Text className="text-2xl font-bold text-foreground text-center">
                  {getServiceName(selectedAppointment)}
                </Text>
                {(() => {
                  const statusStyle = getStatusStyle(selectedAppointment.status);
                  return (
                    <View className={`mt-3 rounded-full px-4 py-1 ${statusStyle.bg}`}>
                      <Text className={`text-sm font-medium ${statusStyle.text}`}>
                        {selectedAppointment.status.charAt(0).toUpperCase() +
                          selectedAppointment.status.slice(1).replace('_', ' ')}
                      </Text>
                    </View>
                  );
                })()}
              </View>

              {/* Details Card */}
              <Card className="mb-4">
                <View className="gap-4">
                  {/* Date */}
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-gold/10 items-center justify-center">
                      <Calendar size={20} color="#cba86e" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-xs text-textMuted">Date</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {new Date(selectedAppointment.startTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* Time */}
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-gold/10 items-center justify-center">
                      <Clock size={20} color="#cba86e" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-xs text-textMuted">Time</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {formatTime(selectedAppointment.startTime)}
                      </Text>
                    </View>
                  </View>

                  {/* Duration */}
                  {selectedAppointment.estimatedDuration && (
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-gold/10 items-center justify-center">
                        <Clock size={20} color="#cba86e" />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-xs text-textMuted">Estimated Duration</Text>
                        <Text className="text-base font-semibold text-foreground">
                          {selectedAppointment.estimatedDuration} minutes
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Location */}
                  {selectedAppointment.locationId && (
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-gold/10 items-center justify-center">
                        <MapPin size={20} color="#cba86e" />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-xs text-textMuted">Location</Text>
                        <Text className="text-base font-semibold text-foreground">
                          Location ID: {selectedAppointment.locationId}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Vehicle */}
                  {selectedAppointment.vehicleId && (
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-gold/10 items-center justify-center">
                        <Car size={20} color="#cba86e" />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-xs text-textMuted">Vehicle</Text>
                        <Text className="text-base font-semibold text-foreground">
                          Vehicle ID: {selectedAppointment.vehicleId}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </Card>

              {/* Services List */}
              {selectedAppointment.services && selectedAppointment.services.length > 0 && (
                <Card className="mb-4">
                  <Text className="text-sm font-semibold text-foreground mb-3">Services</Text>
                  <View className="gap-2">
                    {selectedAppointment.services.map((service) => (
                      <View key={service.id} className="flex-row items-center justify-between py-2 border-b border-border last:border-b-0">
                        <View className="flex-1">
                          <Text className="text-base text-foreground">{service.name}</Text>
                          {service.description && (
                            <Text className="text-sm text-textMuted">{service.description}</Text>
                          )}
                        </View>
                        {service.includedInMembership ? (
                          <Text className="text-sm text-success font-medium">Included</Text>
                        ) : service.price ? (
                          <Text className="text-sm text-foreground font-medium">${service.price}</Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                </Card>
              )}

              {/* Notes if any */}
              {selectedAppointment.notes && (
                <Card className="mb-4">
                  <Text className="text-sm text-textMuted mb-2">Notes</Text>
                  <Text className="text-base text-foreground">
                    {selectedAppointment.notes}
                  </Text>
                </Card>
              )}
            </ScrollView>
          )}

          {/* Bottom Actions */}
          <View
            className="px-4 py-4 border-t border-border bg-background"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedAppointment(null)}
              className="items-center justify-center rounded-xl bg-gold py-4"
              activeOpacity={0.7}
            >
              <Text className="text-base font-semibold text-background">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AppointmentsScreen;
