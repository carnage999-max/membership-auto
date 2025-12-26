import { STORAGE_KEYS } from '@/constants';
import { Vehicle } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface VehicleState {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  isLoading: boolean;

  // Actions
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  setActiveVehicle: (id: string) => void;
  getActiveVehicle: () => Vehicle | undefined;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      activeVehicleId: null,
      isLoading: false,

      setVehicles: (vehicles: Vehicle[]) => {
        set({ vehicles });

        // If no active vehicle is set and we have vehicles, set the first one as active
        const { activeVehicleId } = get();
        if (!activeVehicleId && vehicles.length > 0) {
          set({ activeVehicleId: vehicles[0].id });
        }
      },

      addVehicle: (vehicle: Vehicle) => {
        set((state) => ({
          vehicles: [...state.vehicles, vehicle],
        }));

        // If this is the first vehicle, make it active
        const { activeVehicleId } = get();
        if (!activeVehicleId) {
          set({ activeVehicleId: vehicle.id });
        }
      },

      updateVehicle: (id: string, updates: Partial<Vehicle>) => {
        set((state) => ({
          vehicles: state.vehicles.map((vehicle) =>
            vehicle.id === id ? { ...vehicle, ...updates } : vehicle
          ),
        }));
      },

      removeVehicle: (id: string) => {
        set((state) => {
          const newVehicles = state.vehicles.filter((vehicle) => vehicle.id !== id);

          // If we're removing the active vehicle, switch to another one
          const newActiveVehicleId =
            state.activeVehicleId === id
              ? newVehicles[0]?.id || null
              : state.activeVehicleId;

          return {
            vehicles: newVehicles,
            activeVehicleId: newActiveVehicleId,
          };
        });
      },

      setActiveVehicle: (id: string) => {
        const vehicle = get().vehicles.find((v) => v.id === id);
        if (vehicle) {
          set({ activeVehicleId: id });
        }
      },

      getActiveVehicle: () => {
        const { vehicles, activeVehicleId } = get();
        return vehicles.find((v) => v.id === activeVehicleId);
      },
    }),
    {
      name: 'vehicle-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
