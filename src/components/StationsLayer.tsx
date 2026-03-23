import { useEffect, useRef, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { apiClient } from '../lib/apiClient';

export default function StationsLayer() {
  const map = useMap();
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const [stations, setStations] = useState<any[]>([]);

  // Initialize Clusterer
  useEffect(() => {
    if (!map) return;
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({ map });
    }
  }, [map]);

  // Handle Viewport changes
  useEffect(() => {
    if (!map) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const loadStations = async () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      
      if (!bounds || typeof zoom !== 'number') return;

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      
      // Stop fetching if zoomed out too far to prevent overwhelming the API backend
      if (zoom < 6) return; 

      try {
        const res = await apiClient(`/stations/viewport?swLat=${sw.lat()}&swLng=${sw.lng()}&neLat=${ne.lat()}&neLng=${ne.lng()}&zoom=${zoom}`);
        const data = await res.json();
        
        if (data.success && data.data) {
           setStations((prev) => {
             // Merge new stations ensuring uniqueness
             const prevMap = new Map(prev.map(s => [s.id, s]));
             data.data.forEach((s: any) => prevMap.set(s.id, s));
             return Array.from(prevMap.values());
           });
        }
      } catch (err) {
        console.error("Failed to load stations in viewport", err);
      }
    };

    const listener = map.addListener('idle', () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(loadStations, 500); // 500ms debounce
    });

    return () => {
      google.maps.event.removeListener(listener);
      clearTimeout(timeoutId);
    };
  }, [map]);

  // Sync markers with Clusterer
  useEffect(() => {
    if (!clustererRef.current || stations.length === 0) return;

    const newMarkers: google.maps.Marker[] = [];
    
    stations.forEach(st => {
      if (!markersRef.current[st.id]) {
        // Create standard marker
        const marker = new google.maps.Marker({
          position: { lat: st.latitude, lng: st.longitude },
          title: st.title,
          icon: {
             path: google.maps.SymbolPath.CIRCLE,
             fillColor: '#0ea5e9', // Sky blue
             fillOpacity: 0.9,
             strokeWeight: 2,
             strokeColor: '#ffffff',
             scale: 8
          }
        });
        
        marker.addListener('click', () => {
           // Optional: Show info window
           console.log("Clicked station:", st.title);
        });

        markersRef.current[st.id] = marker;
        newMarkers.push(marker);
      }
    });

    if (newMarkers.length > 0) {
      clustererRef.current.addMarkers(newMarkers);
    }
  }, [stations]);

  return null; // This component handles DOM mutations manually
}
