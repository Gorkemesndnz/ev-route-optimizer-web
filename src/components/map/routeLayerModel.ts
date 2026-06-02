import type { StationData } from '../../contexts/StationContext';
import type { ChargingStopDto } from '../../types/api/route';

export function routeStopToStationData(stop: ChargingStopDto, idx: number): StationData {
  const sourceProvider = stop.source_provider ?? null;
  const sourceId = stop.source_id ?? null;
  const stationId = stop.station_id || `stop-${idx}`;

  return {
    id: stationId,
    placeId: sourceProvider === 'google' ? (sourceId ?? stationId) : null,
    sourceProvider,
    sourceId,
    title: stop.station_name || stop.operator || 'Şarj İstasyonu',
    latitude: stop.lat,
    longitude: stop.lon,
    formattedAddress: stop.address || '',
    connections: stop.connectors?.map(c => ({
      connectionType: c.plug_type,
      currentType: c.charger_type,
      powerKw: c.power_kw,
      status: c.status,
      count: c.count,
    })) || [],
  };
}

export type EndpointMarkerKind = 'start' | 'end';

export function createEndpointMarkerIcon(kind: EndpointMarkerKind): google.maps.Icon {
  const isStart = kind === 'start';
  const gradient = isStart
    ? { from: '#10b981', to: '#0284c7', ring: '#a7f3d0' }
    : { from: '#f43f5e', to: '#f97316', ring: '#fecdd3' };
  const glyph = isStart
    ? '<path d="M18 15.2v9.6l8-4.8-8-4.8Z" fill="#0f172a"/>'
    : '<path d="M16.8 27V13.8M17.2 14.5c1.8-1.1 3.8-.5 5.5.1 1.6.6 3.1 1 4.5-.1v7.8c-1.4 1.1-2.9.7-4.5.1-1.7-.6-3.7-1.2-5.5-.1" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
      <defs>
        <linearGradient id="markerGradient" x1="8" y1="6" x2="36" y2="42" gradientUnits="userSpaceOnUse">
          <stop stop-color="${gradient.from}"/>
          <stop offset="1" stop-color="${gradient.to}"/>
        </linearGradient>
        <filter id="markerShadow" x="-30%" y="-20%" width="160%" height="150%" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#020617" flood-opacity="0.45"/>
        </filter>
      </defs>
      <path filter="url(#markerShadow)" d="M22 49s15-15.9 15-29.2C37 10.7 30.3 4 22 4S7 10.7 7 19.8C7 33.1 22 49 22 49Z" fill="url(#markerGradient)" stroke="#ffffff" stroke-width="2.6"/>
      <circle cx="22" cy="20" r="10.2" fill="#ffffff" stroke="${gradient.ring}" stroke-width="2"/>
      ${glyph}
    </svg>
  `;

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(44, 52),
    anchor: new google.maps.Point(22, 49),
  };
}
