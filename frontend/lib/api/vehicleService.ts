import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';

export interface Vehicle {
  id: string;
  vin?: string;
  make?: string;
  model?: string;
  trim?: string;
  year?: number;
  licensePlate?: string;
  odometer?: number;
  dongleId?: string;
  dongleConnectionType?: 'BLE' | 'WIFI' | 'CLOUD';
  fuelType?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface TelematicsSnapshot {
  id: string;
  vehicleId: string;
  timestamp: string;
  odometer?: number;
  fuelUsed?: number;
  speedAvg?: number;
  dtc: string[];
  raw: Record<string, any>;
  createdAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  timestamp: string;
  odometer?: number;
  gallons?: number;
  price?: number;
  mpg?: number;
  createdAt: string;
}

export interface CreateVehicleData {
  vin?: string;
  make?: string;
  model?: string;
  trim?: string;
  year?: number;
  licensePlate?: string;
  odometer?: number;
  fuelType?: string;
  photoUrl?: string;
}

export interface LinkDongleData {
  dongleId: string;
  connectionType: 'BLE' | 'WIFI' | 'CLOUD';
}

export interface TelemetryBatchData {
  snapshots: {
    timestamp: string;
    odometer?: number;
    fuelUsed?: number;
    speedAvg?: number;
    dtc?: string[];
    raw?: Record<string, any>;
  }[];
}

const vehicleService = {
  /**
   * Get all vehicles for the authenticated user
   */
  async getVehicles(): Promise<Vehicle[]> {
    const response = await apiClient.get<Vehicle[]>(API_ENDPOINTS.VEHICLES.LIST);
    return response.data;
  },

  /**
   * Get a specific vehicle by ID
   */
  async getVehicle(id: string): Promise<Vehicle> {
    const response = await apiClient.get<Vehicle>(API_ENDPOINTS.VEHICLES.DETAIL(id));
    return response.data;
  },

  /**
   * Create a new vehicle
   */
  async createVehicle(data: CreateVehicleData): Promise<Vehicle> {
    console.log('Sending vehicle data to API:', data);
    const response = await apiClient.post<Vehicle>(API_ENDPOINTS.VEHICLES.CREATE, data);
    console.log('Vehicle created, response:', response.data);
    return response.data;
  },

  /**
   * Update an existing vehicle
   */
  async updateVehicle(id: string, data: Partial<CreateVehicleData>): Promise<Vehicle> {
    const response = await apiClient.put<Vehicle>(API_ENDPOINTS.VEHICLES.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete a vehicle
   */
  async deleteVehicle(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.VEHICLES.DELETE(id));
  },

  /**
   * Link a dongle device to a vehicle
   */
  async linkDongle(vehicleId: string, data: LinkDongleData): Promise<Vehicle> {
    const response = await apiClient.post<Vehicle>(
      API_ENDPOINTS.VEHICLES.LINK_DONGLE(vehicleId),
      data
    );
    return response.data;
  },

  /**
   * Get telematics data for a vehicle
   */
  async getTelematics(vehicleId: string): Promise<TelematicsSnapshot[]> {
    const response = await apiClient.get<TelematicsSnapshot[]>(
      API_ENDPOINTS.VEHICLES.TELEMATICS(vehicleId)
    );
    return response.data;
  },

  /**
   * Submit telemetry batch data
   */
  async submitTelemetry(vehicleId: string, data: TelemetryBatchData): Promise<void> {
    await apiClient.post(API_ENDPOINTS.VEHICLES.TELEMATICS(vehicleId), data);
  },

  /**
   * Get fuel logs for a vehicle
   */
  async getFuelLogs(vehicleId: string): Promise<FuelLog[]> {
    const response = await apiClient.get<FuelLog[]>(
      API_ENDPOINTS.VEHICLES.FUEL_LOGS(vehicleId)
    );
    return response.data;
  },

  /**
   * Add a fuel log entry
   */
  async addFuelLog(
    vehicleId: string,
    data: Omit<FuelLog, 'id' | 'vehicleId' | 'createdAt'>
  ): Promise<FuelLog> {
    const response = await apiClient.post<FuelLog>(
      API_ENDPOINTS.VEHICLES.FUEL_LOGS(vehicleId),
      data
    );
    return response.data;
  },
};

export default vehicleService;
