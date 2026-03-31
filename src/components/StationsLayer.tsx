import { useEffect, useRef, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer, SuperClusterAlgorithm, type Renderer, type Cluster, type ClusterStats } from '@googlemaps/markerclusterer';
import { apiClient } from '../lib/apiClient';

function createLiquidGlassClusterSvg(count: number, scale: number): string {
  const r = scale / 2;
  const contentSize = scale + 24; // Extra space for shadow
  const cx = contentSize / 2;
  const cy = contentSize / 2;
  
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${contentSize} ${contentSize}" width="${contentSize}" height="${contentSize}">`,
    '<defs>',
    '<linearGradient id="lg-bg" x1="0%" y1="0%" x2="100%" y2="100%">',
    '<stop offset="0%" stop-color="rgba(255,255,255,0.4)" />',
    '<stop offset="100%" stop-color="rgba(255,255,255,0.1)" />',
    '</linearGradient>',
    '<linearGradient id="lg-border" x1="0%" y1="0%" x2="100%" y2="100%">',
    '<stop offset="0%" stop-color="rgba(255,255,255,0.8)" />',
    '<stop offset="100%" stop-color="rgba(255,255,255,0.2)" />',
    '</linearGradient>',
    '<filter id="lg-shadow" x="-50%" y="-50%" width="200%" height="200%">',
    '<feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.2"/>',
    '</filter>',
    '</defs>',
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lg-bg)" filter="url(#lg-shadow)" />`,
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lg-bg)" stroke="url(#lg-border)" stroke-width="1.5" />`,
    `<text x="${cx}" y="${cy + 1}" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="${scale * 0.38}px" text-anchor="middle" alignment-baseline="central">${count}</text>`,
    '</svg>'
  ].join('');
}

function createLiquidGlassPinSvg(): string {
  const scale = 36;
  const contentSize = scale + 20;
  const r = scale / 2;
  const cx = contentSize / 2;
  const cy = contentSize / 2;
  
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${contentSize} ${contentSize}" width="${contentSize}" height="${contentSize}">`,
    '<defs>',
    '<linearGradient id="lg-bg" x1="0%" y1="0%" x2="100%" y2="100%">',
    '<stop offset="0%" stop-color="rgba(255,255,255,0.4)" />',
    '<stop offset="100%" stop-color="rgba(255,255,255,0.1)" />',
    '</linearGradient>',
    '<linearGradient id="lg-border" x1="0%" y1="0%" x2="100%" y2="100%">',
    '<stop offset="0%" stop-color="rgba(255,255,255,0.8)" />',
    '<stop offset="100%" stop-color="rgba(255,255,255,0.2)" />',
    '</linearGradient>',
    '<filter id="lg-shadow" x="-50%" y="-50%" width="200%" height="200%">',
    '<feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.2"/>',
    '</filter>',
    '<filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">',
    '<feGaussianBlur stdDeviation="3" result="blur" />',
    '<feMerge>',
    '<feMergeNode in="blur" />',
    '<feMergeNode in="SourceGraphic" />',
    '</feMerge>',
    '</filter>',
    '</defs>',
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lg-bg)" filter="url(#lg-shadow)" />`,
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lg-bg)" stroke="url(#lg-border)" stroke-width="1.5" />`,
    `<circle cx="${cx}" cy="${cy}" r="4.5" fill="#22d3ee" filter="url(#neon-glow)" />`,
    '</svg>'
  ].join('');
}

const PIN_SVG_URL = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(createLiquidGlassPinSvg());

// SVG Cluster Renderer using Legacy Marker to preserve MapId local styling
class VectorLiquidGlassRenderer implements Renderer {
  render(cluster: Cluster, stats: ClusterStats, _map: google.maps.Map): google.maps.Marker {
    const count = cluster.count;
    const scale = Math.min(45 + (count / Math.max(stats.clusters.markers.max, 1)) * 15, 65);
    const contentSize = scale + 24;

    const svg = createLiquidGlassClusterSvg(count, scale);

    return new google.maps.Marker({
      position: cluster.position,
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(contentSize, contentSize),
        anchor: new google.maps.Point(contentSize / 2, contentSize / 2),
      },
      title: count + ' İstasyon'
    });
  }
}

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
        renderer: new VectorLiquidGlassRenderer()
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
            scaledSize: new google.maps.Size(56, 56), // ContentSize = 36 + 20
            anchor: new google.maps.Point(28, 28)
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
