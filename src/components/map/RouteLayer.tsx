import { useEffect, useRef, useState, useCallback } from 'react';
import { useMap, useMapsLibrary, Marker } from '@vis.gl/react-google-maps';
import { useRouteContext } from '../../contexts/RouteContext';

export default function RouteLayer() {
  const map = useMap();
  const geometryLib = useMapsLibrary('geometry');
  const routesLib = useMapsLibrary('routes');
  const { routeResult } = useRouteContext();

  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [startCoord, setStartCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [endCoord, setEndCoord] = useState<{ lat: number; lng: number } | null>(null);

  const clearAll = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.setMap(null);
      rendererRef.current = null;
    }
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    setStartCoord(null);
    setEndCoord(null);
  }, []);

  // Polyline decode fallback: kullanılır DirectionsService başarısız olduğunda
  const drawFallbackPolyline = useCallback(
    (path: google.maps.LatLng[]) => {
      if (!map || path.length === 0) return;

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
      map.fitBounds(bounds, { top: 80, bottom: 80, left: 80, right: 500 });

      setStartCoord({ lat: path[0].lat(), lng: path[0].lng() });
      setEndCoord({ lat: path[path.length - 1].lat(), lng: path[path.length - 1].lng() });
    },
    [map]
  );

  useEffect(() => {
    // routesLib yüklenene kadar bekle
    if (!map || !routesLib) return;

    clearAll();
    if (!routeResult) return;

    const legs = routeResult.legs ?? [];
    const firstLeg = legs[0];
    const lastLeg = legs[legs.length - 1];

    const originLat = firstLeg?.from_lat;
    const originLon = firstLeg?.from_lon;
    const destLat = lastLeg?.to_lat;
    const destLon = lastLeg?.to_lon;

    // Koordinat yoksa doğrudan polyline fallback
    if (!originLat || !originLon || !destLat || !destLon) {
      if (!geometryLib) return;
      const path: google.maps.LatLng[] = [];
      if (routeResult.overview_polyline) {
        path.push(...geometryLib.encoding.decodePath(routeResult.overview_polyline));
      } else {
        for (const leg of legs) {
          if (leg.polyline) path.push(...geometryLib.encoding.decodePath(leg.polyline));
        }
      }
      drawFallbackPolyline(path);
      return;
    }

    // Şarj durakları → waypoint (Google max 25)
    const waypoints: google.maps.DirectionsWaypoint[] = (routeResult.charging_stops ?? [])
      .slice(0, 25)
      .map(stop => ({
        location: new google.maps.LatLng(stop.lat, stop.lon),
        stopover: true,
      }));

    const renderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeOpacity: 0.9,
        strokeWeight: 6,
        zIndex: 50,
      },
    });
    renderer.setMap(map);
    rendererRef.current = renderer;

    const service = new google.maps.DirectionsService();

    service.route(
      {
        origin: new google.maps.LatLng(originLat, originLon),
        destination: new google.maps.LatLng(destLat, destLon),
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          renderer.setDirections(result);

          // Tüm bacakları kapsayan bounds
          const bounds = new google.maps.LatLngBounds();
          result.routes[0]?.legs.forEach(leg => {
            bounds.extend(leg.start_location);
            bounds.extend(leg.end_location);
          });
          map.fitBounds(bounds, { top: 80, bottom: 80, left: 80, right: 500 });

          setStartCoord({ lat: originLat, lng: originLon });
          setEndCoord({ lat: destLat, lng: destLon });
        } else {
          // DirectionsService başarısız → sessiz fallback
          console.warn('[RouteLayer] DirectionsService failed:', status, '— polyline decode fallback');
          renderer.setMap(null);
          rendererRef.current = null;

          if (geometryLib) {
            const path: google.maps.LatLng[] = [];
            if (routeResult.overview_polyline) {
              path.push(...geometryLib.encoding.decodePath(routeResult.overview_polyline));
            } else {
              for (const leg of legs) {
                if (leg.polyline) path.push(...geometryLib.encoding.decodePath(leg.polyline));
              }
            }
            drawFallbackPolyline(path);
          }
        }
      }
    );
  }, [map, routesLib, geometryLib, routeResult, clearAll, drawFallbackPolyline]);

  // Unmount cleanup
  useEffect(() => {
    return () => clearAll();
  }, [clearAll]);

  if (!routeResult) return null;

  return (
    <>
      {routeResult.charging_stops?.map((stop, idx) => (
        <Marker
          key={`stop-${idx}`}
          position={{ lat: stop.lat, lng: stop.lon }}
          title={stop.station_name}
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
