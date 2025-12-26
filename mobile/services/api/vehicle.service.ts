import { Vehicle, TelematicsSnapshot } from '@/types';
import { api } from './client';

export const vehicleService = {
  /**
   * Get all user vehicles
   */
  getVehicles: async () => {
    const response = await api.get<Vehicle[]>('/vehicles/');
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
   * Create new vehicle
   */
  createVehicle: async (data: Partial<Vehicle>) => {
    const response = await api.post<Vehicle>('/vehicles/', data);
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
