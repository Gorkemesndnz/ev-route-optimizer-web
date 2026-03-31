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

function createLiquidGlassPinSvg(types: string[]): string {
  const contentSize = 120; // Room for shadow and large width
  const cx = 60; 
  const cy = 90; // The bottom tip pointing precisely to the location
  
  if (types.length === 0) {
      // Fallback tiny dot for unknown stations
      return [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${contentSize} ${contentSize}" width="${contentSize}" height="${contentSize}">`,
        '<defs>',
        '<filter id="drop-shadow" x="-30%" y="-30%" width="160%" height="160%">',
        '<feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>',
        '</filter>',
        '</defs>',
        `<circle cx="${cx}" cy="${cy}" r="5" fill="#334155" stroke="#ffffff" stroke-width="1.5" filter="url(#drop-shadow)"/>`,
        '</svg>'
      ].join('');
  }

  // Calculate width dynamically
  let w = 40;
  if (types.length === 2) w = 68;
  if (types.length === 3) w = 96;
      
  let strokeColor = '#ffffff';
  if (types.length === 1) {
    if (types[0] === 'AC') strokeColor = '#22c55e'; // Green
    else if (types[0] === 'DC') strokeColor = '#f59e0b'; // Orange
    else if (types[0] === 'HPC') strokeColor = '#ec4899'; // Pink
  }
  
  // Create solid tooltip shape
  const r = 8;
  const h = 26;
  const th = 8;
  const tw = 6;
  const boxBottom = cy - th;
  const boxTop = boxBottom - h;

  const tooltipPath = `
    M ${cx}, ${cy}
    L ${cx + tw}, ${boxBottom}
    L ${cx + w/2 - r}, ${boxBottom}
    Q ${cx + w/2}, ${boxBottom} ${cx + w/2}, ${boxBottom - r}
    L ${cx + w/2}, ${boxTop + r}
    Q ${cx + w/2}, ${boxTop} ${cx + w/2 - r}, ${boxTop}
    L ${cx - w/2 + r}, ${boxTop}
    Q ${cx - w/2}, ${boxTop} ${cx - w/2}, ${boxTop + r}
    L ${cx - w/2}, ${boxBottom - r}
    Q ${cx - w/2}, ${boxBottom} ${cx - w/2 + r}, ${boxBottom}
    L ${cx - tw}, ${boxBottom}
    Z
  `;

  let textSvg = '';
  types.forEach((type, index) => {
    let color = '#ffffff';
    if (type === 'AC') color = '#22c55e';
    if (type === 'DC') color = '#f59e0b';
    if (type === 'HPC') color = '#ec4899';
    
    textSvg += `<tspan fill="${color}">${type}</tspan>`;
    if (index < types.length - 1) {
      textSvg += `<tspan fill="#64748b"> | </tspan>`;
    }
  });

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${contentSize} ${contentSize}" width="${contentSize}" height="${contentSize}">`,
    '<defs>',
    '<filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">',
    '<feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.5"/>',
    '</filter>',
    '</defs>',
    `<path d="${tooltipPath}" fill="#0f172a" stroke="${strokeColor}" stroke-width="2" filter="url(#drop-shadow)" />`,
    `<text x="${cx}" y="${boxTop + h/2 + 4}" font-family="system-ui, sans-serif" font-weight="900" font-size="11px" text-anchor="middle">${textSvg}</text>`,
    '</svg>'
  ].join('');
}

const COMBO_KEYS = [
  [],
  ['AC'],
  ['DC'],
  ['HPC'],
  ['AC', 'DC'],
  ['AC', 'HPC'],
  ['DC', 'HPC'],
  ['AC', 'DC', 'HPC']
];

const PIN_SVGS: Record<string, string> = {};
COMBO_KEYS.forEach(combo => {
  PIN_SVGS[combo.join('_')] = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(createLiquidGlassPinSvg(combo));
});

