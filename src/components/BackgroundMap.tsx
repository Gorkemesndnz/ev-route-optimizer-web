import { Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useRef, memo } from 'react';
import StationsLayer from './StationsLayer';
import ZoomIndicator from './ZoomIndicator';

const BackgroundMap = memo(({ 
  userLocation, 
  mapStyle = [],
  showTraffic = true
}: { 
  userLocation: {lat: number, lng: number} | null,
  mapStyle?: google.maps.MapTypeStyle[],
  showTraffic?: boolean
}) => {
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
        defaultCenter={{ lat: 38.9637, lng: 35.2433 }} // Better center for Turkey
        defaultZoom={6}
        minZoom={3}
        maxZoom={20}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        backgroundColor="#09090b" // Match with zinc-950
        styles={mapStyle}
        className="w-full h-full"
      >
        {userLocation && (
          <Marker position={userLocation} />
        )}
        <StationsLayer />
        <ZoomIndicator />
      </Map>
    </div>
  );
});

export default BackgroundMap;
