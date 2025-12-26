import { api } from './client';

export interface ParkingSpot {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
  photo_url?: string;
  parked_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaveParkingSpotData {
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
  photo_url?: string;
}

export const parkingService = {
  /**
   * Get all saved parking spots
   */
  getAll: async () => {
    const response = await api.get<ParkingSpot[]>('/parking/');
    return response.data;
  },

  /**
   * Save a new parking spot
   */
  save: async (data: SaveParkingSpotData) => {
    const response = await api.post<ParkingSpot>('/parking/', data);
    return response.data;
  },

  /**
   * Get current active parking spot
   */
  getActive: async () => {
    const response = await api.get<ParkingSpot | null>('/parking/active/');
    return response.data;
  },

  /**
   * Clear active parking spot
   */
  clearActive: async () => {
    const response = await api.post<{ message: string }>('/parking/clear/');
    return response.data;
  },

  /**
   * Get parking spot details by ID
   */
  getById: async (id: string) => {
    const response = await api.get<ParkingSpot>(`/parking/${id}/`);
    return response.data;
  },

  /**
   * Delete parking spot
   */
  delete: async (id: string) => {
    const response = await api.delete(`/parking/${id}/`);
    return response.data;
  },
};
