import React, { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useVehicle } from './VehicleContext';
import { routeApi } from '../api/routeApi';
import { ApiError } from '../lib/apiClient';
import { isValidLatLng } from '../lib/coordinates';
import { normalizeRouteSettingsSoc } from '../lib/routeSocSettings';
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

export type OptimizationMode = 'balanced' | 'time_priority' | 'cost_priority' | 'battery_care';

export interface RouteSettings {
  smartPlanner: boolean;            // true = sistem otomatik + kullanıcı override edebilir; false = sistem klasik mod, override yok
  // Pareto solver mode'u — UI'dan seçilir, default 'balanced'.
  // FAZ 2: .NET DTO OptimizationMode bekliyor; payload'a doğrudan iletiliyor.
  optimizationMode: OptimizationMode;
  chargingFrequency: 'optimal' | 'az' | 'sik';
  // null = sistem otomatik hesaplasın (override yok). Sayı = kullanıcı override değeri.
  // Smart Planner ON iken görünen 3 manuel slider; Smart OFF iken her zaman null.
  arrivalSoc: number | null;
  stationArrivalSoc: number | null;
  stationDepartureSoc: number | null;
  chargerSpeedPref: 'HPC' | 'DC' | 'AC' | 'any';
  stationBrands: string[];          // boş array = marka filtresi yok
  locationPrefs: string[];          // İstasyon lokasyon tercihleri (AVM, Kafe vb.)
  departureDate: string;            // YYYY-MM-DD
  departureTime: string;            // HH:mm (24-saat)
  toggleFeribot: boolean;
  toggleUcretliOtoyollar: boolean;
  toggleOtoyollar: boolean;
  // Sprint 3: Köprü ve özel sektör (BOT) otoyolları için ayrı toggle'lar.
  // Default true = "kullan". UI'dan off edilirse backend payload'da
  // avoid_bridges/avoid_private_highways true gönderir.
  toggleKopruler: boolean;
  toggleOzelOtoyollar: boolean;
}

export interface Location {
  id: string;
  type: string;
  value: string;
  coords?: { lat: number; lng: number };
}

export interface RouteContextValue {
  pendingSettings: RouteSettings;

  committedSettings: RouteSettings;
  commitSettings: (nextSettings: RouteSettings) => void;

  routeResult: RouteResultDto | null;
  setRouteResult: React.Dispatch<React.SetStateAction<RouteResultDto | null>>;
  routeLocations: Location[];
  isPlanning: boolean;
  error: string | null;

  planRoute: (locations: Location[]) => void;
  cancelRoute: () => void;
  clearRoute: () => void;
}

const todayIso = (() => {
  try { return new Date().toISOString().split('T')[0]; } catch { return ''; }
})();

const defaultSettings: RouteSettings = {
  smartPlanner: true,             // varsayılan: akıllı planlayıcı açık
  optimizationMode: 'balanced',   // varsayılan Pareto modu
  chargingFrequency: 'optimal',
  // null = "sistem otomatik hesaplasın". Hardcoded default verilmez —
  // kullanıcı override etmedikçe backend Pareto/Greedy ile kendisi karar verir.
  arrivalSoc: null,
  stationArrivalSoc: null,
  stationDepartureSoc: null,
  chargerSpeedPref: 'any',
  stationBrands: [],
  locationPrefs: [],
  departureDate: todayIso,
  departureTime: '10:00',
  toggleFeribot: true,
  toggleUcretliOtoyollar: true,
  toggleOtoyollar: true,
  toggleKopruler: true,         // Sprint 3: varsayılan köprülere izin ver
  toggleOzelOtoyollar: true,    // Sprint 3: varsayılan BOT otoyollarına izin ver
};

function loadPersistedSettings(): RouteSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(ROUTE_SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    return normalizeRouteSettingsSoc({ ...defaultSettings, ...JSON.parse(raw) });
  } catch {
    return defaultSettings;
  }
}

const RouteContext = createContext<RouteContextValue | undefined>(undefined);

