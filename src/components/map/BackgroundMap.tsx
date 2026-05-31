import { Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useRef, useState, memo } from 'react';
import StationsLayer from './StationsLayer';
import RouteLayer from './RouteLayer';
import { useSettings } from '../../contexts/SettingsContext';
import { useRouteContext } from '../../contexts/RouteContext';

const BackgroundMap = memo(({ 
  userLocation, 
  selectedTouristSpot,
  mapStyle = [],
  showTraffic = true
}: { 
  userLocation: {lat: number, lng: number} | null,
  selectedTouristSpot?: {lat: number, lng: number, name: string} | null,
  mapStyle?: google.maps.MapTypeStyle[],
  showTraffic?: boolean
}) => {
  const map = useMap();
  const { mapStyleKey, showAllStationsInRouteMode } = useSettings();
  const { routeResult } = useRouteContext();
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const [stationLayerError, setStationLayerError] = useState<string | null>(null);

  const handleStationProviderError = useCallback((message: string | null) => {
    setStationLayerError(message);
  }, []);

  useEffect(() => {
    if (map) {
      map.setOptions({ styles: mapStyle });
      map.setMapTypeId(mapStyleKey === 'satellite' ? 'hybrid' : 'roadmap');
    }
  }, [map, mapStyle, mapStyleKey]);

  useEffect(() => {
    if (routeResult && !showAllStationsInRouteMode) {
      setStationLayerError(null);
    }
  }, [routeResult, showAllStationsInRouteMode]);

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
        {(!routeResult && userLocation) && (
          <Marker position={userLocation} />
        )}
        {(!routeResult && selectedTouristSpot) && (
          <Marker 
             position={{lat: selectedTouristSpot.lat, lng: selectedTouristSpot.lng}}
             title={selectedTouristSpot.name}
             label={{
                  text: selectedTouristSpot.name,
                  color: "#ffffff",
                  className: "mt-8 font-bold drop-shadow-md text-[13px] bg-zinc-900/90 px-2.5 py-1 rounded-xl border border-white/20 whitespace-nowrap",
             }}
          />
        )}
        {(!routeResult || showAllStationsInRouteMode) && (
          <StationsLayer onProviderError={handleStationProviderError} />
        )}
        <RouteLayer />
      </Map>
      {stationLayerError && (
        <div
          role="status"
          className="absolute left-4 bottom-6 z-40 max-w-[260px] rounded-lg border border-red-400/30 bg-black/70 px-3 py-2 text-xs font-medium text-red-100 shadow-xl backdrop-blur-md"
        >
          {stationLayerError}
        </div>
      )}
    </div>
  );
});

export default BackgroundMap;
