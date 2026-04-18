import React, { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { useVehicle } from './VehicleContext';
import { apiClient } from '../lib/apiClient';

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

export interface RouteLegDto {
  from_location?: string;
  to_location?: string;
  distance_km: number;
  duration_min: number;
  start_soc: number;
  end_soc: number;
  polyline?: string;
}

export interface ChargingStopDto {
  station_name: string;
  lat: number;
  lon: number;
  charge_time_min: number;
  arrival_soc: number;
  departure_soc: number;
}

export interface RouteResultDto {
  status: 'success' | 'partial' | 'failed' | string;
  total_distance_km: number;
  total_duration_min: number;
  legs: RouteLegDto[];
  charging_stops: ChargingStopDto[];
  overview_polyline?: string;
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
  toggleFeribot: true,        // true = feribotlara izin ver (varsayılan)
  toggleUcretliOtoyollar: true, // true = ücretli otoyollara izin ver (varsayılan)
  toggleOtoyollar: true,       // true = otoyollara izin ver (varsayılan)
};

const RouteContext = createContext<RouteContextValue | undefined>(undefined);

export const RouteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pendingSettings, setPendingSettings] = useState<RouteSettings>(defaultSettings);
  const [committedSettings, setCommittedSettings] = useState<RouteSettings>(defaultSettings);
  const [routeResult, setRouteResult] = useState<RouteResultDto | null>(null);
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
        currentSoc: selectedVehicle.soc ?? 80, // Batarya yüzdesi (VehicleCard slider'ından)
        
        // Sürücü ayarları (VehicleSettingsView → VehicleContext → selectedVehicle)
        passengers: selectedVehicle.passengers ?? 1,
        extraWeight: selectedVehicle.extraWeight ?? 0,
        climateControl: selectedVehicle.climateControl ?? true,
        drivingStyle: selectedVehicle.drivingStyle ?? 'normal',
        maxSpeed: selectedVehicle.maxSpeed ?? 130,
        refConsumption: selectedVehicle.refConsumption ?? 16.5,
        
        // Rota ayarları (RouteSettingsModal → committedSettings)
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

      const res = await apiClient('/Route/plan', {
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
      
      // 🔍 Tam detaylı debug log
      console.log('📦 [RouteContext] Gelen routeResult:', JSON.stringify(data, null, 2).substring(0, 3000));
      console.log('📊 [RouteContext] Analiz:', {
        status: data.status,
        total_distance_km: data.total_distance_km,
        total_duration_min: data.total_duration_min,
        legs_count: data.legs?.length ?? 0,
        legs_with_polyline: data.legs?.filter(l => l.polyline && l.polyline.length > 0).length ?? 0,
        charging_stops_count: data.charging_stops?.length ?? 0,
        overview_polyline: data.overview_polyline ? `${data.overview_polyline.length} chars` : 'YOK',
      });
      
      // Her leg'i ayrı logla
      data.legs?.forEach((leg, i) => {
        console.log(`  🚗 Leg[${i}]:`, {
          from: leg.from_location,
          to: leg.to_location,
          polyline: leg.polyline ? `${leg.polyline.length} chars` : 'YOK ⚠️',
          distance: leg.distance_km,
          soc: `${leg.start_soc}% → ${leg.end_soc}%`
        });
      });
      
      data.charging_stops?.forEach((stop, i) => {
        console.log(`  ⚡ Stop[${i}]:`, {
          name: stop.station_name,
          coords: `${stop.lat}, ${stop.lon}`,
          soc: `${stop.arrival_soc}% → ${stop.departure_soc}%`
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
