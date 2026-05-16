import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import RouteResultPanel from '../RouteResultPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  routeResult: null as any,
  routeLocations: [] as any[],
  setRouteResult: vi.fn(),
  onClose: vi.fn(),
}));

vi.mock('../../../contexts/RouteContext', () => ({
  useRouteContext: () => ({
    routeResult: mocks.routeResult,
    routeLocations: mocks.routeLocations,
    setRouteResult: mocks.setRouteResult,
  }),
}));

vi.mock('../../../contexts/SettingsContext', () => ({
  useSettings: () => ({ language: 'tr' }),
}));

vi.mock('../../../contexts/VehicleContext', () => ({
  useVehicle: () => ({ selectedVehicle: null }),
}));

vi.mock('../../../contexts/StationContext', () => ({
  useStation: () => ({ setSelectedStation: vi.fn() }),
}));

vi.mock('../../../contexts/SavedRouteContext', () => ({
  useSavedRoute: () => ({
    saveRoute: vi.fn(),
    getSavedRoute: vi.fn(),
    rateSavedRoute: vi.fn(),
  }),
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
    requireAuth: vi.fn(),
  }),
}));

vi.mock('../../../api/reviewApi', () => ({
  reviewApi: {
    getByStation: vi.fn(),
  },
}));

function renderPanel() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(React.createElement(RouteResultPanel, { onClose: mocks.onClose }));
  });

  return {
    container,
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

describe('RouteResultPanel route result contract', () => {
  beforeEach(() => {
    mocks.routeLocations = [];
    mocks.setRouteResult.mockClear();
    mocks.onClose.mockClear();
  });

  it('renders an empty-state instead of crashing when legs is empty', () => {
    mocks.routeResult = {
      status: 'success',
      message: null,
      total_distance_km: 0,
      total_duration_min: 0,
      consumption_kwh: 0,
      total_charging_cost: 0,
      total_co2_savings_kg: 0,
      legs: [],
      charging_stops: [],
      start_weather: null,
      end_weather: null,
      insights: [],
      warning_messages: [],
    };

    const rendered = renderPanel();
    try {
      expect(rendered.container.textContent).toContain('Rota sonucu eksik');
      expect(rendered.container.textContent).toContain('surus segmentleri alinamadi');
    } finally {
      rendered.cleanup();
    }
  });
});
