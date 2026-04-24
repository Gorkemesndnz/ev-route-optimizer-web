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
import { ENDPOINTS } from '../lib/endpoints';
import { useAuth } from './AuthContext';

const DRIVER_SETTINGS_OVERLAY_KEY = 'iyontree_driver_settings_overlay';

// Sürücü ayarları (passengers, climateControl, drivingStyle, maxSpeed, refConsumption,
// extraWeight) backend UserVehicle tablosunda kolon olarak tutulmuyor. Bunları
// cihaz-başına bir overlay olarak localStorage'da tutup fetch'te birleştiriyoruz —
// böylece oturum açık kullanıcıda da sayfa yenileme sonrası sıfırlanmıyorlar.
type DriverOverlay = Partial<Pick<Vehicle,
  'passengers' | 'extraWeight' | 'climateControl' |
  'drivingStyle' | 'maxSpeed' | 'refConsumption' | 'preferredPlugTypes'
>>;

function loadDriverOverlay(): Record<string, DriverOverlay> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DRIVER_SETTINGS_OVERLAY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDriverOverlay(vehicleId: string, patch: DriverOverlay) {
  try {
    const all = loadDriverOverlay();
    all[vehicleId] = { ...all[vehicleId], ...patch };
    localStorage.setItem(DRIVER_SETTINGS_OVERLAY_KEY, JSON.stringify(all));
  } catch {
    // quota / private mode — sessizce yut
  }
}

function pickDriverFields(updates: Partial<Vehicle>): DriverOverlay {
  const out: DriverOverlay = {};
  if (updates.passengers !== undefined) out.passengers = updates.passengers;
  if (updates.extraWeight !== undefined) out.extraWeight = updates.extraWeight;
  if (updates.climateControl !== undefined) out.climateControl = updates.climateControl;
  if (updates.drivingStyle !== undefined) out.drivingStyle = updates.drivingStyle;
  if (updates.maxSpeed !== undefined) out.maxSpeed = updates.maxSpeed;
  if (updates.refConsumption !== undefined) out.refConsumption = updates.refConsumption;
  if (updates.preferredPlugTypes !== undefined) out.preferredPlugTypes = updates.preferredPlugTypes;
  return out;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load vehicles
  const fetchVehicles = async (user?: any) => {
    try {
      if (user) {
        const response = await apiClient(ENDPOINTS.USER_VEHICLES);
        const data = await response.json();
        if (data.success) {
          const overlay = loadDriverOverlay();
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
            maxChargingPowerKw: v.maxChargingPowerKw,
            ...(overlay[v.id] ?? {}),
          }));
          setVehicles(apiVehicles);
          const active = apiVehicles.find((v: any) => v.isActive);
          if (active) setSelectedVehicleId(active.id);
          else if (apiVehicles.length > 0) setSelectedVehicleId(apiVehicles[0].id);
          else setSelectedVehicleId(null);
        }
      } else {
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
    fetchVehicles(currentUser);
  }, [currentUser]);

  const addVehicle = async (vehicle: Vehicle) => {
    if (currentUser) {
      const response = await apiClient(ENDPOINTS.USER_VEHICLES, {
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
        await fetchVehicles(currentUser);
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
    const target = vehicles.find(v => v.id === id);
    if (!target) return;

    // Snapshot for rollback
    const previousVehicles = [...vehicles];

    // Optimistic UI update
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));

    // Sürücü ayarlarını overlay'e yaz (backend bu kolonları tutmuyor).
    const driverPatch = pickDriverFields(updates);
    if (Object.keys(driverPatch).length > 0) {
      saveDriverOverlay(id, driverPatch);
    }

    if (currentUser) {
      const response = await apiClient(`${ENDPOINTS.USER_VEHICLES}/${id}`, {
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
        setVehicles(previousVehicles); // Rollback optimistic update
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
    // Snapshot for rollback
    const previousVehicles = [...vehicles];

    // Optimistic update
    setVehicles(prev => prev.filter(v => v.id !== id));

    // Overlay'den de temizle — vehicle ID'leri silinince bayat kalmasın.
    try {
      const all = loadDriverOverlay();
      if (all[id]) {
        delete all[id];
        localStorage.setItem(DRIVER_SETTINGS_OVERLAY_KEY, JSON.stringify(all));
      }
    } catch {
      // ignore
    }

    if (currentUser) {
      try {
        await apiClient(`${ENDPOINTS.USER_VEHICLES}/${id}`, {
          method: 'DELETE'
        });
        await fetchVehicles(currentUser);
      } catch (e) {
        console.error('removeVehicle API error:', e);
        setVehicles(previousVehicles); // Rollback on failure
      }
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
    if (currentUser) {
      await updateVehicle(id, { isActive: true } as any);
      await fetchVehicles(currentUser);
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
