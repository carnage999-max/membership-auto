import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { vehicleService } from '@/services/api/vehicle.service';
import { useAuthStore } from '@/stores/auth.store';
import { useVehicleStore } from '@/stores/vehicle.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';
import InlineToast from '@/components/ui/inline-toast';
import {
  Car,
  CheckCircle2,
  Gauge,
  Plus,
  X,
  Camera,
  Upload,
  Trash2,
  Fuel,
  FileText,
  Tag,
  Edit,
} from 'lucide-react-native';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { Vehicle } from '@/types';

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

const VehiclesScreen = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { vehicles, activeVehicleId, setVehicles, setActiveVehicle } = useVehicleStore();

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<VehicleFormData>({
    vin: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    licensePlate: '',
    odometer: '',
    fuelType: 'gasoline',
  });

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

  const [formData, setFormData] = useState<VehicleFormData>({
    vin: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    licensePlate: '',
    odometer: '',
    fuelType: 'gasoline',
  });

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

  // Create vehicle mutation
  const createVehicleMutation = useMutation({
    mutationFn: vehicleService.createVehicle,
    onSuccess: () => {
      showToast('success', 'Vehicle added successfully!');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      showInlineToast('error', error?.message || 'Failed to add vehicle');
    },
  });

  // Delete vehicle mutation
  const deleteVehicleMutation = useMutation({
    mutationFn: vehicleService.deleteVehicle,
    onSuccess: () => {
      showToast('success', 'Vehicle deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      handleCloseDetailModal();
    },
    onError: (error: any) => {
      showInlineToast('error', error?.message || 'Failed to delete vehicle');
    },
  });

  // Update vehicle mutation
  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) =>
      vehicleService.updateVehicle(id, data),
    onSuccess: () => {
      showToast('success', 'Vehicle updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      handleCloseDetailModal();
    },
    onError: (error: any) => {
      showInlineToast('error', error?.message || 'Failed to update vehicle');
    },
  });

  const handleSetActive = (vehicleId: string) => {
    setActiveVehicle(vehicleId);
  };

  const handleVehiclePress = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedVehicle(null);
    setIsEditMode(false);
    setShowContextMenu(false);
  };

  const resetForm = () => {
    setFormData({
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

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleOpenModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const pickImage = async () => {
    // Request permission
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
    // Request camera permission
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

  const handleSubmit = () => {
    // Basic validation
    if (!formData.make.trim()) {
      showInlineToast('error', 'Please enter the vehicle make');
      return;
    }
    if (!formData.model.trim()) {
      showInlineToast('error', 'Please enter the vehicle model');
      return;
    }

    createVehicleMutation.mutate({
      vin: formData.vin.trim() || undefined,
      year: formData.year ? parseInt(formData.year, 10) : undefined,
      make: formData.make.trim(),
      model: formData.model.trim(),
      trim: formData.trim.trim() || undefined,
      licensePlate: formData.licensePlate.trim() || undefined,
      odometer: formData.odometer ? parseInt(formData.odometer, 10) : undefined,
      fuelType: formData.fuelType,
      imageUri: selectedImage || undefined,
    });
  };

  const updateField = (field: keyof VehicleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
            <TouchableOpacity
              onPress={handleOpenModal}
              className="flex-row items-center justify-center rounded-xl bg-gold px-4 py-3"
              activeOpacity={0.7}
            >
              <Plus size={16} color="#0d0d0d" />
              <Text className="ml-1 text-sm font-semibold text-background">Add</Text>
            </TouchableOpacity>
          </View>

          {vehicles.length === 0 && !isLoading && (
            <Card className="items-center py-12">
              <Car size={64} color="#707070" />
              <Text className="mt-4 text-lg font-semibold text-foreground">No Vehicles Yet</Text>
              <Text className="mt-2 text-center text-sm text-textSecondary">
                Add your first vehicle to start tracking maintenance
              </Text>
              <TouchableOpacity
                onPress={handleOpenModal}
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

          {vehicles.map((vehicle) => {
            const isActive = vehicle.id === activeVehicleId;

            return (
              <TouchableOpacity
                key={vehicle.id}
                onPress={() => handleVehiclePress(vehicle)}
                activeOpacity={0.7}
              >
                <Card
                  className={'mb-4 ' + (isActive ? 'border-2 border-gold' : '')}
                  variant="elevated"
                >
                  {isActive && (
                    <View className="mb-3 rounded-full bg-gold/20 self-start px-3 py-1">
                      <Text className="text-xs font-semibold text-gold">Active Vehicle</Text>
                    </View>
                  )}

                  {/* Vehicle Image Thumbnail */}
                  {vehicle.imageUrl && (
                    <View className="mb-3 rounded-xl overflow-hidden">
                      <Image
                        source={{ uri: vehicle.imageUrl }}
                        className="w-full h-32"
                        resizeMode="cover"
                      />
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
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleSetActive(vehicle.id);
                        }}
                        className="flex-1 mr-2"
                      >
                        <View className="rounded-lg bg-gold/10 py-2 px-4 items-center">
                          <Text className="text-sm font-semibold text-gold">Set as Active</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Vehicle Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
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
            <TouchableOpacity onPress={handleCloseModal} activeOpacity={0.7}>
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

            {/* Form Fields - Two Column Layout */}
            <View className="gap-4">
              {/* Row 1: VIN and Year */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-textSecondary mb-2">VIN (Optional)</Text>
                  <View className="bg-surface border border-border rounded-xl px-4 py-3">
                    <TextInput
                      placeholder="1HGBH41JXMN109186"
                      value={formData.vin}
                      onChangeText={(text) => updateField('vin', text.toUpperCase())}
                      autoCapitalize="characters"
                      maxLength={17}
                      className="text-foreground text-base"
                      placeholderTextColor="#707070"
                      style={{ color: '#ffffff' }}
                    />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-medium text-textSecondary mb-2">Year</Text>
                  <View className="bg-surface border border-border rounded-xl px-4 py-3">
                    <TextInput
                      placeholder="2020"
                      value={formData.year}
                      onChangeText={(text) => updateField('year', text)}
                      keyboardType="number-pad"
                      maxLength={4}
                      className="text-foreground text-base"
                      placeholderTextColor="#707070"
                      style={{ color: '#ffffff' }}
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
                      value={formData.make}
                      onChangeText={(text) => updateField('make', text)}
                      autoCapitalize="words"
                      className="text-foreground text-base"
                      placeholderTextColor="#707070"
                      style={{ color: '#ffffff' }}
                    />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-medium text-textSecondary mb-2">Model *</Text>
                  <View className="bg-surface border border-border rounded-xl px-4 py-3">
                    <TextInput
                      placeholder="Camry"
                      value={formData.model}
                      onChangeText={(text) => updateField('model', text)}
                      autoCapitalize="words"
                      className="text-foreground text-base"
                      placeholderTextColor="#707070"
                      style={{ color: '#ffffff' }}
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
                      value={formData.trim}
                      onChangeText={(text) => updateField('trim', text)}
                      autoCapitalize="characters"
                      className="text-foreground text-base"
                      placeholderTextColor="#707070"
                      style={{ color: '#ffffff' }}
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
                      value={formData.licensePlate}
                      onChangeText={(text) => updateField('licensePlate', text.toUpperCase())}
                      autoCapitalize="characters"
                      className="text-foreground text-base"
                      placeholderTextColor="#707070"
                      style={{ color: '#ffffff' }}
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
                    value={formData.odometer}
                    onChangeText={(text) => updateField('odometer', text)}
                    keyboardType="number-pad"
                    className="text-foreground text-base"
                    placeholderTextColor="#707070"
                    style={{ color: '#ffffff' }}
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
                        updateField('fuelType', fuel.value as VehicleFormData['fuelType'])
                      }
                      className={`px-4 py-3 rounded-xl border-2 ${
                        formData.fuelType === fuel.value
                          ? 'bg-gold/20 border-gold'
                          : 'bg-surface border-border'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          formData.fuelType === fuel.value ? 'text-gold' : 'text-foreground'
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
                onPress={handleCloseModal}
                className="flex-1 items-center justify-center rounded-xl border-2 border-gold bg-transparent py-4"
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-gold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
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

      {/* Vehicle Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseDetailModal}
      >
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
            <Text className="text-xl font-bold text-foreground">
              {isEditMode ? 'Edit Vehicle' : 'Vehicle Details'}
            </Text>
            <View className="flex-row gap-2">
              {!isEditMode && (
                <View className="relative">
                  <TouchableOpacity
                    onPress={() => setShowContextMenu(!showContextMenu)}
                    activeOpacity={0.7}
                    className="p-2 rounded-lg bg-primary/10"
                  >
                    <Edit size={24} color="#cba86e" strokeWidth={2.5} />
                  </TouchableOpacity>
                  
                  {/* iOS-style Context Menu Popup */}
                  {showContextMenu && !isEditMode && (
                    <>
                      {/* Dismiss overlay */}
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setShowContextMenu(false)}
                        className="absolute inset-0 z-40"
                        style={{ width: '300%', height: '300%', left: -100, top: -100 }}
                      />
                      
                      {/* Menu popup */}
                      <View className="absolute right-0 top-12 bg-surface rounded-lg shadow-lg overflow-hidden border border-border z-50" style={{ minWidth: 200 }}>
                        <TouchableOpacity
                          onPress={() => {
                            if (selectedVehicle) {
                              setEditFormData({
                                vin: selectedVehicle.vin || '',
                                year: selectedVehicle.year?.toString() || '',
                                make: selectedVehicle.make || '',
                                model: selectedVehicle.model || '',
                                trim: selectedVehicle.trim || '',
                                licensePlate: selectedVehicle.licensePlate || '',
                                odometer: selectedVehicle.odometer?.toString() || '',
                                fuelType: (selectedVehicle.fuelType as any) || 'gasoline',
                              });
                              setIsEditMode(true);
                              setShowContextMenu(false);
                            }
                          }}
                          className="px-4 py-3 flex-row items-center gap-3 border-b border-border"
                          activeOpacity={0.7}
                        >
                          <Edit size={18} color="#cba86e" />
                          <Text className="text-base text-foreground font-medium">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setShowContextMenu(false);
                            if (selectedVehicle) {
                              showInlineToast('info', 'Deleting vehicle...');
                              deleteVehicleMutation.mutate(selectedVehicle.id);
                            }
                          }}
                          disabled={deleteVehicleMutation.isPending}
                          className="px-4 py-3 flex-row items-center gap-3"
                          activeOpacity={0.7}
                        >
                          <Trash2 size={18} color="#ef4444" />
                          <Text className="text-base text-red-500 font-medium">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              )}
              <TouchableOpacity onPress={handleCloseDetailModal} activeOpacity={0.7}>
                <X size={24} color="#707070" />
              </TouchableOpacity>
            </View>
          </View>

          {selectedVehicle && (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
              showsVerticalScrollIndicator={false}
            >
              {!isEditMode ? (
                <>
                  {/* Vehicle Image */}
                  {selectedVehicle.photoUrl ? (
                    <Image
                      source={{ uri: selectedVehicle.photoUrl }}
                      className="w-full h-56"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-56 bg-surface items-center justify-center">
                      <Car size={64} color="#707070" />
                      <Text className="mt-2 text-sm text-textMuted">No image available</Text>
                    </View>
                  )}

                  <View className="p-4">
                    {/* Vehicle Title */}
                    <View className="items-center mb-6">
                      <Text className="text-2xl font-bold text-foreground text-center">
                        {selectedVehicle.year} {selectedVehicle.make}
                      </Text>
                      <Text className="text-lg text-textSecondary mt-1">
                        {selectedVehicle.model} {selectedVehicle.trim && `• ${selectedVehicle.trim}`}
                      </Text>
                      {selectedVehicle.id === activeVehicleId && (
                        <View className="mt-3 rounded-full bg-gold/20 px-4 py-1">
                          <Text className="text-sm font-semibold text-gold">Active Vehicle</Text>
                        </View>
                      )}
                    </View>

                    {/* Details Card */}
                    <Card className="mb-4">
                      <Text className="text-sm font-semibold text-foreground mb-4">
                        Vehicle Information
                      </Text>
                      <View className="gap-4">
                        {/* Odometer */}
                        <View className="flex-row items-center">
                          <View className="w-10 h-10 rounded-full bg-gold/10 items-center justify-center">
                            <Gauge size={20} color="#cba86e" />
                          </View>
                          <View className="ml-3 flex-1">
                            <Text className="text-xs text-textMuted">Current Odometer</Text>
                            <Text className="text-base font-semibold text-foreground">
                              {selectedVehicle.odometer?.toLocaleString() || '0'} miles
                            </Text>
                          </View>
                        </View>

                        {/* Fuel Type */}
                        {selectedVehicle.fuelType && (
                          <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-full bg-gold/10 items-center justify-center">
                              <Fuel size={20} color="#cba86e" />
                            </View>
                            <View className="ml-3 flex-1">
                              <Text className="text-xs text-textMuted">Fuel Type</Text>
                              <Text className="text-base font-semibold text-foreground capitalize">
                                {selectedVehicle.fuelType}
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* VIN */}
                        {selectedVehicle.vin && (
                          <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-full bg-gold/10 items-center justify-center">
                              <FileText size={20} color="#cba86e" />
                            </View>
                            <View className="ml-3 flex-1">
                              <Text className="text-xs text-textMuted">VIN</Text>
                              <Text className="text-base font-semibold text-foreground font-mono">
                                {selectedVehicle.vin}
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* License Plate */}
                        {selectedVehicle.licensePlate && (
                          <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-full bg-gold/10 items-center justify-center">
                              <Tag size={20} color="#cba86e" />
                            </View>
                            <View className="ml-3 flex-1">
                              <Text className="text-xs text-textMuted">License Plate</Text>
                              <Text className="text-base font-semibold text-foreground">
                                {selectedVehicle.licensePlate}
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* Health Status */}
                        <View className="flex-row items-center">
                          <View className="w-10 h-10 rounded-full bg-success/10 items-center justify-center">
                            <CheckCircle2 size={20} color="#4caf50" />
                          </View>
                          <View className="ml-3 flex-1">
                            <Text className="text-xs text-textMuted">Health Status</Text>
                            <Text className="text-base font-semibold text-success">Good</Text>
                          </View>
                        </View>
                      </View>
                    </Card>
                  </View>
                </>
              ) : (
                /* Edit Mode Form */
                <View className="p-4">
                  <View className="gap-4">
                    {/* Make */}
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-2">Make *</Text>
                      <TextInput
                        className="bg-surface rounded-lg px-4 py-3 text-foreground border border-border"
                        placeholder="Enter vehicle make"
                        placeholderTextColor="#707070"
                        value={editFormData.make}
                        onChangeText={(value) =>
                          setEditFormData((prev) => ({ ...prev, make: value }))
                        }
                      />
                    </View>

                    {/* Model */}
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-2">Model *</Text>
                      <TextInput
                        className="bg-surface rounded-lg px-4 py-3 text-foreground border border-border"
                        placeholder="Enter vehicle model"
                        placeholderTextColor="#707070"
                        value={editFormData.model}
                        onChangeText={(value) =>
                          setEditFormData((prev) => ({ ...prev, model: value }))
                        }
                      />
                    </View>

                    {/* Year */}
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-2">Year</Text>
                      <TextInput
                        className="bg-surface rounded-lg px-4 py-3 text-foreground border border-border"
                        placeholder="Enter vehicle year"
                        placeholderTextColor="#707070"
                        keyboardType="numeric"
                        value={editFormData.year}
                        onChangeText={(value) =>
                          setEditFormData((prev) => ({ ...prev, year: value }))
                        }
                      />
                    </View>

                    {/* Trim */}
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-2">Trim</Text>
                      <TextInput
                        className="bg-surface rounded-lg px-4 py-3 text-foreground border border-border"
                        placeholder="Enter vehicle trim"
                        placeholderTextColor="#707070"
                        value={editFormData.trim}
                        onChangeText={(value) =>
                          setEditFormData((prev) => ({ ...prev, trim: value }))
                        }
                      />
                    </View>

                    {/* License Plate */}
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-2">License Plate</Text>
                      <TextInput
                        className="bg-surface rounded-lg px-4 py-3 text-foreground border border-border"
                        placeholder="Enter license plate"
                        placeholderTextColor="#707070"
                        value={editFormData.licensePlate}
                        onChangeText={(value) =>
                          setEditFormData((prev) => ({ ...prev, licensePlate: value }))
                        }
                      />
                    </View>

                    {/* Odometer */}
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-2">Odometer (miles)</Text>
                      <TextInput
                        className="bg-surface rounded-lg px-4 py-3 text-foreground border border-border"
                        placeholder="Enter current odometer reading"
                        placeholderTextColor="#707070"
                        keyboardType="numeric"
                        value={editFormData.odometer}
                        onChangeText={(value) =>
                          setEditFormData((prev) => ({ ...prev, odometer: value }))
                        }
                      />
                    </View>

                    {/* VIN */}
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-2">VIN</Text>
                      <TextInput
                        className="bg-surface rounded-lg px-4 py-3 text-foreground border border-border"
                        placeholder="Enter VIN (optional)"
                        placeholderTextColor="#707070"
                        value={editFormData.vin}
                        onChangeText={(value) =>
                          setEditFormData((prev) => ({ ...prev, vin: value }))
                        }
                      />
                    </View>

                    {/* Fuel Type */}
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-2">Fuel Type</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="gap-2"
                      >
                        {FUEL_TYPES.map((type) => (
                          <TouchableOpacity
                            key={type.value}
                            onPress={() =>
                              setEditFormData((prev) => ({
                                ...prev,
                                fuelType: type.value as any,
                              }))
                            }
                            className={`px-4 py-2 rounded-lg border-2 ${
                              editFormData.fuelType === type.value
                                ? 'border-gold bg-gold/10'
                                : 'border-border bg-surface'
                            }`}
                            activeOpacity={0.7}
                          >
                            <Text
                              className={`text-sm font-medium ${
                                editFormData.fuelType === type.value
                                  ? 'text-gold'
                                  : 'text-textSecondary'
                              }`}
                            >
                              {type.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {/* Bottom Actions */}
          <View
            className="px-4 py-4 border-t border-border bg-background"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            {!isEditMode ? (
              <View className="flex-row gap-3">
                {selectedVehicle && selectedVehicle.id !== activeVehicleId && (
                  <TouchableOpacity
                    onPress={() => {
                      handleSetActive(selectedVehicle.id);
                      handleCloseDetailModal();
                    }}
                    className="flex-1 items-center justify-center rounded-xl border-2 border-gold bg-transparent py-4"
                    activeOpacity={0.7}
                  >
                    <Text className="text-base font-semibold text-gold">Set as Active</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleCloseDetailModal}
                  className="flex-1 items-center justify-center rounded-xl bg-gold py-4"
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-semibold text-background">Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setIsEditMode(false);
                    setShowContextMenu(false);
                  }}
                  className="flex-1 items-center justify-center rounded-xl border-2 border-border bg-transparent py-4"
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-semibold text-foreground">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (selectedVehicle && editFormData.make.trim() && editFormData.model.trim()) {
                      updateVehicleMutation.mutate({
                        id: selectedVehicle.id,
                        data: {
                          make: editFormData.make,
                          model: editFormData.model,
                          year: editFormData.year ? parseInt(editFormData.year, 10) : undefined,
                          trim: editFormData.trim || undefined,
                          licensePlate: editFormData.licensePlate || undefined,
                          odometer: editFormData.odometer
                            ? parseInt(editFormData.odometer, 10)
                            : undefined,
                          vin: editFormData.vin || undefined,
                          fuelType: editFormData.fuelType,
                        },
                      });
                    } else {
                      showInlineToast('error', 'Make and Model are required');
                    }
                  }}
                  disabled={updateVehicleMutation.isPending}
                  className="flex-1 items-center justify-center rounded-xl bg-gold py-4"
                  activeOpacity={0.7}
                >
                  {updateVehicleMutation.isPending ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text className="text-base font-semibold text-background">Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VehiclesScreen;
