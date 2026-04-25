import React, { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useVehicle } from './VehicleContext';
import { routeApi } from '../api/routeApi';
import { ApiError } from '../lib/apiClient';
import type {
  RouteResultDto,
  RouteLegDto,
  ChargingStopDto,
  ConnectorInfoDto,
  StationAmenityDto,
  WeatherInfoDto,
  RouteInsightDto,
} from '../types/api/route';

// Re-export DTO types so existing consumers don't break
export type { RouteResultDto, RouteLegDto, ChargingStopDto, ConnectorInfoDto, StationAmenityDto, RouteInsightDto };
export type WeatherInfo = WeatherInfoDto;
export type ConnectorInfo = ConnectorInfoDto;
export type StationAmenity = StationAmenityDto;
export type RouteInsight = RouteInsightDto;

const ROUTE_SETTINGS_STORAGE_KEY = 'iyontree_route_settings';

export interface RouteSettings {
  chargingFrequency: 'optimal' | 'az' | 'sik';
  arrivalSoc: number;
  stationArrivalSoc: number;
  stationDepartureSoc: number;
  chargerSpeedPref: 'HPC' | 'DC' | 'AC' | 'any';
  toggleFeribot: boolean;
  toggleUcretliOtoyollar: boolean;
  toggleOtoyollar: boolean;
}

export interface Location {
  id: string;
  type: string;
  value: string;
  coords?: { lat: number; lng: number };
}

export interface RouteContextValue {
  pendingSettings: RouteSettings;
  setPendingSettings: React.Dispatch<React.SetStateAction<RouteSettings>>;

  committedSettings: RouteSettings;
  commitSettings: () => void;

  routeResult: RouteResultDto | null;
  setRouteResult: React.Dispatch<React.SetStateAction<RouteResultDto | null>>;
  routeLocations: Location[];
  isPlanning: boolean;
  error: string | null;

  planRoute: (locations: Location[]) => void;
  cancelRoute: () => void;
  clearRoute: () => void;
}

const defaultSettings: RouteSettings = {
  chargingFrequency: 'optimal',
  arrivalSoc: 20,
  stationArrivalSoc: 10,
  stationDepartureSoc: 80,
  chargerSpeedPref: 'any',
  toggleFeribot: true,
  toggleUcretliOtoyollar: true,
  toggleOtoyollar: true,
};