// SVG Cluster Renderer using Legacy Marker to preserve MapId local styling
class VectorLiquidGlassRenderer implements Renderer {
  render(cluster: Cluster, stats: ClusterStats, map: google.maps.Map): google.maps.Marker {
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

  const sourceRef = useRef<'ocm' | 'google'>('ocm');

  // Initialize Clusterer
  useEffect(() => {
    if (!map) return;
    
    const clusterer = new MarkerClusterer({
      map,
      // radius: 180 çok agresifti, yaklaşıldığında ayrışmayı engelliyordu. 60 doğal bir değer.
      // maxZoom: 13 -> Zoom level 14 ve sonrasında (şehir/mahalle içi) kümelemeyi ŞARTSIZ İPTAL ET. 
      // Mahallede tüm istasyonlar tekil cam pinler olarak parlasın.
      algorithm: new SuperClusterAlgorithm({ radius: 60, maxZoom: 13 }),
      renderer: new VectorLiquidGlassRenderer()
    });
    
    clustererRef.current = clusterer;

    // React StrictMode veya component yeniden mount olduğunda (HMR),
    // eski harita üzerinde kalan "hayalet" (ghost) markerleri ve kümeleri temizle!
    return () => {
      clusterer.clearMarkers(); // Kümelerden temizle
      clusterer.setMap(null); // Haritadan tamamen sök
      
      // Kümelenmemiş tekil marker'ların harita üzerindeki kalıntılarını sök
      Object.values(markersRef.current).forEach(m => m.setMap(null));
      markersRef.current = {};
      
      if (clustererRef.current === clusterer) {
        clustererRef.current = null;
      }
    };
  }, [map]);

  // Handle Viewport changes
  useEffect(() => {
    if (!map) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const loadStations = async () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom() || 6;
      if (!bounds) return;

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      try {
        // AŞAMA 2: Hybrid Archi - Zoom 10 ve üzerindeyken Canlı Google Places API'yi çağır
        const currentSource = zoom >= 10 ? 'google' : 'ocm';
        const endpoint = currentSource === 'google' ? '/stations/google' : '/stations/base';
        
        const sourceChanged = sourceRef.current !== currentSource;
        if (sourceChanged) {
          sourceRef.current = currentSource;
        }

        const url = `${endpoint}?swLat=${sw.lat()}&swLng=${sw.lng()}&neLat=${ne.lat()}&neLng=${ne.lng()}`;
        
        const res = await apiClient(url);
        const data = await res.json();

        if (data.success && data.data) {
          setStations((prev) => {
            // Kaynak değiştiyse (OCM <-> Google geçişi) önceki verileri TEMİZLE!
            const prevMap = sourceChanged ? new Map() : new Map(prev.map((s: any) => [String(s.id), s]));
            
            data.data.forEach((s: any) => {
              prevMap.set(String(s.id), { ...s, isGoogle: currentSource === 'google' });
            });
            return Array.from(prevMap.values());
          });
        }
      } catch (err) {
        console.error('Failed to load stations from Backend/Google', err);
      }
    };

    loadStations();

    const listenerIdle = map.addListener('idle', () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        loadStations();
      }, 500);
    });

    return () => {
      google.maps.event.removeListener(listenerIdle);
      clearTimeout(timeoutId);
    };
  }, [map]);

  // Sync markers with Clusterer
  useEffect(() => {
    if (!clustererRef.current || !map) return;

    // Haritadan silinmesi gereken marker'ları tespit et (Örn: OCM -> Google geçişinde)
    const currentStationIds = new Set(stations.map(s => String(s.id)));
    const markersToRemove: google.maps.Marker[] = [];
    
    Object.keys(markersRef.current).forEach(id => {
      if (!currentStationIds.has(id)) {
        markersToRemove.push(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    if (markersToRemove.length > 0) {
      clustererRef.current.removeMarkers(markersToRemove);
    }

    const newMarkers: google.maps.Marker[] = [];

    stations.forEach((st: any) => {
      // Hatalı/Bozuk verileri (Null Island - Afrika açıkları) filtrele
      if (st.latitude === 0 && st.longitude === 0) return;

      const strId = String(st.id);
      const isGoogle = st.isGoogle === true;

      const types = new Set<string>();

      if (st.connections && Array.isArray(st.connections)) {
        st.connections.forEach((c: any) => {
          if (c.currentType === 'HPC' || c.currentType === 'DC' || c.currentType === 'AC') {
             types.add(c.currentType);
          } else {
             // Fallback for OCM or unmapped
             const t = (c.currentType || c.connectionType || '').toUpperCase();
             const pwr = typeof c.powerKw === 'number' ? c.powerKw : 0;
             if (t.includes('HPC') || t.includes('CHADEMO') || t.includes('TESLA')) types.add('HPC');
             else if (t.includes('DC') || t.includes('CCS') || pwr > 22) types.add('DC');
             else if (t.includes('AC') || t.includes('TYPE') || t.includes('J1772') || t.includes('WALL') || (pwr > 0 && pwr <= 22)) types.add('AC');
          }
        });
      }
      
      const comboArr = Array.from(types).sort();
      const svgKey = comboArr.join('_');
      const iconUrl = isGoogle ? (PIN_SVGS[svgKey] || PIN_SVGS['']) : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

      if (!markersRef.current[strId]) {
        const marker = new google.maps.Marker({
          position: { lat: st.latitude, lng: st.longitude },
          title: isGoogle ? st.title : '',
          visible: true, 
          // OCM istasyonlarının tekil görünümünü engellemek için transparan yapıp tıklanmayı iptal ediyoruz.
          opacity: isGoogle ? 1 : 0,
          clickable: isGoogle,
          icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(120, 120),
            anchor: new google.maps.Point(60, 90)
          }
        });

        markersRef.current[strId] = marker;
        newMarkers.push(marker);
      }
    });

    if (newMarkers.length > 0) {
      clustererRef.current.addMarkers(newMarkers);
    }
  }, [stations, map]);

  return null;
}
