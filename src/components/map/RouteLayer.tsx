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
    } else {
      for (const leg of legs) {
        if (leg.polyline) path.push(...geometryLib.encoding.decodePath(leg.polyline));
      }
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
            className: 'mt-8 font-bold drop-shadow-md text-[12px] bg-blue-600/95 px-2.5 py-1 rounded-xl border border-white/20 whitespace-nowrap z-50',
          }}
          icon={{
            url:
              'data:image/svg+xml;charset=UTF-8,' +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#2563eb" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
              ),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 30),
          }}
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
            className: 'mt-8 font-bold drop-shadow-md text-[12px] bg-red-600/95 px-2.5 py-1 rounded-xl border border-white/20 whitespace-nowrap z-50',
          }}
          icon={{
            url:
              'data:image/svg+xml;charset=UTF-8,' +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#dc2626" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>`
              ),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 30),
          }}
          zIndex={100}
        />
      )}
    </>
  );
}
