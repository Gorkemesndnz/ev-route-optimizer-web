import { useEffect, useRef, useState } from 'react';
import { useMap, useMapsLibrary, Marker } from '@vis.gl/react-google-maps';
import { useRouteContext } from '../../contexts/RouteContext';

export default function RouteLayer() {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const geometryLib = useMapsLibrary('geometry');
  const { routeResult } = useRouteContext();
  
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);

  const [startCoord, setStartCoord] = useState<{lat: number, lng: number} | null>(null);
  const [endCoord, setEndCoord] = useState<{lat: number, lng: number} | null>(null);

  // Directions Service ve Renderer İlklemesi
  useEffect(() => {
    if (!routesLib || !map) return;
    if (!directionsService.current) {
      directionsService.current = new routesLib.DirectionsService();
    }
    if (!directionsRenderer.current) {
      directionsRenderer.current = new routesLib.DirectionsRenderer({
        suppressMarkers: true, // Kendi marker'larımızı koyacağız
        preserveViewport: true, // Biz kendimiz fitBounds yapacağız offset'li
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeOpacity: 0.9,
          strokeWeight: 6,
          zIndex: 50
        }
      });
    }
    // Haritaya set etmeyi garanti altına al
    directionsRenderer.current.setMap(map);
  }, [routesLib, map]);

  // Rota çizimi (Directions API kullanarak yollara oturtma)
  useEffect(() => {
    if (!map || !routesLib || !geometryLib || !directionsService.current || !directionsRenderer.current) return;

    if (!routeResult || (!routeResult.overview_polyline && (!routeResult.legs || routeResult.legs.length === 0))) {
      directionsRenderer.current.setDirections(null);
      setStartCoord(null);
      setEndCoord(null);
      return;
    }

    try {
      // Başlangıç ve Bitiş koordinatlarını polyline şifresinden çöz (Backend RouteLegDto'da TypeScript olarak eksik olduğu için)
      let originCoord = { lat: 0, lng: 0 };
      let destCoord = { lat: 0, lng: 0 };
      
      let path: google.maps.LatLng[] = [];
      if (routeResult.overview_polyline) {
        path = geometryLib.encoding.decodePath(routeResult.overview_polyline);
      } else if (routeResult.legs && routeResult.legs.length > 0) {
        routeResult.legs.forEach((leg: any) => {
          if (leg.polyline) path.push(...geometryLib.encoding.decodePath(leg.polyline));
        });
      }

      if (path.length > 0) {
        const first = path[0];
        const last = path[path.length - 1];
        originCoord = { lat: first.lat(), lng: first.lng() };
        destCoord = { lat: last.lat(), lng: last.lng() };
      } else {
        return; // Geçerli bir rota yok
      }
      
      setStartCoord(originCoord);
      setEndCoord(destCoord);

      // Şarj İstasyonları ve Waypoint'ler (Ara duraklar)
      const waypoints = [];
      
      // Varsa kullanıcının manuel eklediği waypoint'ler (örn: şehirler)
      if ((routeResult as any).via_waypoints && (routeResult as any).via_waypoints.length > 0) {
        (routeResult as any).via_waypoints.forEach((wp: any) => {
           waypoints.push({ location: { lat: wp.lat, lng: wp.lon }, stopover: true });
        });
      }

      // Ayrıca şarj durakları
      if (routeResult.charging_stops && routeResult.charging_stops.length > 0) {
        routeResult.charging_stops.forEach(stop => {
           waypoints.push({ location: { lat: stop.lat, lng: stop.lon }, stopover: true });
        });
      }

      // Google Directions API'den yola oturtulmuş (snapped to road) rotayı iste
      directionsService.current.route({
        origin: originCoord,
        destination: destCoord,
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING
      }, (response, status) => {
        if (status === 'OK' && response) {
          directionsRenderer.current?.setDirections(response);
          
          // Haritayı özel padding ile odaklar
          const bounds = new google.maps.LatLngBounds();
          const routePath = response.routes[0].overview_path;
          routePath.forEach(p => bounds.extend(p));
          map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 450 });
        } else {
          console.error('Directions request failed:', status);
        }
      });
    } catch (e) {
      console.error('Error rendering directions:', e);
    }
  }, [map, routesLib, routeResult]);

  // Unmount temizliği
  useEffect(() => {
    return () => {
      if (directionsRenderer.current) {
        directionsRenderer.current.setMap(null);
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
