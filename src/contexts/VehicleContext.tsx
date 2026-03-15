import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Vehicle } from '../types/vehicle';

interface VehicleContextType {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  selectedVehicle: Vehicle | null;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  // Try to load initial state from localStorage
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem('iyontree_vehicles');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load vehicles from localStorage', error);
      return [];
    }
  });

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(() => {
    return localStorage.getItem('iyontree_selected_vehicle_id');
  });

  // Save vehicles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('iyontree_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  // Save selectedVehicleId to localStorage whenever it changes
  useEffect(() => {
    if (selectedVehicleId) {
      localStorage.setItem('iyontree_selected_vehicle_id', selectedVehicleId);
    } else {
      localStorage.removeItem('iyontree_selected_vehicle_id');
    }
  }, [selectedVehicleId]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || null;

  return (
    <VehicleContext.Provider value={{
      vehicles, setVehicles,
      selectedVehicleId, setSelectedVehicleId,
      selectedVehicle
    }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
}
