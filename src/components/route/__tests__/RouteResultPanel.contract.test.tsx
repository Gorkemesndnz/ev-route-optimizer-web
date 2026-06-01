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
  setRouteLocations: vi.fn(),
  getSavedRoute: vi.fn(),
  onClose: vi.fn(),
}));

vi.mock('../../../contexts/RouteContext', () => ({
  useRouteContext: () => ({
    routeResult: mocks.routeResult,
    routeLocations: mocks.routeLocations,
    setRouteResult: mocks.setRouteResult,
    setRouteLocations: mocks.setRouteLocations,
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
    getSavedRoute: mocks.getSavedRoute,
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

function renderPanel(props: Partial<React.ComponentProps<typeof RouteResultPanel>> = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(React.createElement(RouteResultPanel, { onClose: mocks.onClose, ...props }));
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
    mocks.setRouteLocations.mockClear();
    mocks.getSavedRoute.mockReset();
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

  it('renders route summary when drive leg polyline is empty but overview polyline exists', () => {
    mocks.routeResult = {
      status: 'success',
      message: null,
      total_distance_km: 450,
      total_duration_min: 300,
      consumption_kwh: 60,
      total_charging_cost: 0,
      total_co2_savings_kg: 20,
      overview_polyline: '_p~iF~ps|U_ulLnnqC',
      legs: [
        {
          type: 'drive',
          from_location: 'Istanbul',
          to_location: 'Ankara',
          duration_min: 300,
          distance_km: 450,
          consumption_kwh: 60,
          end_soc: 30,
          polyline: '',
        },
      ],
      charging_stops: [],
      start_weather: null,
      end_weather: null,
      insights: [],
      warning_messages: [],
    };

    const rendered = renderPanel();
    try {
      expect(rendered.container.textContent).not.toContain('Rota sonucu eksik');
      expect(rendered.container.textContent).toContain('(450 km)');
      expect(rendered.container.textContent).toContain('60.0 kWh');
    } finally {
      rendered.cleanup();
    }
  });

  it('restores saved route locations in readonly mode and clears them on unmount', async () => {
    const savedLocations = [
      { id: 'start', type: 'start', value: 'Istanbul', coords: { lat: 41.0082, lng: 28.9784 } },
      { id: 'wp-1', type: 'waypoint', value: 'Duzce', coords: { lat: 40.8438, lng: 31.1565 } },
      { id: 'wp-2', type: 'waypoint', value: 'Bolu', coords: { lat: 40.7350, lng: 31.6061 } },
      { id: 'end', type: 'destination', value: 'Ankara', coords: { lat: 39.9208, lng: 32.8541 } },
    ];
    mocks.getSavedRoute.mockResolvedValue({
      id: 'saved-1',
      startLabel: 'Istanbul',
      endLabel: 'Ankara',
      totalDistanceKm: 450,
      totalDurationMin: 300,
      consumptionKwh: 60,
      totalChargingCost: 0,
      rating: null,
      ratingComment: null,
      createdAt: '2026-05-31T00:00:00Z',
      routeResultJson: JSON.stringify({
        status: 'success',
        message: null,
        total_distance_km: 450,
        total_duration_min: 300,
        consumption_kwh: 60,
        total_charging_cost: 0,
        total_co2_savings_kg: 0,
        charge_stops: 0,
        overview_polyline: '_p~iF~ps|U_ulLnnqC',
        legs: [{ type: 'drive', from_location: 'Istanbul', to_location: 'Ankara', duration_min: 300, distance_km: 450, consumption_kwh: 60, end_soc: 30 }],
        charging_stops: [],
        start_weather: null,
        end_weather: null,
        insights: [],
        warning_messages: [],
      }),
      routeRequestJson: JSON.stringify({ locations: savedLocations }),
    });

    const rendered = renderPanel({ mode: 'readonly', savedRouteId: 'saved-1' });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mocks.setRouteLocations).toHaveBeenCalledWith(savedLocations);

    rendered.cleanup();
    expect(mocks.setRouteResult).toHaveBeenLastCalledWith(null);
    expect(mocks.setRouteLocations).toHaveBeenLastCalledWith([]);
  });

  it('ignores malformed saved route request JSON without clearing the rendered result', async () => {
    mocks.getSavedRoute.mockResolvedValue({
      id: 'saved-1',
      startLabel: 'Istanbul',
      endLabel: 'Ankara',
      totalDistanceKm: 450,
      totalDurationMin: 300,
      consumptionKwh: 60,
      totalChargingCost: 0,
      rating: null,
      ratingComment: null,
      createdAt: '2026-05-31T00:00:00Z',
      routeResultJson: JSON.stringify({
        status: 'success',
        message: null,
        total_distance_km: 450,
        total_duration_min: 300,
        consumption_kwh: 60,
        total_charging_cost: 0,
        total_co2_savings_kg: 0,
        charge_stops: 0,
        overview_polyline: '_p~iF~ps|U_ulLnnqC',
        legs: [{ type: 'drive', from_location: 'Istanbul', to_location: 'Ankara', duration_min: 300, distance_km: 450, consumption_kwh: 60, end_soc: 30 }],
        charging_stops: [],
        start_weather: null,
        end_weather: null,
        insights: [],
        warning_messages: [],
      }),
      routeRequestJson: '{not-json',
    });

    const rendered = renderPanel({ mode: 'readonly', savedRouteId: 'saved-1' });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mocks.setRouteResult).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
    expect(mocks.setRouteLocations).not.toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ type: 'waypoint' }),
    ]));

    rendered.cleanup();
  });
});
