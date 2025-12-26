// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.membershipauto.com';
export const API_TIMEOUT = 30000;

// App Configuration
export const APP_NAME = 'Membership Auto';
export const APP_VERSION = '1.0.0';

// Deep Linking
export const DEEP_LINK_SCHEME = 'membershipauto';
export const REFERRAL_BASE_URL = 'https://membershipauto.com/r';

// Membership Plans
export const MEMBERSHIP_PLANS = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  ELITE: 'elite',
} as const;

export const MEMBERSHIP_PLAN_NAMES = {
  [MEMBERSHIP_PLANS.BASIC]: 'Basic',
  [MEMBERSHIP_PLANS.PREMIUM]: 'Premium',
  [MEMBERSHIP_PLANS.ELITE]: 'Elite',
};

// Fuel Types
export const FUEL_TYPES = {
  GASOLINE: 'gasoline',
  DIESEL: 'diesel',
  ELECTRIC: 'electric',
  HYBRID: 'hybrid',
} as const;

// Vehicle Makes (common ones - can be extended)
export const VEHICLE_MAKES = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep',
  'Kia', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Nissan',
  'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
];

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Service Priority
export const SERVICE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'appointment',
  SERVICE_DUE: 'service_due',
  OFFER: 'offer',
  CHAT: 'chat',
  REFERRAL: 'referral',
  GENERAL: 'general',
} as const;

// OBD Connection Types
export const OBD_CONNECTION_TYPES = {
  BLE: 'BLE',
  WIFI: 'WiFi',
  CLOUD: 'Cloud',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  ACTIVE_VEHICLE_ID: 'active_vehicle_id',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  PUSH_TOKEN: 'push_token',
  LANGUAGE: 'language',
} as const;

// Map Configuration
export const MAP_DEFAULTS = {
  INITIAL_REGION: {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  SEARCH_RADIUS_MILES: 50,
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  VIN_LENGTH: 17,
  ZIP_CODE_REGEX: /^\d{5}(-\d{4})?$/,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY h:mm A',
  DISPLAY_TIME: 'h:mm A',
  API_DATE: 'YYYY-MM-DD',
  API_DATETIME: 'YYYY-MM-DDTHH:mm:ss',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

// Cache Times (in milliseconds)
export const CACHE_TIME = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

// Query Keys for React Query
export const QUERY_KEYS = {
  USER: ['user'],
  VEHICLES: ['vehicles'],
  VEHICLE: (id: string) => ['vehicle', id],
  APPOINTMENTS: ['appointments'],
  APPOINTMENT: (id: string) => ['appointment', id],
  OFFERS: ['offers'],
  LOCATIONS: ['locations'],
  FUEL_LOGS: (vehicleId: string) => ['fuel-logs', vehicleId],
  FUEL_STATS: (vehicleId: string) => ['fuel-stats', vehicleId],
  REFERRALS: ['referrals'],
  CHAT_THREADS: ['chat-threads'],
  CHAT_MESSAGES: (threadId: string) => ['chat-messages', threadId],
  RECOMMENDED_SERVICES: (vehicleId: string) => ['recommended-services', vehicleId],
  VEHICLE_HEALTH: (vehicleId: string) => ['vehicle-health', vehicleId],
  CONFIG: ['config'],
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTHENTICATION_FAILED: 'Authentication failed. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  LOCATION_PERMISSION: 'Location permission is required for this feature.',
  CAMERA_PERMISSION: 'Camera permission is required for this feature.',
  NOTIFICATION_PERMISSION: 'Notification permission is required to receive updates.',
  BLUETOOTH_PERMISSION: 'Bluetooth permission is required to connect to your vehicle.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  APPOINTMENT_BOOKED: 'Appointment booked successfully!',
  APPOINTMENT_CANCELLED: 'Appointment cancelled.',
  VEHICLE_ADDED: 'Vehicle added successfully!',
  FUEL_LOG_ADDED: 'Fuel log added successfully!',
  PARKING_SAVED: 'Parking location saved!',
  REFERRAL_SENT: 'Referral sent successfully!',
};

// Social Media
export const SOCIAL_ICONS = [
  { name: 'facebook', key: 'facebookUrl' },
  { name: 'instagram', key: 'instagramUrl' },
  { name: 'twitter', key: 'xUrl' },
  { name: 'linkedin', key: 'linkedinUrl' },
] as const;

// Quick Action Icons (Dashboard)
export const QUICK_ACTIONS = [
  { key: 'offers', title: 'Special Offers', icon: 'tag', route: '/(authenticated)/offers' },
  { key: 'mileage', title: 'Mileage Tracker', icon: 'gauge', route: '/(authenticated)/mileage' },
  { key: 'parking', title: 'Parking Reminder', icon: 'car', route: '/(authenticated)/parking' },
  { key: 'help', title: 'Help', icon: 'help-circle', route: '/(authenticated)/help' },
  { key: 'store', title: 'Store Locator', icon: 'map-pin', route: '/(authenticated)/store-locator' },
  { key: 'contact', title: 'Contact Us', icon: 'phone', route: '/(authenticated)/help/contact' },
  { key: 'referral', title: 'Refer a Friend', icon: 'users', route: '/(authenticated)/referrals' },
] as const;

// Referral Rewards
export const REFERRAL_REWARDS = {
  REFERRER_FREE_MONTHS: 1,
  REFERRED_DISCOUNT_PERCENT: 50,
} as const;

// OBD PIDs (Parameter IDs)
export const OBD_PIDS = {
  VEHICLE_SPEED: '010D',
  ENGINE_RPM: '010C',
  COOLANT_TEMP: '0105',
  FUEL_LEVEL: '012F',
  FUEL_RATE: '015E',
  ODOMETER: '01A6',
  DTCs: '03', // Diagnostic Trouble Codes
} as const;
