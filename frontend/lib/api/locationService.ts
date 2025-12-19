import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { Location } from './appointmentService';

const locationService = {
  /**
   * Get all service locations
   */
  async getLocations(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>(API_ENDPOINTS.APPOINTMENTS.LOCATIONS);
    return response.data;
  },

  /**
   * Get a specific location by ID
   */
  async getLocation(id: string): Promise<Location> {
    const response = await apiClient.get<Location>(
      `${API_ENDPOINTS.APPOINTMENTS.LOCATIONS}${id}/`
    );
    return response.data;
  },

  /**
   * Calculate distance between two coordinates (in miles)
   * Uses Haversine formula
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal
  },

  /**
   * Get Google Maps directions URL
   */
  getDirectionsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  },

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },
};

export default locationService;
