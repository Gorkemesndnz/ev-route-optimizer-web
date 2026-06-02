import { describe, expect, it } from 'vitest';
import { routeStopToStationData } from '../routeLayerModel';
import type { ChargingStopDto } from '../../../types/api/route';

function stop(overrides: Partial<ChargingStopDto> = {}): ChargingStopDto {
  return {
    station_id: 'legacy-123',
    station_name: 'Google Stop',
    operator: 'Google',
    lat: 41,
    lon: 29,
    address: 'Test address',
    rating: 4.5,
    charge_time_min: 20,
    arrival_soc: 18,
    departure_soc: 80,
    energy_added_kwh: 32,
    price_per_kwh: null,
    estimated_cost: null,
    currency: 'TRY',
    distance_from_route_km: 0.2,
    is_open_now: true,
    data_source: 'google',
    connectors: [],
    amenities: null,
    weather: null,
    ...overrides,
  };
}

describe('routeStopToStationData', () => {
  it('preserves provider identity for Google route stops', () => {
    const selected = routeStopToStationData(stop({
      source_provider: 'google',
      source_id: 'places/google-stop-1',
    }), 0);

    expect(selected.id).toBe('legacy-123');
    expect(selected.placeId).toBe('places/google-stop-1');
    expect(selected.sourceProvider).toBe('google');
    expect(selected.sourceId).toBe('places/google-stop-1');
  });

  it('keeps numeric id as legacy fallback for OCM route stops', () => {
    const selected = routeStopToStationData(stop({
      station_id: '456',
      source_provider: 'ocm',
      source_id: '456',
    }), 0);

    expect(selected.id).toBe('456');
    expect(selected.placeId).toBeNull();
    expect(selected.sourceProvider).toBe('ocm');
    expect(selected.sourceId).toBe('456');
  });
});
