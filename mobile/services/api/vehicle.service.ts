import { Vehicle, TelematicsSnapshot } from '@/types';
import { api } from './client';
import { Platform } from 'react-native';

export interface CreateVehicleData {
  vin?: string;
  year?: number;
  make: string;
  model: string;
  trim?: string;
  licensePlate?: string;
  odometer?: number;
  fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  imageUri?: string;
}

export const vehicleService = {
  /**
   * Get all user vehicles
   */
  getVehicles: async () => {
    const response = await api.get<Vehicle[]>('/vehicles/', {
      suppressErrorToast: true,
    });
    return response.data;
  },

  /**
   * Get single vehicle by ID
   */
  getVehicle: async (id: string) => {
    const response = await api.get<Vehicle>(`/vehicles/${id}/`);
    return response.data;
  },

  /**
   * Create new vehicle with optional image upload
   */
  createVehicle: async (data: CreateVehicleData) => {
    // If there's an image, use FormData for multipart upload
    if (data.imageUri) {
      const formData = new FormData();

      // Append vehicle data fields
      if (data.vin) formData.append('vin', data.vin);
      if (data.year) formData.append('year', data.year.toString());
      formData.append('make', data.make);
      formData.append('model', data.model);
      if (data.trim) formData.append('trim', data.trim);
      if (data.licensePlate) formData.append('license_plate', data.licensePlate);
      if (data.odometer) formData.append('odometer', data.odometer.toString());
      if (data.fuelType) formData.append('fuel_type', data.fuelType);

      // Append the image file
      const uri = data.imageUri;
      const filename = uri.split('/').pop() || 'vehicle.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type,
      } as any);

      const response = await api.post<Vehicle>('/vehicles/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // No image, just send JSON
    const response = await api.post<Vehicle>('/vehicles/', {
      vin: data.vin,
      year: data.year,
      make: data.make,
      model: data.model,
      trim: data.trim,
      license_plate: data.licensePlate,
      odometer: data.odometer,
      fuel_type: data.fuelType,
    });
    return response.data;
  },

  /**
   * Update vehicle
   */
  updateVehicle: async (id: string, data: Partial<Vehicle>) => {
    const response = await api.put<Vehicle>(`/vehicles/${id}/`, data);
    return response.data;
  },

  /**
   * Delete vehicle
   */
  deleteVehicle: async (id: string) => {
    await api.delete(`/vehicles/${id}/`);
  },

  /**
   * Link OBD dongle to vehicle
   */
  linkDongle: async (vehicleId: string, dongleId: string) => {
    const response = await api.post<Vehicle>(`/vehicles/${vehicleId}/link-dongle/`, {
      dongle_id: dongleId,
    });
    return response.data;
  },

  /**
   * Upload telemetry data
   */
  uploadTelemetry: async (vehicleId: string, data: TelematicsSnapshot) => {
    const response = await api.post(`/telematics/${vehicleId}/`, data);
    return response.data;
  },
};
