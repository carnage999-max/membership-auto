import { api } from './client';
import type { FuelLog, FuelStats } from '@/types';

export interface AddFuelLogData {
  vehicle_id: string;
  odometer: number;
  gallons: number;
  price_per_gallon: number;
  total_cost: number;
  location?: string;
  notes?: string;
  receipt_image?: string;
}

export const fuelService = {
  /**
   * Get all fuel logs for a vehicle
   */
  getFuelLogs: async (vehicleId: string) => {
    const response = await api.get<FuelLog[]>('/vehicles/fuel-logs/', {
      params: { vehicle_id: vehicleId },
      suppressErrorToast: true,
    });
    return response.data;
  },

  /**
   * Get fuel statistics for a vehicle
   */
  getFuelStats: async (vehicleId: string) => {
    const response = await api.get<FuelStats>(`/vehicles/${vehicleId}/fuel-stats/`, {
      suppressErrorToast: true,
    });
    return response.data;
  },

  /**
   * Add a new fuel log entry
   */
  addFuelLog: async (data: AddFuelLogData) => {
    // Backend expects 'vehicle' instead of 'vehicle_id'
    const payload = {
      vehicle: data.vehicle_id,
      odometer: data.odometer,
      gallons: data.gallons,
      price_per_gallon: data.price_per_gallon,
      cost: data.total_cost,
      location: data.location,
      notes: data.notes,
    };

    const response = await api.post<FuelLog>('/vehicles/fuel-logs/', payload);
    return response.data;
  },

  /**
   * Update a fuel log entry
   */
  updateFuelLog: async (id: string, data: Partial<AddFuelLogData>) => {
    const response = await api.put<FuelLog>(`/vehicles/fuel-logs/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a fuel log entry
   */
  deleteFuelLog: async (id: string) => {
    await api.delete(`/vehicles/fuel-logs/${id}/`);
  },
};
