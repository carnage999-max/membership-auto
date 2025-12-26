import { Offer } from '@/types';
import { api } from './client';

export const offerService = {
  /**
   * Get all offers
   */
  getOffers: async (params?: {
    userId?: string;
    vehicleId?: string;
    location?: string;
  }) => {
    const response = await api.get<Offer[]>('/offers/', { params });
    return response.data;
  },
};