function getRouteResultContractError(data: RouteResultDto | null | undefined): string | null {
  if (!data || typeof data !== 'object') {
    return 'Rota servisi gecersiz yanit dondu.';
  }

  if (data.status !== 'success') {
    return data.message || 'Rota hesaplanamadi.';
  }

  if (!Array.isArray((data as { legs?: unknown }).legs) || data.legs.length === 0) {
    return 'Rota sonucu eksik dondu. Lutfen tekrar deneyin.';
  }

  if (typeof (data as { overview_polyline?: unknown }).overview_polyline !== 'string'
      || data.overview_polyline.trim().length === 0) {
    return 'Rota cizgisi eksik dondu. Lutfen tekrar deneyin.';
  }

  if (!Array.isArray((data as { charging_stops?: unknown }).charging_stops)) {
    return 'Rota sarj duragi bilgisi eksik dondu. Lutfen tekrar deneyin.';
  }

  return null;
}

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

  const commitSettings = useCallback((nextSettings: RouteSettings) => {
    const normalizedSettings = normalizeRouteSettingsSoc(nextSettings);
    setPendingSettings(normalizedSettings);
    setCommittedSettings(normalizedSettings);
  }, []);

  const planRoute = useCallback(async (locations: Location[]) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsPlanning(true);
    setError(null);

    try {
      if (!selectedVehicle) {
        throw new Error('Lütfen rota planlamadan önce bir araç seçin.');
      }

      const hasInvalidCoords = locations.some(l => l.coords && !isValidLatLng(l.coords));
      if (hasInvalidCoords) {
        throw new Error('Gecersiz konum koordinati. Lutfen konumu yeniden secin.');
      }

      const validLocations = locations.filter((l): l is Location & { coords: { lat: number; lng: number } } =>
        isValidLatLng(l.coords)
      );
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
        // null/undefined ise gönderme — backend WLTP/spec'ten kendisi hesaplar.
        // Kullanıcı VehicleSettingsView'de explicit değer girmişse bu değer iletilir.
        refConsumption: selectedVehicle.refConsumption,
        smartPlanner: committedSettings.smartPlanner,
        // FAZ 2: .NET DTO smartPlanEnabled bekliyor (camelCase). smartPlanner eski alias — geriye uyumluluk için her ikisini de gönder.
        smartPlanEnabled: committedSettings.smartPlanner,
        // optimizationMode RouteSettings'ten okunur — UI Settings ekranından gelir.
        // Geriye uyumluluk: persisted state'te alan yoksa loadPersistedSettings
        // defaultSettings ile merge ettiği için 'balanced' düşer.
        optimizationMode: committedSettings.optimizationMode,
        sarjSikligi: committedSettings.chargingFrequency,
        // Smart mode aktifken persisted manual SOC değerleri payload'a SIZDIRILMAZ.
        // Kullanıcı önceden manual mode'da slider taşımış olabilir; smart'a geçince
        // backend Pareto solver kendi karar versin diye 3 alanı da null gönderiyoruz.
        // Manual mode (smartPlanner=false) → kullanıcının override değerleri respect edilir.
        varisSarj: committedSettings.smartPlanner ? null : committedSettings.arrivalSoc,
        istasyonVarisSarj: committedSettings.smartPlanner ? null : committedSettings.stationArrivalSoc,
        istasyonAyrisSarj: committedSettings.smartPlanner ? null : committedSettings.stationDepartureSoc,
        sarjTercipi: committedSettings.chargerSpeedPref,
        stationBrands: committedSettings.stationBrands,
        locationPrefs: committedSettings.locationPrefs,
        departureDate: committedSettings.departureDate,
        departureTime: committedSettings.departureTime,
        toggleFeribot: committedSettings.toggleFeribot,
        toggleUcretliOtoyollar: committedSettings.toggleUcretliOtoyollar,
        toggleOtoyollar: committedSettings.toggleOtoyollar,
        // Sprint 3: Köprü + özel sektör otoyol toggle'ları payload'a iletilir.
        // .NET RouteRequestDto'da ToggleKopruler/ToggleOzelOtoyollar alanları
        // tanımlı; PythonRouteService bunları !X şeklinde avoid_bridges/
        // avoid_private_highways'e çevirip FastAPI'ye gönderir.
        toggleKopruler: committedSettings.toggleKopruler,
        toggleOzelOtoyollar: committedSettings.toggleOzelOtoyollar,
      };

      console.log('🚀 [RouteContext] Rota planlanıyor...', { payload });

      const data = await routeApi.plan(payload);
      const contractError = getRouteResultContractError(data);
      if (contractError) {
        throw new Error(contractError);
      }

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
