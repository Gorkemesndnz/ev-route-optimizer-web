import { useEffect, useRef, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer, SuperClusterAlgorithm, type Renderer, type Cluster, type ClusterStats } from '@googlemaps/markerclusterer';
import { apiClient } from '../lib/apiClient';

// Cam efekti (glassmorphism) ve koyu tema su damlası (Cluster)
function createClusterSvg(count: number, scale: number): string {
  const height = Math.round(scale * 1.3);
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 58" width="' + scale + '" height="' + height + '">',
    '<defs>',
    '<linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">',
    '<stop offset="0%" stop-color="rgba(255,255,255,0.6)" />',
    '<stop offset="100%" stop-color="rgba(255,255,255,0.1)" />',
    '</linearGradient>',
    '<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">',
    '<feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.6"/>',
    '</filter>',
    '</defs>',
    '<path filter="url(#shadow)" fill="rgba(15, 23, 42, 0.85)" stroke="url(#glass)" stroke-width="1.5" ',
    'd="M22,0 C9.85,0 0,9.85 0,22 C0,34.15 22,58 22,58 C22,58 44,34.15 44,22 C44,9.85 34.15,0 22,0 Z" />',
    '<text x="22" y="24" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="600" font-size="14px" text-anchor="middle" alignment-baseline="central">' + count + '</text>',
    '</svg>'
  ].join('');
}

// Cam efekti ve koyu tema su damlası (Tekil Pin)
function createPinSvg(): string {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">',
    '<defs>',
    '<linearGradient id="pinGlass" x1="0%" y1="0%" x2="0%" y2="100%">',
    '<stop offset="0%" stop-color="rgba(255,255,255,0.6)" />',
    '<stop offset="100%" stop-color="rgba(255,255,255,0.1)" />',
    '</linearGradient>',
    '<filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">',
    '<feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.6"/>',
    '</filter>',
    '</defs>',
    '<path filter="url(#pinShadow)" fill="rgba(15, 23, 42, 0.9)" stroke="url(#pinGlass)" stroke-width="1.5" ',
    'd="M12,0 C5.37,0 0,5.37 0,12 C0,18.63 12,32 12,32 C12,32 24,18.63 24,12 C24,5.37 18.63,0 12,0 Z" />',
    '<circle cx="12" cy="11" r="3.5" fill="#22d3ee" />',
    '</svg>'
  ].join('');
}

// Custom, Premium SVG Cluster Renderer (Glassmorphism Su Damlası)
class CustomTeardropRenderer implements Renderer {
  render(cluster: Cluster, stats: ClusterStats, _map: google.maps.Map): google.maps.Marker {
    const count = cluster.count;
    const scale = Math.min(45 + (count / Math.max(stats.clusters.markers.max, 1)) * 15, 60);

    const svg = createClusterSvg(count, scale);
    const height = Math.round(scale * 1.3);

    return new google.maps.Marker({
      position: cluster.position,
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(scale, height),
        anchor: new google.maps.Point(scale / 2, height),
      },
      title: count + ' İstasyon'
    });
  }
}

const PIN_SVG_URL = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(createPinSvg());

export default function StationsLayer() {
  const map = useMap();
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const [stations, setStations] = useState<any[]>([]);

  // Initialize Clusterer
  useEffect(() => {
    if (!map) return;
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({
        map,
        algorithm: new SuperClusterAlgorithm({ radius: 120 }),
        renderer: new CustomTeardropRenderer()
      });
    }
  }, [map]);

  // Handle Viewport changes
  useEffect(() => {
    if (!map) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const loadStations = async () => {
      const bounds = map.getBounds();
      if (!bounds) return;

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      try {
        const url = '/stations/base?swLat=' + sw.lat() + '&swLng=' + sw.lng() + '&neLat=' + ne.lat() + '&neLng=' + ne.lng();
        const res = await apiClient(url);
        const data = await res.json();

        if (data.success && data.data) {
          setStations((prev) => {
            const prevMap = new Map(prev.map((s: any) => [s.id, s]));
            data.data.forEach((s: any) => prevMap.set(s.id, s));
            return Array.from(prevMap.values());
          });
        }
      } catch (err) {
        console.error('Failed to load stations from Base/OCM', err);
      }
    };

    loadStations();

    const listener = map.addListener('idle', () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(loadStations, 500);
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

    stations.forEach((st: any) => {
      if (!markersRef.current[st.id]) {
        const marker = new google.maps.Marker({
          position: { lat: st.latitude, lng: st.longitude },
          title: st.title,
          icon: {
            url: PIN_SVG_URL,
            scaledSize: new google.maps.Size(24, 32),
            anchor: new google.maps.Point(12, 32)
          }
        });

        markersRef.current[st.id] = marker;
        newMarkers.push(marker);
      }
    });

    if (newMarkers.length > 0) {
      clustererRef.current.addMarkers(newMarkers);
    }
  }, [stations]);

  return null;
}
