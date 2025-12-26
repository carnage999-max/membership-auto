import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { vehicleService } from '@/services/api/vehicle.service';
import { appointmentService } from '@/services/api/appointment.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';
import {
  Car,
  MapPin,
  Wrench,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Vehicle, ServiceLocation, TimeSlot } from '@/types';

type BookingStep = 'vehicle' | 'location' | 'service' | 'datetime' | 'confirm';

const BookAppointmentScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<BookingStep>('vehicle');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ServiceLocation | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Fetch vehicles
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleService.getVehicles,
  });

  // Fetch locations
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: appointmentService.getLocations,
  });

  // Fetch available time slots
  const { data: timeSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ['availability', selectedLocation?.id, selectedService, selectedDate],
    queryFn: () =>
      appointmentService.getAvailability({
        location_id: selectedLocation!.id,
        service_type: selectedService,
        date: selectedDate,
      }),
    enabled: !!selectedLocation && !!selectedService && !!selectedDate,
  });

  // Book appointment mutation
  const bookMutation = useMutation({
    mutationFn: appointmentService.book,
    onSuccess: () => {
      showToast('success', 'Appointment booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.back();
    },
    onError: () => {
      showToast('error', 'Failed to book appointment');
    },
  });

  const handleNext = () => {
    if (currentStep === 'vehicle' && !selectedVehicle) {
      showToast('error', 'Please select a vehicle');
      return;
    }
    if (currentStep === 'location' && !selectedLocation) {
      showToast('error', 'Please select a location');
      return;
    }
    if (currentStep === 'service' && !selectedService) {
      showToast('error', 'Please select a service');
      return;
    }
    if (currentStep === 'datetime' && (!selectedDate || !selectedTime)) {
      showToast('error', 'Please select date and time');
      return;
    }

    const steps: BookingStep[] = ['vehicle', 'location', 'service', 'datetime', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: BookingStep[] = ['vehicle', 'location', 'service', 'datetime', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      router.back();
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedVehicle || !selectedLocation || !selectedService || !selectedDate || !selectedTime) {
      showToast('error', 'Please complete all required fields');
      return;
    }

    bookMutation.mutate({
      location_id: selectedLocation.id,
      service_type: selectedService,
      date: selectedDate,
      time: selectedTime,
      vehicle_id: selectedVehicle.id,
      notes,
    });
  };

  const serviceTypes = [
    { id: 'oil_change', name: 'Oil Change', duration: '30-45 min' },
    { id: 'tire_rotation', name: 'Tire Rotation', duration: '30 min' },
    { id: 'brake_service', name: 'Brake Service', duration: '1-2 hours' },
    { id: 'full_inspection', name: 'Full Inspection', duration: '45-60 min' },
    { id: 'alignment', name: 'Wheel Alignment', duration: '1 hour' },
  ];

  // Generate next 14 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    return dates;
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'vehicle', label: 'Vehicle', icon: Car },
      { key: 'location', label: 'Location', icon: MapPin },
      { key: 'service', label: 'Service', icon: Wrench },
      { key: 'datetime', label: 'Date & Time', icon: CalendarIcon },
      { key: 'confirm', label: 'Confirm', icon: CheckCircle },
    ];

    const currentIndex = steps.findIndex((s) => s.key === currentStep);

    return (
      <View className="flex-row justify-between mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <View key={step.key} className="flex-1 items-center">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  isCompleted || isCurrent ? 'bg-gold' : 'bg-surface'
                }`}
              >
                <Icon
                  size={20}
                  color={isCompleted || isCurrent ? '#ffffff' : '#707070'}
                />
              </View>
              <Text
                className={`mt-1 text-xs ${
                  isCompleted || isCurrent ? 'text-gold font-medium' : 'text-textMuted'
                }`}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderVehicleStep = () => (
    <View>
      <Text className="text-xl font-bold text-foreground mb-4">Select Your Vehicle</Text>
      {vehiclesLoading ? (
        <Card className="items-center py-8">
          <ActivityIndicator color="#cba86e" />
        </Card>
      ) : vehicles && vehicles.length > 0 ? (
        <View className="space-y-3">
          {vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              onPress={() => setSelectedVehicle(vehicle)}
              activeOpacity={0.7}
            >
              <Card
                className={`${
                  selectedVehicle?.id === vehicle.id ? 'border-2 border-gold bg-gold/10' : ''
                }`}
              >
                <View className="flex-row items-center">
                  <View className="bg-surface p-3 rounded-lg mr-3">
                    <Car size={24} color="#cba86e" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Text>
                    {vehicle.licensePlate && (
                      <Text className="text-sm text-textSecondary">{vehicle.licensePlate}</Text>
                    )}
                  </View>
                  {selectedVehicle?.id === vehicle.id && (
                    <CheckCircle size={24} color="#cba86e" />
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Card className="items-center py-12">
          <Text className="text-sm text-textSecondary">No vehicles found</Text>
        </Card>
      )}
    </View>
  );

  const renderLocationStep = () => (
    <View>
      <Text className="text-xl font-bold text-foreground mb-4">Choose Service Location</Text>
      {locationsLoading ? (
        <Card className="items-center py-8">
          <ActivityIndicator color="#cba86e" />
        </Card>
      ) : locations && locations.length > 0 ? (
        <View className="space-y-3">
          {locations.map((location) => (
            <TouchableOpacity
              key={location.id}
              onPress={() => setSelectedLocation(location)}
              activeOpacity={0.7}
            >
              <Card
                className={`${
                  selectedLocation?.id === location.id ? 'border-2 border-gold bg-gold/10' : ''
                }`}
              >
                <View className="flex-row items-start">
                  <View className="bg-surface p-3 rounded-lg mr-3">
                    <MapPin size={24} color="#cba86e" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      {location.name}
                    </Text>
                    <Text className="text-sm text-textSecondary">
                      {location.address}, {location.city}, {location.state}
                    </Text>
                  </View>
                  {selectedLocation?.id === location.id && (
                    <CheckCircle size={24} color="#cba86e" />
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Card className="items-center py-12">
          <Text className="text-sm text-textSecondary">No locations found</Text>
        </Card>
      )}
    </View>
  );

  const renderServiceStep = () => (
    <View>
      <Text className="text-xl font-bold text-foreground mb-4">Select Service Type</Text>
      <View className="space-y-3">
        {serviceTypes.map((service) => (
          <TouchableOpacity
            key={service.id}
            onPress={() => setSelectedService(service.id)}
            activeOpacity={0.7}
          >
            <Card
              className={`${
                selectedService === service.id ? 'border-2 border-gold bg-gold/10' : ''
              }`}
            >
              <View className="flex-row items-center">
                <View className="bg-surface p-3 rounded-lg mr-3">
                  <Wrench size={24} color="#cba86e" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">{service.name}</Text>
                  <Text className="text-sm text-textSecondary">{service.duration}</Text>
                </View>
                {selectedService === service.id && (
                  <CheckCircle size={24} color="#cba86e" />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDateTimeStep = () => (
    <View>
      <Text className="text-xl font-bold text-foreground mb-4">Select Date & Time</Text>

      {/* Date Selection */}
      <Text className="text-sm font-medium text-foreground mb-2">Choose Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        <View className="flex-row space-x-2">
          {getAvailableDates().map((date) => (
            <TouchableOpacity
              key={date.value}
              onPress={() => setSelectedDate(date.value)}
              activeOpacity={0.7}
            >
              <Card
                className={`min-w-[100px] ${
                  selectedDate === date.value ? 'border-2 border-gold bg-gold/10' : ''
                }`}
              >
                <Text
                  className={`text-sm text-center ${
                    selectedDate === date.value ? 'text-gold font-semibold' : 'text-foreground'
                  }`}
                >
                  {date.label}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Time Selection */}
      {selectedDate && (
        <>
          <Text className="text-sm font-medium text-foreground mb-2">Choose Time</Text>
          {slotsLoading ? (
            <Card className="items-center py-8">
              <ActivityIndicator color="#cba86e" />
            </Card>
          ) : timeSlots && timeSlots.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {timeSlots
                .filter((slot) => slot.available)
                .map((slot) => (
                  <TouchableOpacity
                    key={slot.time}
                    onPress={() => setSelectedTime(slot.time)}
                    activeOpacity={0.7}
                  >
                    <Card
                      className={`min-w-[80px] ${
                        selectedTime === slot.time ? 'border-2 border-gold bg-gold/10' : ''
                      }`}
                    >
                      <Text
                        className={`text-sm text-center ${
                          selectedTime === slot.time ? 'text-gold font-semibold' : 'text-foreground'
                        }`}
                      >
                        {slot.displayTime || slot.time}
                      </Text>
                    </Card>
                  </TouchableOpacity>
                ))}
            </View>
          ) : (
            <Card className="items-center py-8">
              <Text className="text-sm text-textSecondary">No available time slots</Text>
            </Card>
          )}
        </>
      )}
    </View>
  );

  const renderConfirmStep = () => (
    <View>
      <Text className="text-xl font-bold text-foreground mb-4">Confirm Your Booking</Text>

      <Card className="mb-3">
        <Text className="text-sm font-medium text-textSecondary mb-2">Vehicle</Text>
        <Text className="text-base text-foreground">
          {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}
        </Text>
      </Card>

      <Card className="mb-3">
        <Text className="text-sm font-medium text-textSecondary mb-2">Location</Text>
        <Text className="text-base text-foreground">{selectedLocation?.name}</Text>
        <Text className="text-sm text-textSecondary">
          {selectedLocation?.address}, {selectedLocation?.city}
        </Text>
      </Card>

      <Card className="mb-3">
        <Text className="text-sm font-medium text-textSecondary mb-2">Service</Text>
        <Text className="text-base text-foreground">
          {serviceTypes.find((s) => s.id === selectedService)?.name}
        </Text>
      </Card>

      <Card className="mb-3">
        <Text className="text-sm font-medium text-textSecondary mb-2">Date & Time</Text>
        <Text className="text-base text-foreground">
          {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
        <Text className="text-sm text-textSecondary">{selectedTime}</Text>
      </Card>

      <Card className="mb-3">
        <Text className="text-sm font-medium text-textSecondary mb-2">Notes (Optional)</Text>
        <TextInput
          className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
          placeholder="Add any special instructions"
          placeholderTextColor="#707070"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
        />
      </Card>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        <View className="px-4 pt-4">
          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          {currentStep === 'vehicle' && renderVehicleStep()}
          {currentStep === 'location' && renderLocationStep()}
          {currentStep === 'service' && renderServiceStep()}
          {currentStep === 'datetime' && renderDateTimeStep()}
          {currentStep === 'confirm' && renderConfirmStep()}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="flex-row space-x-3">
          <Button
            variant="outline"
            onPress={handleBack}
            className="flex-1"
            leftIcon={<ChevronLeft size={20} color="#cba86e" />}
          >
            Back
          </Button>

          {currentStep === 'confirm' ? (
            <Button
              variant="primary"
              onPress={handleConfirmBooking}
              className="flex-1"
              disabled={bookMutation.isPending}
              leftIcon={<CheckCircle size={20} color="#ffffff" />}
            >
              {bookMutation.isPending ? 'Booking...' : 'Confirm Booking'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onPress={handleNext}
              className="flex-1"
              rightIcon={<ChevronRight size={20} color="#ffffff" />}
            >
              Next
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};

export default BookAppointmentScreen;
