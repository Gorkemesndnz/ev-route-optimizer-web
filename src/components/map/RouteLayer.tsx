import { useEffect, useRef, useState, useCallback } from 'react';
import { useMap, useMapsLibrary, Marker } from '@vis.gl/react-google-maps';
import { useRouteContext } from '../../contexts/RouteContext';
import { useStation, type StationData } from '../../contexts/StationContext';
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

type EndpointMarkerKind = 'start' | 'end';

function createEndpointMarkerIcon(kind: EndpointMarkerKind): google.maps.Icon {
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

export default function RouteLayer() {
  const map = useMap();
  const geometryLib = useMapsLibrary('geometry');
  const { routeResult, routeLocations } = useRouteContext();
  const { setSelectedStation } = useStation();

  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [startCoord, setStartCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [endCoord, setEndCoord] = useState<{ lat: number; lng: number } | null>(null);

  const clearAll = useCallback(() => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    setStartCoord(null);
    setEndCoord(null);
  }, []);

  useEffect(() => {
    // geometry lib yüklenene kadar bekle
    if (!map || !geometryLib) return;

    clearAll();
    if (!routeResult) return;

    const legs = routeResult.legs ?? [];

    // Backend'in polyline'ı tüm kullanıcı duraklarını ve şarj duraklarını kapsar.
    // DirectionsService client-side tekrar yönlendirme yaparsa kullanıcı durakları
    // düşer — bu nedenle doğrudan backend polyline'ını decode edip çiziyoruz.
    const path: google.maps.LatLng[] = [];
    if (routeResult.overview_polyline) {
      path.push(...geometryLib.encoding.decodePath(routeResult.overview_polyline));
    }

    if (path.length === 0) return;

    polylineRef.current = new google.maps.Polyline({
      path,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.9,
      strokeWeight: 6,
      zIndex: 50,
      map,
    });

    const bounds = new google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));

    // Sol panel (RouteResultPanel) w-[420px] + container gap ≈ 500px.
    // Sağda biraz nefes payı, üst/alt için yeterli marj.
    // Not: önceki "currentZoom >= targetZoom ise panToBounds" heuristic'i
    // ikinci/üçüncü rota planlandığında bounds viewport'a sığıyorsa hiçbir
    // şey yapmıyordu. Tek bir fitBounds çağrısı her durumda doğru sonucu verir.
    map.fitBounds(bounds, { top: 100, bottom: 100, left: 500, right: 80 });

    const firstLeg = legs[0];
    const lastLeg = legs[legs.length - 1];
    setStartCoord(
      firstLeg?.from_lat != null && firstLeg?.from_lon != null
        ? { lat: firstLeg.from_lat, lng: firstLeg.from_lon }
        : { lat: path[0].lat(), lng: path[0].lng() }
    );
    setEndCoord(
      lastLeg?.to_lat != null && lastLeg?.to_lon != null
        ? { lat: lastLeg.to_lat, lng: lastLeg.to_lon }
        : { lat: path[path.length - 1].lat(), lng: path[path.length - 1].lng() }
    );
  }, [map, geometryLib, routeResult, clearAll]);

  // Unmount cleanup
  useEffect(() => {
    return () => clearAll();
  }, [clearAll]);

  if (!routeResult) return null;

  // Kullanıcı tarafından sidebar'da eklenen ara duraklar (origin/destination hariç)
  const userWaypoints = (routeLocations ?? []).slice(1, -1);

  return (
    <>
      {userWaypoints.map((wp, idx) => (
        wp.coords ? (
          <Marker
            key={`user-wp-${wp.id}`}
            position={{ lat: wp.coords.lat, lng: wp.coords.lng }}
            title={wp.value || `Durak ${idx + 1}`}
            label={{
              text: `${idx + 1}. Durak`,
              color: '#ffffff',
              className: 'mt-8 font-bold drop-shadow-md text-[12px] bg-amber-500/95 px-2.5 py-1 rounded-xl border border-white/20 whitespace-nowrap z-50',
            }}
            icon={{
              url:
                'data:image/svg+xml;charset=UTF-8,' +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#f59e0b" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="bold" fill="white" stroke="none">${idx + 1}</text></svg>`
                ),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16),
            }}
            zIndex={95}
          />
        ) : null
      ))}

      {routeResult.charging_stops?.map((stop, idx) => (
        <Marker
          key={`stop-${idx}`}
          position={{ lat: stop.lat, lng: stop.lon }}
          title={stop.station_name}
          onClick={() => setSelectedStation(routeStopToStationData(stop, idx))}
          label={{
            text: `${stop.station_name} ↓%${Math.round(stop.arrival_soc)} ↑%${Math.round(stop.departure_soc)}`,
            color: '#ffffff',
            className: 'mt-8 font-bold drop-shadow-md text-[12px] bg-green-600/95 px-2.5 py-1 rounded-xl border border-white/20 whitespace-nowrap z-50',
          }}
          icon={{
            url:
              'data:image/svg+xml;charset=UTF-8,' +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#16a34a" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`
              ),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16),
          }}
          zIndex={100}
        />
      ))}

      {startCoord && (
        <Marker
          position={startCoord}
          title={routeResult.legs?.[0]?.from_location || 'Başlangıç'}
          label={{
            text: 'Başlangıç',
            color: '#ffffff',
            className: 'mt-10 font-semibold drop-shadow-md text-[12px] bg-zinc-950/90 px-2.5 py-1 rounded-lg border border-emerald-300/45 whitespace-nowrap z-50',
          }}
          icon={createEndpointMarkerIcon('start')}
          zIndex={100}
        />
      )}

      {endCoord && (
        <Marker
          position={endCoord}
          title={routeResult.legs?.[routeResult.legs.length - 1]?.to_location || 'Varış'}
          label={{
            text: 'Varış',
            color: '#ffffff',
            className: 'mt-10 font-semibold drop-shadow-md text-[12px] bg-zinc-950/90 px-2.5 py-1 rounded-lg border border-rose-300/45 whitespace-nowrap z-50',
          }}
          icon={createEndpointMarkerIcon('end')}
          zIndex={100}
        />
      )}
    </>
  );
}
