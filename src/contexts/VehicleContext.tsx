import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Vehicle } from '../types/vehicle';
import { vehicleApi } from '../api/vehicleApi';
import { ApiError } from '../lib/apiClient';
import { useAuth } from './AuthContext';

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

const DRIVER_SETTINGS_OVERLAY_KEY = 'iyontree_driver_settings_overlay';

// Sürücü ayarları backend'de tutulmuyor — localStorage overlay ile birleştiriliyor.
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
    // quota / private mode
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

  const { currentUser } = useAuth();

  const fetchVehicles = async (user?: typeof currentUser) => {
    try {
      if (user) {
        const apiVehicles = await vehicleApi.list();
        const overlay = loadDriverOverlay();
        const merged: Vehicle[] = apiVehicles.map(v => ({
          ...v,
          ...(overlay[v.id] ?? {}),
        }));
        setVehicles(merged);
        const active = merged.find(v => v.isActive);
        if (active) setSelectedVehicleId(active.id);
        else if (merged.length > 0) setSelectedVehicleId(merged[0].id);
        else setSelectedVehicleId(null);
      } else {
        const saved = localStorage.getItem('iyontree_vehicles');
        const parsed: Vehicle[] = saved ? JSON.parse(saved) : [];
        setVehicles(parsed);
        setSelectedVehicleId(localStorage.getItem('iyontree_selected_vehicle_id'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(currentUser);
  }, [currentUser]);

  const addVehicle = async (vehicle: Vehicle) => {
    if (currentUser) {
      try {
        await vehicleApi.create({
          brand: vehicle.brand,
          model: vehicle.model,
          variant: vehicle.variant ?? '',
          year: vehicle.year ?? 0,
          customName: vehicle.customName,
          soc: vehicle.soc,
          batteryCapacityKwh: vehicle.batteryCapacityKwh ?? 0,
          isActive: vehicle.isActive ?? false,
        });
        await fetchVehicles(currentUser);
      } catch (e) {
        const msg = e instanceof ApiError
          ? e.message
          : 'React API Çağrısı Başarısız: Sunucu Hatası.';
        throw new Error(msg);
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

    const previousVehicles = [...vehicles];
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));

    const driverPatch = pickDriverFields(updates);
    if (Object.keys(driverPatch).length > 0) {
      saveDriverOverlay(id, driverPatch);
    }

    if (currentUser) {
      try {
        await vehicleApi.update(id, {
          customName: updates.customName ?? target.customName,
          soc: updates.soc ?? target.soc,
          isActive: Object.prototype.hasOwnProperty.call(updates, 'isActive')
            ? (updates.isActive ?? false)
            : target.id === selectedVehicleId,
        });
      } catch (e) {
        setVehicles(previousVehicles);
        const msg = e instanceof ApiError
          ? e.message
          : 'React API Çağrısı Başarısız: Güncelleme.';
        throw new Error(msg);
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
    const previousVehicles = [...vehicles];
    setVehicles(prev => prev.filter(v => v.id !== id));

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
        await vehicleApi.remove(id);
        await fetchVehicles(currentUser);
      } catch (e) {
        console.error('removeVehicle API error:', e);
        setVehicles(previousVehicles);
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
      await updateVehicle(id, { isActive: true });
      await fetchVehicles(currentUser);
    } else {
      localStorage.setItem('iyontree_selected_vehicle_id', id);
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) ?? null;

  return (
    <VehicleContext.Provider value={{
      vehicles,
      selectedVehicleId,
      selectedVehicle,
      addVehicle,
      updateVehicle,
      removeVehicle,
      selectVehicle,
      isLoading,
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
