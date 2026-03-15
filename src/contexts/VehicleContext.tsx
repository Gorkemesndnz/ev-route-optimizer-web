import { createContext, useContext, useState, type ReactNode } from 'react';

interface VehicleContextType {
  vehicles: any[];
  setVehicles: React.Dispatch<React.SetStateAction<any[]>>;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  selectedVehicle: any | null;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

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