function loadPersistedSettings(): RouteSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(ROUTE_SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

const RouteContext = createContext<RouteContextValue | undefined>(undefined);

export const RouteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialSettings = loadPersistedSettings();
  const [pendingSettings, setPendingSettings] = useState<RouteSettings>(initialSettings);
  const [committedSettings, setCommittedSettings] = useState<RouteSettings>(initialSettings);

  useEffect(() => {
    try {
      localStorage.setItem(ROUTE_SETTINGS_STORAGE_KEY, JSON.stringify(committedSettings));
    } catch {
      // quota / private mode
    }
  }, [committedSettings]);

  const [routeResult, setRouteResult] = useState<RouteResultDto | null>(null);
  const [routeLocations, setRouteLocations] = useState<Location[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const { selectedVehicle } = useVehicle();

  const commitSettings = useCallback(() => {
    setCommittedSettings(pendingSettings);
  }, [pendingSettings]);

  const planRoute = useCallback(async (locations: Location[]) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsPlanning(true);
    setError(null);

    try {
      if (!selectedVehicle) {
        throw new Error('Lütfen rota planlamadan önce bir araç seçin.');
      }

      const validLocations = locations.filter(l => l.coords);
      if (validLocations.length < 2) {
        throw new Error('Geçerli bir başlangıç ve varış noktası seçmelisiniz.');
      }

      setRouteLocations(validLocations);

      const startLoc = validLocations[0];
      const endLoc = validLocations[validLocations.length - 1];
      const waypoints = validLocations.slice(1, -1);

      const payload = {
        startLat: startLoc.coords!.lat,
        startLng: startLoc.coords!.lng,
        startAddress: startLoc.value,
        endLat: endLoc.coords!.lat,
        endLng: endLoc.coords!.lng,
        endAddress: endLoc.value,
        waypoints: waypoints.map(l => ({
          lat: l.coords!.lat,
          lng: l.coords!.lng,
          address: l.value,
        })),
        vehicleId: selectedVehicle.id,
        vehicleBrand: selectedVehicle.brand,
        vehicleModel: selectedVehicle.model,
        vehicleVariant: selectedVehicle.variant ?? '',
        currentSoc: selectedVehicle.soc ?? 80,
        passengers: selectedVehicle.passengers ?? 1,
        extraWeight: selectedVehicle.extraWeight ?? 0,
        climateControl: selectedVehicle.climateControl ?? true,
        drivingStyle: selectedVehicle.drivingStyle ?? 'normal',
        maxSpeed: selectedVehicle.maxSpeed ?? 130,
        refConsumption: selectedVehicle.refConsumption ?? 16.5,
        sarjSikligi: committedSettings.chargingFrequency,
        varisSarj: committedSettings.arrivalSoc,
        istasyonVarisSarj: committedSettings.stationArrivalSoc,
        istasyonAyrisSarj: committedSettings.stationDepartureSoc,
        sarjTercipi: committedSettings.chargerSpeedPref,
        toggleFeribot: committedSettings.toggleFeribot,
        toggleUcretliOtoyollar: committedSettings.toggleUcretliOtoyollar,
        toggleOtoyollar: committedSettings.toggleOtoyollar,
      };

      console.log('🚀 [RouteContext] Rota planlanıyor...', { payload });

      const data = await routeApi.plan(payload);

      console.log('📊 [RouteContext] Analiz:', {
        status: data.status,
        total_distance_km: data.total_distance_km,
        legs_count: data.legs?.length ?? 0,
        charging_stops_count: data.charging_stops?.length ?? 0,
        overview_polyline: data.overview_polyline ? `${data.overview_polyline.length} chars` : 'YOK',
      });

      data.legs?.forEach((leg, i) => {
        console.log(`  🚗 Leg[${i}]:`, {
          from: leg.from_location,
          to: leg.to_location,
          polyline: leg.polyline ? `${leg.polyline.length} chars` : 'YOK ⚠️',
          distance: leg.distance_km,
          soc: `${leg.start_soc}% → ${leg.end_soc}%`,
        });
      });

      data.charging_stops?.forEach((stop, i) => {
        console.log(`  ⚡ Stop[${i}]:`, {
          name: stop.station_name,
          coords: `${stop.lat}, ${stop.lon}`,
          soc: `${stop.arrival_soc}% → ${stop.departure_soc}%`,
          energy: stop.energy_added_kwh,
          cost: stop.estimated_cost,
        });
      });

      setRouteResult(data);
      console.log('✅ [RouteContext] routeResult state güncellendi!');
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      console.error('💥 [RouteContext] Hata:', e);
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : 'Rota hesaplanamadı.');
      }
    } finally {
      setIsPlanning(false);
    }
  }, [committedSettings, selectedVehicle]);

  const cancelRoute = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsPlanning(false);
  }, []);

  const clearRoute = useCallback(() => {
    setRouteResult(null);
    setRouteLocations([]);
    setError(null);
    cancelRoute();
  }, [cancelRoute]);

  return (
    <RouteContext.Provider value={{
      pendingSettings,
      setPendingSettings,
      committedSettings,
      commitSettings,
      routeResult,
      setRouteResult,
      routeLocations,
      isPlanning,
      error,
      planRoute,
      cancelRoute,
      clearRoute,
    }}>
      {children}
    </RouteContext.Provider>
  );
};

export function useRouteContext() {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRouteContext must be used within a RouteProvider');
  }
  return context;
}
