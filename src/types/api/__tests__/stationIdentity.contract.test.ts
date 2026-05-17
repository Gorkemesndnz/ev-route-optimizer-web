import { describe, expect, it } from 'vitest';
import type { BaseStationDto, ChargingStationDto } from '../station';
import type { StationData } from '../../../contexts/StationContext';

describe('station identity contract', () => {
  it('accepts optional Google identity fields without dropping legacy numeric id', () => {
    const station: ChargingStationDto = {
      id: 123,
      placeId: 'places/google-station-1',
      sourceProvider: 'google',
      sourceId: 'places/google-station-1',
      title: 'Google EV Station',
      latitude: 41,
      longitude: 29,
      usageType: 'Google Place API',
      statusType: 'Bilinmiyor',
      formattedAddress: 'Istanbul',
      connections: [],
      amenities: [],
      contactTelephone: '',
    };

    expect(station.id).toBe(123);
    expect(station.placeId).toBe('places/google-station-1');
    expect(station.sourceProvider).toBe('google');
    expect(station.sourceId).toBe('places/google-station-1');
  });

  it('keeps legacy OCM id while accepting source identity fields', () => {
    const station: BaseStationDto = {
      id: 'db-guid',
      ocmId: 456,
      sourceProvider: 'ocm',
      sourceId: '456',
      title: 'OCM Station',
      latitude: 40,
      longitude: 30,
      usageTypeTitle: 'Public',
    };

    expect(station.ocmId).toBe(456);
    expect(station.sourceProvider).toBe('ocm');
    expect(station.sourceId).toBe('456');
  });

  it('allows selected route stations to carry provider identity', () => {
    const selected: StationData = {
      id: 'station-from-route',
      sourceProvider: 'google',
      sourceId: 'places/route-stop-1',
      title: 'Route Stop',
      latitude: 41,
      longitude: 29,
    };

    expect(selected.sourceProvider).toBe('google');
    expect(selected.sourceId).toBe('places/route-stop-1');
  });
});
