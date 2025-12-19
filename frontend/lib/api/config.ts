/**
 * API Configuration
 * Update API_BASE_URL in your .env.local file once backend is hosted
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/api/auth/register/',
    LOGIN: '/api/auth/login/',
    REFRESH: '/api/auth/refresh/',
  },
  // Vehicle endpoints
  VEHICLES: {
    LIST: '/api/vehicles/',
    CREATE: '/api/vehicles/',
    DETAIL: (id: string) => `/api/vehicles/${id}/`,
    UPDATE: (id: string) => `/api/vehicles/${id}/`,
    DELETE: (id: string) => `/api/vehicles/${id}/`,
    LINK_DONGLE: (id: string) => `/api/vehicles/${id}/link-dongle/`,
    TELEMATICS: (id: string) => `/api/vehicles/${id}/telematics/`,
    FUEL_LOGS: (id: string) => `/api/vehicles/${id}/fuel-logs/`,
  },
  // Appointments endpoints
  APPOINTMENTS: {
    LIST: '/api/appointments/',
    CREATE: '/api/appointments/',
    DETAIL: (id: string) => `/api/appointments/${id}/`,
    UPDATE: (id: string) => `/api/appointments/${id}/`,
    DELETE: (id: string) => `/api/appointments/${id}/`,
    UPCOMING: '/api/appointments/upcoming/',
    AVAILABILITY: '/api/appointments/availability/',
    LOCATIONS: '/api/appointments/locations/',
  },
  // Offers endpoints
  OFFERS: {
    LIST: '/api/offers/',
  },
  // Referrals endpoints
  REFERRALS: {
    ME: '/api/referrals/me/',
    APPLY: '/api/referrals/apply/',
  },
  // Chat endpoints
  CHAT: {
    THREADS: '/api/chat/threads/',
    MESSAGES: (threadId: string) => `/api/chat/threads/${threadId}/messages/`,
  },
  // Files endpoints
  FILES: {
    PRESIGN: '/api/files/presign/',
    UPLOAD: '/api/files/upload/',
  },
} as const;
