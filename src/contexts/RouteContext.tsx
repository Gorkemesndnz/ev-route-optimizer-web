import React, { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useVehicle } from './VehicleContext';
import { apiClient } from '../lib/apiClient';
import { ENDPOINTS } from '../lib/endpoints';

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

// ============================================================
// FastAPI MultiStopRouteResponse ↔ .NET RouteResultDto aynası
// ============================================================

export interface WeatherInfo {
  temp_c: number;
  condition: string;
  wind_speed_mps: number;
  wind_direction_deg: number;
  precipitation_prob: number;
}

export interface RouteInsight {
  type: string;         // warning | info | tip | saving
  title: string;
  message: string;
  icon: string;
  relevance_score: number;
}

export interface ConnectorInfo {
  plug_type: string;
  charger_type: string; // AC | DC | HPC
  power_kw: number;
  status: string;       // Available | Occupied | Unknown | OutOfOrder
  price_per_kwh?: number | null;
  currency: string;
  count: number;
}

export interface StationAmenity {
  has_toilet: boolean;
  has_food: boolean;
  has_wifi: boolean;
  has_shopping: boolean;
  has_parking: boolean;
  is_24_7: boolean;
}

export interface RouteLegDto {
  from_location?: string | null;
  to_location?: string | null;
  from_lat?: number | null;
  from_lon?: number | null;
  to_lat?: number | null;
  to_lon?: number | null;
  distance_km: number;
  duration_min: number;
  avg_speed_kmh: number;
  consumption_kwh: number;
  elevation_gain_m: number;
  elevation_loss_m: number;
  start_soc: number;
  end_soc: number;
  polyline?: string | null;
}

export interface ChargingStopDto {
  station_id?: string | null;
  station_name: string;
  operator?: string | null;
  lat: number;
  lon: number;
  address?: string | null;
  rating: number;
  charge_time_min: number;
  arrival_soc: number;
  departure_soc: number;
  energy_added_kwh: number;
  price_per_kwh?: number | null;
  estimated_cost?: number | null;
  currency: string;
  distance_from_route_km: number;
  is_open_now?: boolean | null;
  data_source?: string | null;
  connectors: ConnectorInfo[];
  amenities?: StationAmenity | null;
  weather?: WeatherInfo | null;
}

export interface RouteResultDto {
  status: 'success' | 'partial' | 'failed' | 'error' | string;
  message?: string | null;
  total_distance_km: number;
  total_duration_min: number;
  duration_without_traffic_min?: number | null;
  traffic_ratio?: number | null;
  consumption_kwh: number;
  total_charging_cost: number;
  total_regen_recovered_kwh: number;
  total_co2_savings_kg: number;
  route_strategy?: string | null;
  charge_stops_count: number;
  legs: RouteLegDto[];
  charging_stops: ChargingStopDto[];
  overview_polyline?: string | null;
  start_weather?: WeatherInfo | null;
  end_weather?: WeatherInfo | null;
  insights: RouteInsight[];
  warning_messages: string[];
}

export interface Location {
  id: string;
  type: string;
  value: string; // Adress string
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
    const parsed = JSON.parse(raw);
    // Şema eklemeleri için default'larla birleştir; eski/kısmi kayıtları bozmayız.
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

const RouteContext = createContext<RouteContextValue | undefined>(undefined);

export const RouteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialSettings = loadPersistedSettings();
  const [pendingSettings, setPendingSettings] = useState<RouteSettings>(initialSettings);
  const [committedSettings, setCommittedSettings] = useState<RouteSettings>(initialSettings);

  // Committed ayarlar = kullanıcının onayladığı (planRoute'a gönderilecek) ayarlar.
  // Kullanıcı manuel güncellemeden plan başına sıfırlanmamalı.
  useEffect(() => {
    try {
      localStorage.setItem(ROUTE_SETTINGS_STORAGE_KEY, JSON.stringify(committedSettings));
    } catch {
      // quota dolu veya private mode — sessizce yut, in-memory state yeterli
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

      const res = await apiClient(ENDPOINTS.ROUTE_PLAN, {
        method: 'POST',
        body: payload,
        signal: abortControllerRef.current.signal,
      });

      console.log('📡 [RouteContext] HTTP yanıtı:', { status: res.status, ok: res.ok });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('❌ [RouteContext] API hata yanıtı:', data);
        const errorMsg = data.title || data.message || data.error || (data.errors ? JSON.stringify(data.errors) : `Sunucu hatası: HTTP ${res.status}`);
        throw new Error(errorMsg);
      }

      const data: RouteResultDto = await res.json();

      console.log('📊 [RouteContext] Analiz:', {
        status: data.status,
        total_distance_km: data.total_distance_km,
        total_duration_min: data.total_duration_min,
        consumption_kwh: data.consumption_kwh,
        total_charging_cost: data.total_charging_cost,
        legs_count: data.legs?.length ?? 0,
        legs_with_polyline: data.legs?.filter(l => l.polyline && l.polyline.length > 0).length ?? 0,
        charging_stops_count: data.charging_stops?.length ?? 0,
        insights_count: data.insights?.length ?? 0,
        overview_polyline: data.overview_polyline ? `${data.overview_polyline.length} chars` : 'YOK',
      });

      data.legs?.forEach((leg, i) => {
        console.log(`  🚗 Leg[${i}]:`, {
          from: leg.from_location,
          to: leg.to_location,
          polyline: leg.polyline ? `${leg.polyline.length} chars` : 'YOK ⚠️',
          distance: leg.distance_km,
          consumption: leg.consumption_kwh,
          soc: `${leg.start_soc}% → ${leg.end_soc}%`
        });
      });

      data.charging_stops?.forEach((stop, i) => {
        console.log(`  ⚡ Stop[${i}]:`, {
          name: stop.station_name,
          operator: stop.operator,
          coords: `${stop.lat}, ${stop.lon}`,
          soc: `${stop.arrival_soc}% → ${stop.departure_soc}%`,
          energy: stop.energy_added_kwh,
          cost: stop.estimated_cost
        });
      });

      setRouteResult(data);
      console.log('✅ [RouteContext] routeResult state güncellendi!');
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      console.error('💥 [RouteContext] Hata:', e);
      setError(e instanceof Error ? e.message : 'Rota hesaplanamadı.');
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
      clearRoute
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
