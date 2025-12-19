import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';

export interface Offer {
  id: string;
  title: string;
  description: string;
  terms?: string;
  expiry: string;
  eligibleMemberships?: string[];
  createdAt: string;
}

const offerService = {
  /**
   * Get all offers for the authenticated user
   * @param vehicleId - Optional vehicle ID to filter offers
   * @param lat - Optional latitude for location-based offers
   * @param lng - Optional longitude for location-based offers
   */
  async getOffers(
    vehicleId?: string,
    lat?: number,
    lng?: number
  ): Promise<Offer[]> {
    const params: any = {};
    
    if (vehicleId) params.vehicleId = vehicleId;
    if (lat) params.lat = lat;
    if (lng) params.lng = lng;

    const response = await apiClient.get<Offer[]>(
      API_ENDPOINTS.OFFERS.LIST,
      { params }
    );
    return response.data;
  },
};

export default offerService;
