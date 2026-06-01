// =============================================================================
// Sprint 0 — React Payload Kontrat Testleri
// =============================================================================
// RouteContext.planRoute() fonksiyonunun .NET backend'e gönderdiği payload'un
// REFACTOR HEDEF KONTRATInI kilitler. Bazı testler bilerek kırmızıdır
// (it.skip ile işaretli) — Sprint X tamamlandığında ilgili skip kaldırılır,
// test yeşile döner.
//
// Kapsam:
//   R1 refConsumption_default_not_sent      — yeşil (refConsumption ?? 16.5 default kalktı)
//   R2 refConsumption_explicit_override     — yeşil
//   R3 smart_mode_no_manual_soc             — yeşil (default arrivalSoc=null)
//   R3b smart_mode_ignores_persisted_soc    — yeşil (persisted manuel değerler de yok sayılır)
//   R4 provider_manual_mode_explicit_soc     — yeşil (RouteProvider persisted state kontratı)
//   R5 optimization_mode_from_state         — yeşil (hardcoded 'balanced' kalktı)
//   R6 road_preferences_passed              — yeşil (toggleFeribot/toggleOtoyollar/toggleUcretliOtoyollar iletiliyor)
//   R7 bridge_preferences_passed            — yeşil (Sprint 3: toggleKopruler + toggleOzelOtoyollar)
//
// Not: testing-library yok; React'in kendi createRoot + act'ını kullanıyoruz.
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import type { Vehicle } from '../../types/vehicle';
import { ApiError } from '../../lib/apiClient';

// React 18+ act() ortam flag'i (vitest + happy-dom için gerekli)
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// -----------------------------------------------------------------------------
// Mock: routeApi (payload'u yakalamak için spy)
// -----------------------------------------------------------------------------
const DEFAULT_ROUTE_RESULT = {
  status: 'success',
  message: null,
  total_distance_km: 450,
  total_duration_min: 300,
  duration_without_traffic_min: null,
  traffic_ratio: null,
  consumption_kwh: 72,
  total_charging_cost: 0,
  total_regen_recovered_kwh: 0,
  total_co2_savings_kg: 0,
  route_strategy: null,
  charge_stops_count: 0,
  overview_polyline: '_p~iF~ps|U_ulLnnqC',
  start_weather: null,
  end_weather: null,
  insights: [],
  warning_messages: [],
  legs: [{
    from_location: 'Istanbul',
    to_location: 'Ankara',
    from_lat: 41.0082,
    from_lon: 28.9784,
    to_lat: 39.9208,
    to_lon: 32.8541,
    distance_km: 450,
    duration_min: 300,
    avg_speed_kmh: 90,
    consumption_kwh: 72,
    elevation_gain_m: 0,
    elevation_loss_m: 0,
    start_soc: 80,
    end_soc: 20,
    polyline: '_p~iF~ps|U_ulLnnqC',
  }],
  charging_stops: [],
};

const planMock = vi.fn().mockResolvedValue(DEFAULT_ROUTE_RESULT);

vi.mock('../../api/routeApi', () => ({
  routeApi: {
    plan: (body: unknown) => planMock(body),
  },
}));

// -----------------------------------------------------------------------------
// Mock: VehicleContext — sabit bir selectedVehicle döndür
// -----------------------------------------------------------------------------
let mockSelectedVehicle: Vehicle | null = null;

