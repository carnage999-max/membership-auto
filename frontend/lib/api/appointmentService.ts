import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';

export interface Location {
  id: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  hours?: Record<string, string>;
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  vehicleId?: string;
  locationId?: string;
  location?: Location;
  startTime: string;
  endTime?: string;
  services: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface CreateAppointmentData {
  vehicleId?: string;
  locationId: string;
  startTime: string;
  endTime?: string;
  services?: string[];
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
}

const appointmentService = {
  /**
   * Get all appointments for the authenticated user
   */
  async getAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(API_ENDPOINTS.APPOINTMENTS.LIST);
    return response.data;
  },

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(API_ENDPOINTS.APPOINTMENTS.UPCOMING);
    return response.data;
  },

  /**
   * Get a specific appointment by ID
   */
  async getAppointment(id: string): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(API_ENDPOINTS.APPOINTMENTS.DETAIL(id));
    return response.data;
  },

  /**
   * Create a new appointment (book)
   */
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(
      '/api/appointments/book/',
      data
    );
    return response.data;
  },

  /**
   * Update an existing appointment
   */
  async updateAppointment(
    id: string,
    data: Partial<CreateAppointmentData>
  ): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(
      API_ENDPOINTS.APPOINTMENTS.UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Cancel an appointment
   */
  async cancelAppointment(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.APPOINTMENTS.DELETE(id));
  },

  /**
   * Check availability for a location on a specific date
   */
  async checkAvailability(
    locationId: string,
    date: string,
    vehicleId?: string
  ): Promise<AvailabilitySlot[]> {
    const params: any = {
      locationId,
      date, // Format: YYYY-MM-DD
    };
    
    if (vehicleId) {
      params.vehicleId = vehicleId;
    }

    const response = await apiClient.get<AvailabilitySlot[]>(
      API_ENDPOINTS.APPOINTMENTS.AVAILABILITY,
      { params }
    );
    return response.data;
  },

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
    const response = await apiClient.get<Location>(`${API_ENDPOINTS.APPOINTMENTS.LOCATIONS}${id}/`);
    return response.data;
  },
};

export default appointmentService;
