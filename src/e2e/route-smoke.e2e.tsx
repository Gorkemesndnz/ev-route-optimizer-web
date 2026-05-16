import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import type { Vehicle } from '../types/vehicle';
import type { RouteContextValue, Location } from '../contexts/RouteContext';

// React 18+ act() ortam flag'i (vitest + happy-dom için gerekli).
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Smoke test gate'i: yalnız `RUN_ROUTE_SMOKE=1` env'i ile aktif olur.
// import.meta.env vitest'in client tarafında varsayılan olarak iletilir; node
// tarafında olmayan `process` global'ine düşmemek için önce import.meta'yı dener.
type ViteImportMeta = ImportMeta & { env?: Record<string, string | undefined> };
const importMetaEnv = (import.meta as ViteImportMeta).env;
const runSmoke =
  importMetaEnv?.RUN_ROUTE_SMOKE === '1' ||
  (typeof globalThis !== 'undefined' &&
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
      ?.env?.RUN_ROUTE_SMOKE === '1');
const describeSmoke = runSmoke ? describe : describe.skip;

let mockSelectedVehicle: Vehicle | null = null;

vi.mock('../contexts/VehicleContext', () => ({
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

const { RouteProvider, useRouteContext } = await import('../contexts/RouteContext');

const ROUTE_SETTINGS_STORAGE_KEY = 'iyontree_route_settings';

const ISTANBUL: Location = {
  id: 'smoke-start',
  type: 'origin',
  value: 'Istanbul',
  coords: { lat: 41.0082, lng: 28.9784 },
};

const IZMIT: Location = {
  id: 'smoke-end',
  type: 'destination',
  value: 'Izmit',
  coords: { lat: 40.7654, lng: 29.9408 },
};

const SMOKE_VEHICLE: Vehicle = {
  id: '00000000-0000-0000-0000-000000000000',
  brand: 'MG',
  model: 'MG4',
  variant: 'Standard Range',
  year: 2023,
  customName: 'Smoke MG4',
  soc: 85,
  isActive: true,
  batteryCapacityKwh: 50.8,
  passengers: 1,
  extraWeight: 0,
  climateControl: true,
  drivingStyle: 'normal',
  maxSpeed: 120,
  refConsumption: 16.5,
};

interface SmokeControl {
  invoke: (locations: Location[]) => Promise<RouteContextValue>;
  snapshot: () => RouteContextValue;
}

const Invoker: React.FC<{ controlRef: { current: SmokeControl | null } }> = ({ controlRef }) => {
  const ctx = useRouteContext();
  const ctxRef = React.useRef(ctx);
  ctxRef.current = ctx;

  React.useEffect(() => {
    controlRef.current = {
      invoke: async (locations) => {
        await (ctxRef.current.planRoute(locations) as unknown as Promise<void>);
        return ctxRef.current;
      },
      snapshot: () => ctxRef.current,
    };
  });

  return null;
};

async function renderProvider() {
  localStorage.setItem(
    ROUTE_SETTINGS_STORAGE_KEY,
    JSON.stringify({
      smartPlanner: true,
      chargingFrequency: 'optimal',
      arrivalSoc: null,
      stationArrivalSoc: null,
      stationDepartureSoc: null,
      chargerSpeedPref: 'any',
      stationBrands: [],
      locationPrefs: [],
      departureDate: new Date().toISOString().split('T')[0],
      departureTime: '10:00',
      toggleFeribot: true,
      toggleUcretliOtoyollar: true,
      toggleOtoyollar: true,
    }),
  );

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  const controlRef: { current: SmokeControl | null } = { current: null };

  await act(async () => {
    root.render(
      React.createElement(RouteProvider, null, React.createElement(Invoker, { controlRef })),
    );
  });

  return {
    invoke: async (locations: Location[]) => {
      let snapshot: RouteContextValue | null = null;
      await act(async () => {
        snapshot = await controlRef.current!.invoke(locations);
      });
      return snapshot ?? controlRef.current!.snapshot();
    },
    cleanup: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describeSmoke('local/manual route smoke', () => {
  beforeEach(() => {
    mockSelectedVehicle = { ...SMOKE_VEHICLE };
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  });

  it('routes through React payload -> .NET -> FastAPI', async () => {
    const r = await renderProvider();

    try {
      const ctx = await r.invoke([ISTANBUL, IZMIT]);

      expect(ctx.error).toBeNull();
      expect(ctx.routeResult, 'RouteProvider routeResult should be set').not.toBeNull();

      const result = ctx.routeResult!;
      expect(result.status).toBe('success');
      expect(result.total_distance_km).toBeGreaterThan(0);
      expect(Array.isArray(result.legs)).toBe(true);
    } finally {
      r.cleanup();
    }
  }, 180_000);
});