vi.mock('../VehicleContext', () => ({
  useVehicle: () => ({
    selectedVehicle: mockSelectedVehicle,
    vehicles: mockSelectedVehicle ? [mockSelectedVehicle] : [],
    selectedVehicleId: mockSelectedVehicle?.id ?? null,
    addVehicle: vi.fn(),
    updateVehicle: vi.fn(),
    removeVehicle: vi.fn(),
    selectVehicle: vi.fn(),
    isLoading: false,
  }),
  VehicleProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// -----------------------------------------------------------------------------
// Test altyapısı
// -----------------------------------------------------------------------------
import { RouteProvider, useRouteContext, type RouteContextValue, type RouteSettings, type Location } from '../RouteContext';

const ISTANBUL: Location = {
  id: 'start', type: 'origin', value: 'Istanbul',
  coords: { lat: 41.0082, lng: 28.9784 },
};
const DUZCE: Location = {
  id: 'waypoint-1', type: 'waypoint', value: 'Duzce',
  coords: { lat: 40.8438, lng: 31.1565 },
};
const BOLU: Location = {
  id: 'waypoint-2', type: 'waypoint', value: 'Bolu',
  coords: { lat: 40.7350, lng: 31.6061 },
};
const ANKARA: Location = {
  id: 'end', type: 'destination', value: 'Ankara',
  coords: { lat: 39.9208, lng: 32.8541 },
};

const BASE_VEHICLE: Vehicle = {
  id: 'veh-1',
  brand: 'MG',
  model: 'MG4',
  variant: 'Standard Range',
  year: 2023,
  customName: 'My MG4',
  soc: 80,
  isActive: true,
  batteryCapacityKwh: 50.8,
  // driver overlay alanları test başına override edilir
};

const ROUTE_SETTINGS_STORAGE_KEY = 'iyontree_route_settings';

interface PlanInvoker {
  invoke: (locations: Location[]) => Promise<void>;
  commit: (settings: RouteSettings) => void;
  snapshot: () => RouteContextValue;
}

const Invoker: React.FC<{ controlRef: { current: PlanInvoker | null } }> = ({ controlRef }) => {
  const ctx = useRouteContext();
  // Her render'da en güncel ctx'i ref'e kaydet
  const ctxRef = React.useRef(ctx);
  ctxRef.current = ctx;
  React.useEffect(() => {
    controlRef.current = {
      invoke: async (locations) => {
        await ctxRef.current.planRoute(locations);
      },
      commit: (settings) => {
        ctxRef.current.commitSettings(settings);
      },
      snapshot: () => ctxRef.current,
    };
  });
  return null;
};

/**
 * settings parametresi — RouteSettings'i localStorage'a önceden yazar.
 * Provider mount olurken `loadPersistedSettings()` bu değerleri okur.
 * Bu helper RouteProvider payload kontratını test eder; RouteSettingsView'in
 * setPendingSettings -> commitSettings UI zincirini temsil etmez.
 */
async function renderProvider(seedSettings?: Partial<RouteSettings>) {
  if (seedSettings) {
    localStorage.setItem(
      ROUTE_SETTINGS_STORAGE_KEY,
      JSON.stringify(seedSettings),
    );
  }

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  const controlRef: { current: PlanInvoker | null } = { current: null };

  await act(async () => {
    root.render(
      React.createElement(RouteProvider, null,
        React.createElement(Invoker, { controlRef })
      )
    );
  });

  return {
    commit: async (settings: RouteSettings) => {
      await act(async () => {
        controlRef.current!.commit(settings);
      });
    },
    invoke: async (locations: Location[]) => {
      await act(async () => {
        await controlRef.current!.invoke(locations);
      });
    },
    snapshot: () => controlRef.current!.snapshot(),
    cleanup: () => {
      act(() => { root.unmount(); });
      container.remove();
    },
  };
}

function lastPayload(): Record<string, unknown> {
  expect(planMock).toHaveBeenCalled();
  return planMock.mock.calls[planMock.mock.calls.length - 1][0] as Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------
describe('RouteContext.planRoute payload contract', () => {
  beforeEach(() => {
    planMock.mockReset();
    planMock.mockResolvedValue(DEFAULT_ROUTE_RESULT);
    mockSelectedVehicle = { ...BASE_VEHICLE };
    // Localstorage'ı sıfırla — RouteSettings persist ediliyor
    try { localStorage.clear(); } catch { /* ignore */ }
  });

  // ===========================================================================
  // R1 — refConsumption explicit verilmediğinde gönderilmemeli
  // ===========================================================================
  // ŞU AN: RouteContext:173 → `refConsumption: selectedVehicle.refConsumption ?? 16.5`
  // HEDEF: hardcoded 16.5 kalktı; null/undefined olduğunda payload'da
  //        gerçekten null/undefined gönderilir → backend kendisi hesaplar.
  it('R1 — refConsumption verilmediğinde payload\'a default basmamalı', async () => {
    mockSelectedVehicle = { ...BASE_VEHICLE, refConsumption: undefined };
    const r = await renderProvider();
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      const payload = lastPayload();
      // Hardcoded 16.5 fallback'i kaldırıldı; refConsumption undefined kalır
      // ve .NET tarafında null'a denk düşer → backend WLTP'den hesaplar.
      expect(payload.refConsumption).toBeUndefined();
    } finally { r.cleanup(); }
  });

  // ===========================================================================
  // R2 — refConsumption explicit verilirse aynen iletiliyor
  // ===========================================================================
  it('R2 — refConsumption explicit verilirse payload\'a aynen iletiliyor', async () => {
    mockSelectedVehicle = { ...BASE_VEHICLE, refConsumption: 18.5 };
    const r = await renderProvider();
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      const payload = lastPayload();
      expect(payload.refConsumption).toBe(18.5);
    } finally { r.cleanup(); }
  });

  // ===========================================================================
  // R3 — Smart mode + manuel slider'lara dokunulmadıysa SOC'lar null gönderilir
  // ===========================================================================
  it('R3 — Smart mode default: varisSarj/istasyonVarisSarj/istasyonAyrisSarj null', async () => {
    const r = await renderProvider();
    try {
      // smartPlanner default true; arrivalSoc default null (RouteContext:76-78)
      await r.invoke([ISTANBUL, ANKARA]);
      const payload = lastPayload();
      expect(payload.smartPlanEnabled).toBe(true);
      expect(payload.varisSarj).toBeNull();
      expect(payload.istasyonVarisSarj).toBeNull();
      expect(payload.istasyonAyrisSarj).toBeNull();
    } finally { r.cleanup(); }
  });

  // ===========================================================================
  // R3b — Smart mode persisted manuel SOC değerlerini de göndermemeli
  // ===========================================================================
  // ŞU AN: RouteContext planRoute committedSettings değerlerini doğrudan payload'a
  // koyuyor. localStorage'da eski/manual SOC kalmışsa smartPlanner=true olsa bile
  // backend'e manuel override gidebilir.
  // HEDEF: smartPlanner=true iken SOC override alanları null gönderilir.
  it('R3b — smartPlanner=true iken persisted SOC override değerleri null gönderilir', async () => {
    const r = await renderProvider({
      smartPlanner: true,
      arrivalSoc: 20,
      stationArrivalSoc: 15,
      stationDepartureSoc: 80,
    });
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      const payload = lastPayload();
      expect(payload.smartPlanEnabled).toBe(true);
      expect(payload.varisSarj).toBeNull();
      expect(payload.istasyonVarisSarj).toBeNull();
      expect(payload.istasyonAyrisSarj).toBeNull();
    } finally { r.cleanup(); }
  });

  it('R3c — persisted SOC değerleri mount sırasında backend sınırlarına normalize edilir', async () => {
    const r = await renderProvider({
      smartPlanner: false,
      arrivalSoc: 100,
      stationArrivalSoc: 45,
      stationDepartureSoc: 50,
    });
    try {
      expect(r.snapshot().committedSettings.arrivalSoc).toBe(50);
      expect(r.snapshot().committedSettings.stationArrivalSoc).toBe(30);
      expect(r.snapshot().committedSettings.stationDepartureSoc).toBe(50);

      await r.invoke([ISTANBUL, ANKARA]);
      const payload = lastPayload();
      expect(payload.varisSarj).toBe(50);
      expect(payload.istasyonVarisSarj).toBe(30);
      expect(payload.istasyonAyrisSarj).toBe(50);
    } finally { r.cleanup(); }
  });

  // ===========================================================================
  // R4 — Provider persisted manuel mod state'i payload'a girer
  // ===========================================================================
  // Not: Bu test UI commit akışını değil, RouteProvider'ın persisted state'i
  // payload'a nasıl taşıdığını test eder. UI commit davranışı ayrı testlenmeli.
  it('R4 — provider persisted smartPlanner=false ve SOC override değerlerini payload\'a iletir', async () => {
    const r = await renderProvider({
      smartPlanner: false,
      arrivalSoc: 20,
      stationArrivalSoc: 15,
      stationDepartureSoc: 80,
    });
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      const payload = lastPayload();
      expect(payload.smartPlanEnabled).toBe(false);
      expect(payload.varisSarj).toBe(20);
      expect(payload.istasyonVarisSarj).toBe(15);
      expect(payload.istasyonAyrisSarj).toBe(80);
    } finally { r.cleanup(); }
  });

  it('R4b - commitSettings(nextSettings) sonrasi ilk rota istegi yeni ayarlari kullanir', async () => {
    const r = await renderProvider({
      smartPlanner: true,
      arrivalSoc: null,
      stationArrivalSoc: null,
      stationDepartureSoc: null,
      toggleFeribot: true,
      toggleUcretliOtoyollar: true,
      toggleOtoyollar: true,
    });

    try {
      const nextSettings: RouteSettings = {
        ...r.snapshot().committedSettings,
        smartPlanner: false,
        arrivalSoc: 35,
        stationArrivalSoc: 18,
        stationDepartureSoc: 72,
        chargingFrequency: 'sik',
        chargerSpeedPref: 'HPC',
        stationBrands: ['ZES', 'Trugo'],
        locationPrefs: ['AVM'],
        toggleFeribot: false,
        toggleUcretliOtoyollar: false,
        toggleOtoyollar: false,
        toggleKopruler: false,
        toggleOzelOtoyollar: false,
      };

      await r.commit(nextSettings);
      await r.invoke([ISTANBUL, ANKARA]);

      const payload = lastPayload();
      expect(payload.smartPlanEnabled).toBe(false);
      expect(payload.varisSarj).toBe(35);
      expect(payload.istasyonVarisSarj).toBe(18);
      expect(payload.istasyonAyrisSarj).toBe(72);
      expect(payload.sarjSikligi).toBe('sik');
      expect(payload.sarjTercipi).toBe('HPC');
      expect(payload.stationBrands).toEqual(['ZES', 'Trugo']);
      expect(payload.locationPrefs).toEqual(['AVM']);
      expect(payload.toggleFeribot).toBe(false);
      expect(payload.toggleUcretliOtoyollar).toBe(false);
      expect(payload.toggleOtoyollar).toBe(false);
      expect(payload.toggleKopruler).toBe(false);
      expect(payload.toggleOzelOtoyollar).toBe(false);
    } finally { r.cleanup(); }
  });

  // ===========================================================================
  // R5 — optimizationMode state'ten gelmeli, hardcoded 'balanced' olmamalı
  // ===========================================================================
  // ŞU AN: RouteContext:177 → `optimizationMode: 'balanced'` HARDCODED
  //        RouteSettings interface'inde optimizationMode alanı YOK.
  // HEDEF: RouteSettings'e optimizationMode eklendi, planRoute oradan okur.
  it('R5 — optimizationMode RouteSettings\'ten okunur (hardcoded değil)', async () => {
    const r = await renderProvider({
      optimizationMode: 'time_priority',
    });
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      const payload = lastPayload();
      expect(payload.optimizationMode).toBe('time_priority');
    } finally { r.cleanup(); }
  });

  // ===========================================================================
  // R6 — Yol kısıtlaması toggle'ları payload'a iletilir
  // ===========================================================================
  it('R6 — toggleFeribot/Otoyollar/UcretliOtoyollar payload\'da', async () => {
    const r = await renderProvider({
      toggleFeribot: false,
      toggleOtoyollar: true,
      toggleUcretliOtoyollar: true,
    });
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      const payload = lastPayload();
      expect(payload.toggleFeribot).toBe(false);
      expect(payload.toggleOtoyollar).toBe(true);
      expect(payload.toggleUcretliOtoyollar).toBe(true);
    } finally { r.cleanup(); }
  });

  it('R6b — Ücretli Yollar kapalı state\'i otoyol alt toggle\'larını da kapalı gönderir', async () => {
    const r = await renderProvider({
      toggleUcretliOtoyollar: false,
      toggleOtoyollar: true,
      toggleOzelOtoyollar: true,
    });
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      const payload = lastPayload();
      expect(payload.toggleUcretliOtoyollar).toBe(false);
      expect(payload.toggleOtoyollar).toBe(false);
      expect(payload.toggleOzelOtoyollar).toBe(false);
    } finally { r.cleanup(); }
  });

  // ===========================================================================
  // R7 — Köprü ve özel sektör otoyol tercihleri payload'da (Sprint 3'te yeşil)
  // ===========================================================================
  // Sprint 3'te RouteSettings'e toggleKopruler + toggleOzelOtoyollar eklendi
  // ve planRoute payload'da bu iki alan iletiliyor. .NET RouteRequestDto'da
  // ToggleKopruler/ToggleOzelOtoyollar olarak alınır, !X şeklinde ters çevrilip
  // FastAPI avoid_bridges/avoid_private_highways alanlarına gönderilir.
  it('R7 — toggleKopruler + toggleOzelOtoyollar payload\'da iletiliyor', async () => {
    const r = await renderProvider({
      toggleKopruler: false,
      toggleOzelOtoyollar: false,
    });
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      const payload = lastPayload();
      expect(payload.toggleKopruler).toBe(false);
      expect(payload.toggleOzelOtoyollar).toBe(false);
    } finally { r.cleanup(); }
  });

  // ===========================================================================
  // META — Payload'ın stabil üst-düzey şekli (regresyon koruması)
  // ===========================================================================
  it('Meta — Payload üst-düzey alanları stabil (refactor sırasında silinmemeli)', async () => {
    const r = await renderProvider();
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      const payload = lastPayload();
      const required = [
        'startLat', 'startLng', 'endLat', 'endLng',
        'vehicleId', 'vehicleBrand', 'vehicleModel',
        'currentSoc', 'passengers',
        'smartPlanEnabled', 'optimizationMode',
        'sarjSikligi', 'sarjTercipi',
        'toggleFeribot', 'toggleUcretliOtoyollar', 'toggleOtoyollar',
      ];
      for (const key of required) {
        expect(payload).toHaveProperty(key);
      }
    } finally { r.cleanup(); }
  });

  // ===========================================================================
  // R8 — Durak Ekle / waypoint UI zinciri: start/end waypoint'e karismaz
  // ===========================================================================
  it('R8 — 3 lokasyonlu istekte sadece ara durak waypoints[0] olur', async () => {
    const r = await renderProvider();
    try {
      await r.invoke([ISTANBUL, DUZCE, ANKARA]);
      const payload = lastPayload();
      expect(payload.startLat).toBe(ISTANBUL.coords!.lat);
      expect(payload.startLng).toBe(ISTANBUL.coords!.lng);
      expect(payload.endLat).toBe(ANKARA.coords!.lat);
      expect(payload.endLng).toBe(ANKARA.coords!.lng);

      const waypoints = payload.waypoints as Array<Record<string, unknown>>;
      expect(waypoints).toHaveLength(1);
      expect(waypoints[0]).toEqual({
        lat: DUZCE.coords!.lat,
        lng: DUZCE.coords!.lng,
        address: DUZCE.value,
      });
    } finally { r.cleanup(); }
  });

  it('R8b — coklu ara durak sirasini korur ve start/end waypoints listesine girmez', async () => {
    const r = await renderProvider();
    try {
      await r.invoke([ISTANBUL, DUZCE, BOLU, ANKARA]);
      const payload = lastPayload();

      expect(payload.startLat).toBe(ISTANBUL.coords!.lat);
      expect(payload.endLat).toBe(ANKARA.coords!.lat);
      expect(payload.waypoints).toEqual([
        { lat: DUZCE.coords!.lat, lng: DUZCE.coords!.lng, address: DUZCE.value },
        { lat: BOLU.coords!.lat, lng: BOLU.coords!.lng, address: BOLU.value },
      ]);
      expect(r.snapshot().routeLocations.map(l => l.value)).toEqual([
        ISTANBUL.value,
        DUZCE.value,
        BOLU.value,
        ANKARA.value,
      ]);
    } finally { r.cleanup(); }
  });

  it('R9 — gecersiz koordinat payload\'a girmeden rota istegi durdurulur', async () => {
    const invalidWaypoint: Location = {
      ...DUZCE,
      coords: { lat: Number.NaN, lng: 31.1565 },
    };
    const r = await renderProvider();
    try {
      await r.invoke([ISTANBUL, invalidWaypoint, ANKARA]);
      expect(planMock).not.toHaveBeenCalled();
      expect(r.snapshot().routeResult).toBeNull();
      expect(r.snapshot().error).toContain('Gecersiz konum koordinati');
    } finally { r.cleanup(); }
  });

  it('R10 — route API status=error donerse normal rota sonucu state\'e alinmaz', async () => {
    planMock.mockResolvedValueOnce({
      ...DEFAULT_ROUTE_RESULT,
      status: 'error',
      message: 'Provider route hesaplayamadi',
      legs: [],
    });
    const r = await renderProvider();
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      expect(planMock).toHaveBeenCalledTimes(1);
      expect(r.snapshot().routeResult).toBeNull();
      expect(r.snapshot().error).toBe('Provider route hesaplayamadi');
    } finally { r.cleanup(); }
  });

  it('R11 — legs null veya bos donerse bos timeline yerine typed hata state\'i olusur', async () => {
    planMock.mockResolvedValueOnce({
      ...DEFAULT_ROUTE_RESULT,
      legs: null,
    });
    const r = await renderProvider();
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      expect(planMock).toHaveBeenCalledTimes(1);
      expect(r.snapshot().routeResult).toBeNull();
      expect(r.snapshot().error).toContain('Rota sonucu eksik');
    } finally { r.cleanup(); }

    planMock.mockResolvedValueOnce({
      ...DEFAULT_ROUTE_RESULT,
      legs: [],
    });
    const r2 = await renderProvider();
    try {
      await r2.invoke([ISTANBUL, ANKARA]);
      expect(r2.snapshot().routeResult).toBeNull();
      expect(r2.snapshot().error).toContain('Rota sonucu eksik');
    } finally { r2.cleanup(); }
  });
  it('R12 - overview_polyline bos donerse rota sonucu state\'e alinmaz', async () => {
    planMock.mockResolvedValueOnce({
      ...DEFAULT_ROUTE_RESULT,
      overview_polyline: null,
    });
    const r = await renderProvider();
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      expect(planMock).toHaveBeenCalledTimes(1);
      expect(r.snapshot().routeResult).toBeNull();
      expect(r.snapshot().error).toContain('Rota cizgisi eksik');
    } finally { r.cleanup(); }
  });

  it('R13 - TOO_MANY_WAYPOINTS hata kodu kullanici dostu mesaja cevrilir', async () => {
    planMock.mockRejectedValueOnce(new ApiError(
      'Dış API hatası (GoogleDirections): raw provider detail',
      502,
      { success: false, error: { code: 'TOO_MANY_WAYPOINTS', message: 'raw provider detail' } },
    ));
    const r = await renderProvider();
    try {
      await r.invoke([ISTANBUL, DUZCE, BOLU, ANKARA]);
      expect(r.snapshot().routeResult).toBeNull();
      expect(r.snapshot().error).toBe('Cok fazla ara durak eklendi. Lutfen durak sayisini azaltip tekrar deneyin.');
    } finally { r.cleanup(); }
  });

  it('R14 - NO_ROUTE_WITH_CONSTRAINTS hata kodu yol tercihi mesajina cevrilir', async () => {
    planMock.mockRejectedValueOnce(new ApiError(
      'Yol/kopru tercihlerine uyan rota bulunamadi.',
      502,
      { success: false, error: { code: 'NO_ROUTE_WITH_CONSTRAINTS', message: 'raw constraints detail' } },
    ));
    const r = await renderProvider();
    try {
      await r.invoke([ISTANBUL, ANKARA]);
      expect(r.snapshot().routeResult).toBeNull();
      expect(r.snapshot().error).toBe('Bu yol tercihleriyle rota bulunamadi. Kopru, otoban veya ucretli yol ayarlarini gevsetip tekrar deneyin.');
    } finally { r.cleanup(); }
  });
});
