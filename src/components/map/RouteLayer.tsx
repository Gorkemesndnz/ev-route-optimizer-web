import { useEffect, useRef, useState } from 'react';
import { useMap, useMapsLibrary, Marker } from '@vis.gl/react-google-maps';
import { useRouteContext } from '../../contexts/RouteContext';

export default function RouteLayer() {
  const map = useMap();
  const geometryLib = useMapsLibrary('geometry');
  const { routeResult } = useRouteContext();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  const [startCoord, setStartCoord] = useState<{lat: number, lng: number} | null>(null);
  const [endCoord, setEndCoord] = useState<{lat: number, lng: number} | null>(null);

  // Polyline çizimi
  useEffect(() => {
    console.log("RouteLayer routeResult:", routeResult);
    console.log("RouteLayer map:", !!map, "geometryLib:", !!geometryLib);
    
    if (!map || !geometryLib) return;

    // RouteResult yoksa veya polyline yoksa temizle
    if (!routeResult || (!routeResult.overview_polyline && !routeResult.legs?.length)) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      setStartCoord(null);
      setEndCoord(null);
      return;
    }

    try {
      let path: google.maps.LatLng[] = [];

      // Varsa tüm rotayı temsil eden overview_polyline kullan (daha performanslı)
      if (routeResult.overview_polyline) {
        path = geometryLib.encoding.decodePath(routeResult.overview_polyline);
      } 
      // Yoksa her bacağın (leg) kendi polyline'ını birleştir
      else if (routeResult.legs && routeResult.legs.length > 0) {
        routeResult.legs.forEach(leg => {
          if (leg.polyline) {
            const decoded = geometryLib.encoding.decodePath(leg.polyline);
            path.push(...decoded);
          }
        });
      }

      if (path.length === 0) return;

      if (!polylineRef.current) {
        polylineRef.current = new google.maps.Polyline({
          strokeColor: '#3b82f6', // Mavi
          strokeOpacity: 0.9,
          strokeWeight: 6,
          geodesic: true,
          zIndex: 50 // marker'ların altında ama haritanın üstünde
        });
      }

      polylineRef.current.setPath(path);
      polylineRef.current.setMap(map);

      // Başlangıç ve bitiş koordinatlarını kaydet (ekran marker'ları için)
      if (path.length > 0) {
        const first = path[0];
        const last = path[path.length - 1];
        setStartCoord({ lat: first.lat(), lng: first.lng() });
        setEndCoord({ lat: last.lat(), lng: last.lng() });
      }

      // Haritayı rotaya odakla
      const bounds = new google.maps.LatLngBounds();
      path.forEach(p => bounds.extend(p));
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 400 });

    } catch (e) {
      console.error('Error decoding polyline:', e);
    }

  }, [map, geometryLib, routeResult]);

  // Unmount temizliği
  useEffect(() => {
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, []);

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
             color: "#ffffff",
             className: "mt-8 font-bold drop-shadow-md text-[12px] bg-green-600/95 px-2.5 py-1 rounded-xl border border-white/20 whitespace-nowrap z-50",
          }}
          icon={{
             url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#16a34a" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`),
             scaledSize: new google.maps.Size(32, 32),
             anchor: new google.maps.Point(16, 16)
          }}
          zIndex={100}
        />
      ))}

      {startCoord && (
        <Marker
          position={startCoord}
          title={routeResult.legs?.[0]?.from_location || 'Başlangıç'}
          label={{
             text: "Başlangıç",
             color: "#ffffff",
             className: "mt-8 font-bold drop-shadow-md text-[12px] bg-blue-600/95 px-2.5 py-1 rounded-xl border border-white/20 whitespace-nowrap z-50",
          }}
          icon={{
             url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#2563eb" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`),
             scaledSize: new google.maps.Size(32, 32),
             anchor: new google.maps.Point(16, 30)
          }}
          zIndex={100}
        />
      )}

      {endCoord && (
        <Marker
          position={endCoord}
          title={routeResult.legs?.[routeResult.legs?.length - 1]?.to_location || 'Varış'}
          label={{
             text: "Varış",
             color: "#ffffff",
             className: "mt-8 font-bold drop-shadow-md text-[12px] bg-red-600/95 px-2.5 py-1 rounded-xl border border-white/20 whitespace-nowrap z-50",
          }}
          icon={{
             url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#dc2626" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>`),
             scaledSize: new google.maps.Size(32, 32),
             anchor: new google.maps.Point(16, 30)
          }}
          zIndex={100}
        />
      )}
    </>
  );
}
