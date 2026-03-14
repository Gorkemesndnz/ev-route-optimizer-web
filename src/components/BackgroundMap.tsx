import { Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';

export default function BackgroundMap({ 
  userLocation, 
  mapStyle = [],
  showTraffic = true
}: { 
  userLocation: {lat: number, lng: number} | null,
  mapStyle?: google.maps.MapTypeStyle[],
  showTraffic?: boolean
}) {
  const map = useMap();
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (map) {
      map.setOptions({ styles: mapStyle });
    }
  }, [map, mapStyle]);

  useEffect(() => {
    if (!map) return;

    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new google.maps.TrafficLayer();
    }

    if (showTraffic) {
      trafficLayerRef.current.setMap(map);
    } else {
      trafficLayerRef.current.setMap(null);
    }

    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, showTraffic]);

  return (
    <div className="absolute inset-0 z-0">
      <Map
        defaultCenter={{ lat: 39.92077, lng: 32.85411 }} // Ankara default
        defaultZoom={6}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        styles={mapStyle}
        className="w-full h-full"
      >
        {userLocation && (
          <Marker position={userLocation} />
        )}
      </Map>
    </div>
  );
}
