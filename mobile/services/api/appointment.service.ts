import { api } from './client';
import type { Appointment, ServiceLocation, TimeSlot } from '@/types';

export interface BookAppointmentData {
  location_id: string;
  service_type: string;
  date: string;
  time: string;
  vehicle_id?: string;
  notes?: string;
}

export interface AvailabilityParams {
  location_id: string;
  service_type: string;
  date: string;
}

export const appointmentService = {
  /**
   * Get available time slots for a location, service type, and date
   */
  getAvailability: async (params: AvailabilityParams) => {
    const response = await api.get<TimeSlot[]>('/appointments/availability/', {
      params,
    });
    return response.data;
  },

  /**
   * Book a new appointment
   */
  book: async (data: BookAppointmentData) => {
    const response = await api.post<Appointment>('/appointments/book/', data);
    return response.data;
  },

  /**
   * Get list of upcoming appointments
   */
  getUpcoming: async () => {
    const response = await api.get<Appointment[]>('/appointments/upcoming/');
    return response.data;
  },

  /**
   * Get appointment details by ID
   */
  getById: async (appointmentId: string) => {
    const response = await api.get<Appointment>(`/appointments/${appointmentId}/`);
    return response.data;
  },

  /**
   * Get all service locations
   */
  getLocations: async () => {
    const response = await api.get<ServiceLocation[]>('/appointments/locations/');
    return response.data;
  },

  /**
   * Get location details by ID
   */
  getLocationById: async (locationId: string) => {
    const response = await api.get<ServiceLocation>(`/appointments/locations/${locationId}/`);
    return response.data;
  },

  /**
   * Cancel appointment
   */
  cancel: async (appointmentId: string) => {
    const response = await api.delete(`/appointments/${appointmentId}/`);
    return response.data;
  },
};
