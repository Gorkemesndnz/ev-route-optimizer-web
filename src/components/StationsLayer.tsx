import { useEffect, useRef, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer, type Renderer, type Cluster, type ClusterStats } from '@googlemaps/markerclusterer';
import { apiClient } from '../lib/apiClient';

// Teardrop SVG üreten yardımcı fonksiyon (Cluster için)
function createClusterSvg(count: number, scale: number, color: string, fontSize: number): string {
  const height = Math.round(scale * 1.2);
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 56" width="' + scale + '" height="' + height + '">',
    '<defs>',
    '<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">',
    '<feGaussianBlur stdDeviation="3" result="blur"/>',
    '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>',
    '</filter>',
    '</defs>',
    '<path filter="url(#glow)" fill="' + color + '" fill-opacity="0.9" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" ',
    'd="M22,0 C9.85,0 0,9.85 0,22 C0,34.15 22,56 22,56 C22,56 44,34.15 44,22 C44,9.85 34.15,0 22,0 Z" />',
    '<text x="22" y="26" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="' + fontSize + 'px" text-anchor="middle" alignment-baseline="central">' + count + '</text>',
    '</svg>'
  ].join('');
}

// Teardrop SVG üreten yardımcı fonksiyon (Tekil pin için)
function createPinSvg(): string {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" width="24" height="30">',
    '<path fill="#0ea5e9" stroke="#ffffff" stroke-width="2" d="M12,0 C5.37,0 0,5.37 0,12 C0,18.63 12,30 12,30 C12,30 24,18.63 24,12 C24,5.37 18.63,0 12,0 Z" />',
    '<circle cx="12" cy="12" r="4" fill="#ffffff" />',
    '</svg>'
  ].join('');
}

// Custom, Premium SVG Cluster Renderer (Su Damlası)
class CustomTeardropRenderer implements Renderer {
  render(cluster: Cluster, stats: ClusterStats, _map: google.maps.Map): google.maps.Marker {
    const count = cluster.count;
    const scale = Math.min(40 + (count / Math.max(stats.clusters.markers.max, 1)) * 20, 60);

    let color = '#38bdf8'; // sky-400
    if (count > 500) color = '#0284c7'; // sky-600
    else if (count > 100) color = '#0ea5e9'; // sky-500
    else if (count > 20) color = '#22d3ee'; // cyan-400

    const fontSize = count > 999 ? 12 : 14;
    const svg = createClusterSvg(count, scale, color, fontSize);
    const height = Math.round(scale * 1.2);

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
            scaledSize: new google.maps.Size(24, 30),
            anchor: new google.maps.Point(12, 30)
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
