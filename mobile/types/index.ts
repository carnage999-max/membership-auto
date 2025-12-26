// User & Authentication Types
export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  membershipId: string;
  referralCode: string;
  rewardsBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  phone: string;
  password: string;
  name: string;
  membershipVerificationCode?: string;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  userId: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  licensePlate?: string;
  odometer: number;
  dongleId?: string;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleHealth {
  vehicleId: string;
  dtcCodes: string[];
  lastCheckDate: string;
  overallStatus: 'good' | 'warning' | 'critical';
  alerts: VehicleAlert[];
}

export interface VehicleAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  createdAt: string;
}

// OBD / Telematics Types
export interface TelematicsSnapshot {
  vehicleId: string;
  timestamp: string;
  odometer?: number;
  fuelUsed?: number;
  speedAvg?: number;
  fuelLevel?: number;
  coolantTemp?: number;
  dtcList: string[];
  tripDistance?: number;
  tripDuration?: number;
}

export interface OBDDevice {
  id: string;
  name: string;
  type: 'BLE' | 'WiFi' | 'Cloud';
  macAddress?: string;
  isConnected: boolean;
}

// Fuel Economy Types
export interface FuelLog {
  id: string;
  vehicleId: string;
  timestamp: string;
  odometer: number;
  gallons: number;
  pricePerGallon: number;
  totalCost: number;
  mpg?: number;
  location?: string;
  notes?: string;
  receiptImageUrl?: string;
  isManual: boolean;
  createdAt: string;
}

export interface FuelStats {
  vehicleId: string;
  avgMpg30Days: number;
  avgMpgAllTime: number;
  totalSpent30Days: number;
  totalSpentAllTime: number;
  costPerMile: number;
  trend: 'improving' | 'stable' | 'declining';
}

// Membership & Subscription Types
export interface Membership {
  id: string;
  userId: string;
  plan: 'basic' | 'premium' | 'elite';
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  renewalDate: string;
  autoRenew: boolean;
  benefits: string[];
}

// Service & Appointment Types
export interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  hours: {
    [key: string]: { open: string; close: string } | null;
  };
  distance?: number;
}

export interface Appointment {
  id: string;
  userId: string;
  vehicleId: string;
  locationId: string;
  startTime: string;
  endTime?: string;
  estimatedDuration: number;
  services: ServiceItem[];
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number;
  includedInMembership: boolean;
  price?: number;
}

export interface RecommendedService {
  id: string;
  vehicleId: string;
  service: ServiceItem;
  dueByMileage?: number;
  dueByDate?: string;
  priority: 'low' | 'medium' | 'high';
  reason: string;
}

// Offers & Promotions Types
export interface Offer {
  id: string;
  title: string;
  description: string;
  terms: string;
  imageUrl?: string;
  expiryDate: string;
  eligiblePlans: string[];
  eligibleLocations?: string[];
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  code?: string;
  isActive: boolean;
}

// Referral Types
export interface Referral {
  id: string;
  referrerUserId: string;
  referredUserId?: string;
  referredEmail?: string;
  status: 'invited' | 'signed_up' | 'converted' | 'credited';
  rewardAmount?: number;
  createdAt: string;
  convertedAt?: string;
}

export interface ReferralStats {
  userId: string;
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  successfulReferrals: number;
  totalRewardsEarned: number;
  pendingRewards: number;
  referrals: Referral[];
}

// Chat Types
export interface ChatThread {
  id: string;
  userId: string;
  subject?: string;
  status: 'open' | 'closed';
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'system';
  message: string;
  attachments?: MessageAttachment[];
  timestamp: string;
  isRead: boolean;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'video';
  url: string;
  name: string;
  size: number;
}

// Parking Reminder Types
export interface ParkingSpot {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  address?: string;
  level?: string;
  spot?: string;
  notes?: string;
  imageUrls?: string[];
  timestamp: string;
  meterExpiryTime?: string;
}

// Notification Types
export interface PushNotification {
  id: string;
  userId: string;
  type: 'appointment' | 'service_due' | 'offer' | 'chat' | 'referral' | 'general';
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  deepLink?: string;
  createdAt: string;
}

// Appointment Time Slot Types
export interface TimeSlot {
  time: string;
  available: boolean;
  displayTime?: string;
}

// App Configuration Types
export interface AppConfig {
  social: {
    facebookUrl: string;
    instagramUrl: string;
    xUrl: string;
    linkedinUrl?: string;
  };
  support: {
    phone: string;
    email: string;
    hoursOfOperation: string;
  };
  features: {
    obdEnabled: boolean;
    chatEnabled: boolean;
    referralsEnabled: boolean;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}
