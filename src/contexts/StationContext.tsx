import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Basic Station Interface as returned by our API
export interface StationData {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  isGoogle?: boolean;
  connections?: Array<{
    currentType?: string;
    connectionType?: string;
    powerKw?: number;
    price?: number; // mock field
    status?: string; // mock field
  }>;
  formattedAddress?: string;
}

interface StationContextType {
  selectedStation: StationData | null;
  setSelectedStation: (station: StationData | null) => void;
}

const StationContext = createContext<StationContextType | undefined>(undefined);

export function StationProvider({ children }: { children: ReactNode }) {
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);

  return (
    <StationContext.Provider value={{ selectedStation, setSelectedStation }}>
      {children}
    </StationContext.Provider>
  );
}

export function useStation() {
  const context = useContext(StationContext);
  if (context === undefined) {
    throw new Error('useStation must be used within a StationProvider');
  }
  return context;
}
