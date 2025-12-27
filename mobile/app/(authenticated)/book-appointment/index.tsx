import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { vehicleService } from '@/services/api/vehicle.service';
import { appointmentService } from '@/services/api/appointment.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';
import InlineToast from '@/components/ui/inline-toast';
import {
  Car,
  MapPin,
  Wrench,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Camera,
  Upload,
  Trash2,
  X,
} from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import type { Vehicle, ServiceLocation, TimeSlot } from '@/types';

interface VehicleFormData {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  licensePlate: string;
  odometer: string;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
}

const FUEL_TYPES = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
];

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

  // Add Vehicle Modal State
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Inline toast state for modal
  const [inlineToast, setInlineToast] = useState<{
    visible: boolean;
    type: 'error' | 'success' | 'info';
    message: string;
  }>({ visible: false, type: 'info', message: '' });

  const showInlineToast = useCallback((type: 'error' | 'success' | 'info', message: string) => {
    setInlineToast({ visible: true, type, message });
  }, []);

  const hideInlineToast = useCallback(() => {
    setInlineToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const [vehicleFormData, setVehicleFormData] = useState<VehicleFormData>({
    vin: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    licensePlate: '',
    odometer: '',
    fuelType: 'gasoline',
  });

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

  // Create vehicle mutation
  const createVehicleMutation = useMutation({
    mutationFn: vehicleService.createVehicle,
    onSuccess: (newVehicle) => {
      showToast('success', 'Vehicle added successfully!');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setSelectedVehicle(newVehicle);
      handleCloseVehicleModal();
    },
    onError: (error: any) => {
      showInlineToast('error', error?.message || 'Failed to add vehicle');
    },
  });

  // Vehicle Modal Functions
  const resetVehicleForm = () => {
    setVehicleFormData({
      vin: '',
      year: '',
      make: '',
      model: '',
      trim: '',
      licensePlate: '',
      odometer: '',
      fuelType: 'gasoline',
    });
    setSelectedImage(null);
  };

  const handleCloseVehicleModal = () => {
    setShowAddVehicleModal(false);
    resetVehicleForm();
  };

  const handleOpenVehicleModal = () => {
    resetVehicleForm();
    setShowAddVehicleModal(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showInlineToast('error', 'Permission to access gallery is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showInlineToast('error', 'Permission to access camera is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleSubmitVehicle = () => {
    if (!vehicleFormData.make.trim()) {
      showInlineToast('error', 'Please enter the vehicle make');
      return;
    }
    if (!vehicleFormData.model.trim()) {
      showInlineToast('error', 'Please enter the vehicle model');
      return;
    }

    createVehicleMutation.mutate({
      vin: vehicleFormData.vin.trim() || undefined,
      year: vehicleFormData.year ? parseInt(vehicleFormData.year, 10) : undefined,
      make: vehicleFormData.make.trim(),
      model: vehicleFormData.model.trim(),
      trim: vehicleFormData.trim.trim() || undefined,
      licensePlate: vehicleFormData.licensePlate.trim() || undefined,
      odometer: vehicleFormData.odometer ? parseInt(vehicleFormData.odometer, 10) : undefined,
      fuelType: vehicleFormData.fuelType,
      imageUri: selectedImage || undefined,
    });
  };

  const updateVehicleField = (field: keyof VehicleFormData, value: string) => {
    setVehicleFormData((prev) => ({ ...prev, [field]: value }));
  };

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
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-foreground">Select Your Vehicle</Text>
        <TouchableOpacity
          onPress={handleOpenVehicleModal}
          className="flex-row items-center px-3 py-2 rounded-xl bg-gold"
          activeOpacity={0.7}
        >
          <Plus size={16} color="#0d0d0d" />
          <Text className="ml-1 text-sm font-semibold text-background">Add</Text>
        </TouchableOpacity>
      </View>
      {vehiclesLoading ? (
        <Card className="items-center py-8">
          <ActivityIndicator color="#cba86e" />
        </Card>
      ) : vehicles && vehicles.length > 0 ? (
        <View className="gap-3">
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
          <Car size={64} color="#707070" />
          <Text className="mt-4 text-lg font-semibold text-foreground">No Vehicles Yet</Text>
          <Text className="mt-2 text-center text-sm text-textSecondary">
            Add a vehicle to book an appointment
          </Text>
          <TouchableOpacity
            onPress={handleOpenVehicleModal}
            className="mt-6 flex-row items-center justify-center rounded-xl bg-gold px-6 py-4"
            activeOpacity={0.7}
          >
            <Plus size={20} color="#0d0d0d" />
            <Text className="ml-2 text-base font-semibold text-background">
              Add Your First Vehicle
            </Text>
          </TouchableOpacity>
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
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-1 flex-row items-center justify-center rounded-xl border-2 border-gold bg-transparent py-4"
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="#cba86e" />
            <Text className="ml-1 text-base font-semibold text-gold">Back</Text>
          </TouchableOpacity>

          {currentStep === 'confirm' ? (
            <TouchableOpacity
              onPress={handleConfirmBooking}
              disabled={bookMutation.isPending}
              className="flex-1 flex-row items-center justify-center rounded-xl bg-gold py-4"
              activeOpacity={0.7}
            >
              {bookMutation.isPending ? (
                <ActivityIndicator size="small" color="#0d0d0d" />
              ) : (
                <>
                  <CheckCircle size={20} color="#0d0d0d" />
                  <Text className="ml-2 text-base font-semibold text-background">Confirm</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              className="flex-1 flex-row items-center justify-center rounded-xl bg-gold py-4"
              activeOpacity={0.7}
            >
              <Text className="mr-1 text-base font-semibold text-background">Next</Text>
              <ChevronRight size={20} color="#0d0d0d" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Add Vehicle Modal */}
      <Modal
        visible={showAddVehicleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseVehicleModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-background"
        >
          {/* Inline Toast for Modal */}
          <InlineToast
            type={inlineToast.type}
            message={inlineToast.message}
            visible={inlineToast.visible}
            onHide={hideInlineToast}
          />

          {/* Modal Header */}
          <View
            className="flex-row items-center justify-between px-4 py-4 border-b border-border"
            style={{ paddingTop: insets.top + 16 }}
          >
            <Text className="text-xl font-bold text-foreground">Add New Vehicle</Text>
            <TouchableOpacity onPress={handleCloseVehicleModal} activeOpacity={0.7}>
              <X size={24} color="#707070" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Image Picker Section */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-foreground mb-3">
                Vehicle Photo (Optional)
              </Text>

              {selectedImage ? (
                <View className="relative rounded-xl overflow-hidden bg-surface">
                  <Image
                    source={{ uri: selectedImage }}
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={removeImage}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-error items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="border-2 border-dashed border-border rounded-xl p-6 items-center">
                  <View className="w-16 h-16 rounded-full bg-gold/10 items-center justify-center mb-4">
                    <Camera size={32} color="#cba86e" />
                  </View>
                  <Text className="text-sm text-foreground mb-1">
                    Take a photo or upload image
                  </Text>
                  <Text className="text-xs text-textMuted mb-4 text-center">
                    Scan VIN from windshield, registration, or upload vehicle photo
                  </Text>

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={takePhoto}
                      className="flex-row items-center px-4 py-3 rounded-xl bg-gold"
                      activeOpacity={0.7}
                    >
                      <Camera size={18} color="#0d0d0d" />
                      <Text className="ml-2 text-sm font-semibold text-background">Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={pickImage}
                      className="flex-row items-center px-4 py-3 rounded-xl border-2 border-gold"
                      activeOpacity={0.7}
                    >
                      <Upload size={18} color="#cba86e" />
                      <Text className="ml-2 text-sm font-semibold text-gold">Gallery</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Form Fields */}
            <View className="gap-4">
              {/* Row 1: VIN and Year */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-textSecondary mb-2">VIN (Optional)</Text>
                  <View className="bg-surface border border-border rounded-xl px-4 py-3">
                    <TextInput
                      placeholder="1HGBH41JXMN109186"
                      value={vehicleFormData.vin}
                      onChangeText={(text) => updateVehicleField('vin', text.toUpperCase())}
                      autoCapitalize="characters"
                      maxLength={17}
                      placeholderTextColor="#707070"
                      style={{ color: '#ffffff', fontSize: 16 }}
                    />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-medium text-textSecondary mb-2">Year</Text>
                  <View className="bg-surface border border-border rounded-xl px-4 py-3">
                    <TextInput
                      placeholder="2020"
                      value={vehicleFormData.year}
                      onChangeText={(text) => updateVehicleField('year', text)}
                      keyboardType="number-pad"
                      maxLength={4}
                      placeholderTextColor="#707070"
                      style={{ color: '#ffffff', fontSize: 16 }}
                    />
                  </View>
                </View>
              </View>

              {/* Row 2: Make and Model */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-textSecondary mb-2">Make *</Text>
                  <View className="bg-surface border border-border rounded-xl px-4 py-3">
                    <TextInput
                      placeholder="Toyota"
                      value={vehicleFormData.make}
                      onChangeText={(text) => updateVehicleField('make', text)}
                      autoCapitalize="words"
                      placeholderTextColor="#707070"
                      style={{ color: '#ffffff', fontSize: 16 }}
                    />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-medium text-textSecondary mb-2">Model *</Text>
                  <View className="bg-surface border border-border rounded-xl px-4 py-3">
                    <TextInput
                      placeholder="Camry"
                      value={vehicleFormData.model}
                      onChangeText={(text) => updateVehicleField('model', text)}
                      autoCapitalize="words"
                      placeholderTextColor="#707070"
                      style={{ color: '#ffffff', fontSize: 16 }}
                    />
                  </View>
                </View>
              </View>

              {/* Row 3: Trim and License Plate */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-textSecondary mb-2">Trim (Optional)</Text>
                  <View className="bg-surface border border-border rounded-xl px-4 py-3">
                    <TextInput
                      placeholder="SE"
                      value={vehicleFormData.trim}
                      onChangeText={(text) => updateVehicleField('trim', text)}
                      autoCapitalize="characters"
                      placeholderTextColor="#707070"
                      style={{ color: '#ffffff', fontSize: 16 }}
                    />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-medium text-textSecondary mb-2">
                    License Plate (Optional)
                  </Text>
                  <View className="bg-surface border border-border rounded-xl px-4 py-3">
                    <TextInput
                      placeholder="ABC1234"
                      value={vehicleFormData.licensePlate}
                      onChangeText={(text) => updateVehicleField('licensePlate', text.toUpperCase())}
                      autoCapitalize="characters"
                      placeholderTextColor="#707070"
                      style={{ color: '#ffffff', fontSize: 16 }}
                    />
                  </View>
                </View>
              </View>

              {/* Row 4: Odometer */}
              <View>
                <Text className="text-sm font-medium text-textSecondary mb-2">
                  Current Odometer (Optional)
                </Text>
                <View className="bg-surface border border-border rounded-xl px-4 py-3">
                  <TextInput
                    placeholder="50000"
                    value={vehicleFormData.odometer}
                    onChangeText={(text) => updateVehicleField('odometer', text)}
                    keyboardType="number-pad"
                    placeholderTextColor="#707070"
                    style={{ color: '#ffffff', fontSize: 16 }}
                  />
                </View>
              </View>

              {/* Fuel Type Selection */}
              <View>
                <Text className="text-sm font-medium text-textSecondary mb-3">Fuel Type</Text>
                <View className="flex-row flex-wrap gap-2">
                  {FUEL_TYPES.map((fuel) => (
                    <TouchableOpacity
                      key={fuel.value}
                      onPress={() =>
                        updateVehicleField('fuelType', fuel.value as VehicleFormData['fuelType'])
                      }
                      className={`px-4 py-3 rounded-xl border-2 ${
                        vehicleFormData.fuelType === fuel.value
                          ? 'bg-gold/20 border-gold'
                          : 'bg-surface border-border'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          vehicleFormData.fuelType === fuel.value ? 'text-gold' : 'text-foreground'
                        }`}
                      >
                        {fuel.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Buttons */}
          <View
            className="px-4 py-4 border-t border-border bg-background"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCloseVehicleModal}
                className="flex-1 items-center justify-center rounded-xl border-2 border-gold bg-transparent py-4"
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-gold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmitVehicle}
                disabled={createVehicleMutation.isPending}
                className="flex-1 flex-row items-center justify-center rounded-xl bg-gold py-4"
                activeOpacity={0.7}
              >
                {createVehicleMutation.isPending ? (
                  <ActivityIndicator size="small" color="#0d0d0d" />
                ) : (
                  <Text className="text-base font-semibold text-background">Add Vehicle</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default BookAppointmentScreen;
