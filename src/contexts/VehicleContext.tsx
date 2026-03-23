import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Vehicle } from '../types/vehicle';

interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  selectedVehicle: Vehicle | null;
  addVehicle: (vehicle: Vehicle) => Promise<void>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  selectVehicle: (id: string) => Promise<void>;
  isLoading: boolean;
}

import { apiClient } from '../lib/apiClient';
import { useAuth } from './AuthContext';

const API_URL = "/UserVehicles";

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load vehicles
  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await apiClient(API_URL);
        const data = await response.json();
        if (data.success) {
          const apiVehicles = data.data.map((v: any) => ({
            id: v.id,
            brand: v.brand,
            model: v.model,
            variant: v.variant,
            year: v.year,
            customName: v.customName,
            soc: v.soc,
            batteryCapacityKwh: v.batteryCapacityKwh,
            isActive: v.isActive,
            rangeWLTP: v.rangeWLTP,
            realRangeKm: v.realRangeKm,
            maxChargingPowerKw: v.maxChargingPowerKw
          }));
          setVehicles(apiVehicles);
          const active = apiVehicles.find((v: any) => v.isActive);
          if (active) setSelectedVehicleId(active.id);
          else if (apiVehicles.length > 0) setSelectedVehicleId(apiVehicles[0].id);
          else setSelectedVehicleId(null);
        }
      } else {
        // Fallback to local
        const saved = localStorage.getItem('iyontree_vehicles');
        const parsed = saved ? JSON.parse(saved) : [];
        setVehicles(parsed);
        setSelectedVehicleId(localStorage.getItem('iyontree_selected_vehicle_id'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const { currentUser } = useAuth();

  useEffect(() => {
    fetchVehicles();
  }, [currentUser]);

  const addVehicle = async (vehicle: Vehicle) => {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await apiClient(API_URL, {
        method: 'POST',
        body: {
          brand: vehicle.brand,
          model: vehicle.model,
          variant: vehicle.variant || "",
          year: vehicle.year || 0,
          customName: vehicle.customName,
          soc: vehicle.soc,
          batteryCapacityKwh: vehicle.batteryCapacityKwh || 0,
          isActive: vehicle.isActive || false
        }
      });
      if (response.ok) {
        await fetchVehicles();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.source ? `[${errorData.source}] ${errorData.error}` : (errorData.error || "React API Çağrısı Başarısız: Sunucu Hatası.");
        throw new Error(errorMessage);
      }
    } else {
      setVehicles(prev => {
        const next = [...prev, vehicle];
        localStorage.setItem('iyontree_vehicles', JSON.stringify(next));
        return next;
      });
      setSelectedVehicleId(vehicle.id);
      localStorage.setItem('iyontree_selected_vehicle_id', vehicle.id);
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    const token = localStorage.getItem('token');
    const target = vehicles.find(v => v.id === id);
    if (!target) return;
    
    // Optimistic UI update
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));

    if (token) {
      const response = await apiClient(`${API_URL}/${id}`, {
        method: 'PUT',
        body: {
          id: id,
          brand: target.brand,
          model: target.model,
          variant: updates.variant ?? target.variant ?? "",
          year: updates.year ?? target.year ?? 0,
          customName: updates.customName ?? target.customName,
          soc: updates.soc ?? target.soc,
          batteryCapacityKwh: target.batteryCapacityKwh || 0,
          isActive: updates.hasOwnProperty('isActive') ? updates.isActive : (target.id === selectedVehicleId)
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.source ? `[${errorData.source}] ${errorData.error}` : (errorData.error || "React API Çağrısı Başarısız: Güncelleme.");
        throw new Error(errorMessage);
      }
    } else {
      setVehicles(prev => {
        const next = prev.map(v => v.id === id ? { ...v, ...updates } : v);
        localStorage.setItem('iyontree_vehicles', JSON.stringify(next));
        return next;
      });
    }
  };

  const removeVehicle = async (id: string) => {
    const token = localStorage.getItem('token');
    
    // Optimistic update
    setVehicles(prev => prev.filter(v => v.id !== id));

    if (token) {
      await apiClient(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      await fetchVehicles();
    } else {
      setVehicles(prev => {
        const next = prev.filter(v => v.id !== id);
        localStorage.setItem('iyontree_vehicles', JSON.stringify(next));
        if (selectedVehicleId === id) {
             const newId = next.length > 0 ? next[0].id : null;
             setSelectedVehicleId(newId);
             if (newId) localStorage.setItem('iyontree_selected_vehicle_id', newId);
             else localStorage.removeItem('iyontree_selected_vehicle_id');
        }
        return next;
      });
    }
  };

  const selectVehicle = async (id: string) => {
    setSelectedVehicleId(id);
    const token = localStorage.getItem('token');
    if (token) {
      await updateVehicle(id, { isActive: true } as any);
      await fetchVehicles();
    } else {
      localStorage.setItem('iyontree_selected_vehicle_id', id);
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || null;

  return (
    <VehicleContext.Provider value={{
      vehicles,
      selectedVehicleId,
      selectedVehicle,
      addVehicle,
      updateVehicle,
      removeVehicle,
      selectVehicle,
      isLoading
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
