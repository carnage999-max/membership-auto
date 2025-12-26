import { api } from './client';
import type { RecommendedService } from '@/types';

export const serviceService = {
  /**
   * Get recommended service schedule for a vehicle
   */
  getSchedules: async (vehicleId?: string) => {
    const response = await api.get<RecommendedService[]>('/services/schedules/', {
      params: vehicleId ? { vehicle_id: vehicleId } : undefined,
    });
    return response.data;
  },

  /**
   * Get service schedule by ID
   */
  getScheduleById: async (scheduleId: string) => {
    const response = await api.get<RecommendedService>(`/services/schedules/${scheduleId}/`);
    return response.data;
  },
};
