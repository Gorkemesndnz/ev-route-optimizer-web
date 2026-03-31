import { useEffect, useRef, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

import { MarkerClusterer, SuperClusterAlgorithm, type Renderer, type Cluster, type ClusterStats } from '@googlemaps/markerclusterer';
import { apiClient } from '../lib/apiClient';
import { useSettings } from '../contexts/SettingsContext';


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

function createLiquidGlassPinSvg(types: string[], title?: string, isGoogle: boolean = true): { svg: string, width: number } {
  const contentSizeHeight = 120;
  
  if (types.length === 0 && (!isGoogle)) {
      // Fallback tiny dot for unknown stations
      const contentSize = 120;
      return {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${contentSize} ${contentSize}" width="${contentSize}" height="${contentSize}"><defs><filter id="drop-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/></filter></defs><circle cx="60" cy="90" r="5" fill="#334155" stroke="#ffffff" stroke-width="1.5" filter="url(#drop-shadow)"/></svg>`,
        width: contentSize
      };
  }

  // Calculate widths dynamically
  let typesWidth = 10;
  if (types.length === 1) typesWidth = 24;
  if (types.length === 2) typesWidth = 52;
  if (types.length === 3) typesWidth = 80;
      
  const displayTitle = title ? (title.length > 25 ? title.substring(0, 23) + '...' : title) : '';
  // Modern web font char width approx
  const titleWidth = displayTitle ? displayTitle.length * 6.5 : 0; 
  
  const hasBoth = types.length > 0 && displayTitle.length > 0;
  const gap = hasBoth ? 12 : 0;

  let w = typesWidth + titleWidth + gap + 16;
  if (w < 40) w = 40; // minimum width
  
  const contentSizeWidth = w + 60; // Room for shadow & dynamic expansion expansion width
  const cx = contentSizeWidth / 2;
  const cy = 90;

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

  let innerHtml = '';
  // Align text relative to the left of the shape
  const boxLeft = cx - w/2 + 8;
  let currentX = boxLeft;
  
  // If we only have types (not expanded), we can just center them exactly for perfection
  if (!displayTitle && types.length > 0) {
      let typeTextSvg = '';
      types.forEach((type, index) => {
        let color = '#ffffff';
        if (type === 'AC') color = '#22c55e';
        if (type === 'DC') color = '#f59e0b';
        if (type === 'HPC') color = '#ec4899';
        if (type === 'EV') color = '#3b82f6'; // Blue
        
        typeTextSvg += `<tspan fill="${color}">${type}</tspan>`;
        if (index < types.length - 1) {
          typeTextSvg += `<tspan fill="#64748b"> | </tspan>`;
        }
      });
      innerHtml += `<text x="${cx}" y="${boxTop + h/2 + 4.5}" font-family="system-ui, sans-serif" font-weight="900" font-size="11px" text-anchor="middle">${typeTextSvg}</text>`;
  } else {
      if (displayTitle) {
          innerHtml += `<text x="${currentX}" y="${boxTop + h/2 + 4.5}" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="600" font-size="11px">${displayTitle}</text>`;
          currentX += titleWidth + gap;
          
          if (types.length > 0) {
            innerHtml += `<line x1="${currentX - Math.max(gap/2, 4)}" y1="${boxTop + 6}" x2="${currentX - Math.max(gap/2, 4)}" y2="${boxBottom - 6}" stroke="#334155" stroke-width="1.5" />`;
          }
      }

      if (types.length > 0) {
          let typeTextSvg = '';
          types.forEach((type, index) => {
            let color = '#ffffff';
            if (type === 'AC') color = '#22c55e';
            if (type === 'DC') color = '#f59e0b';
            if (type === 'HPC') color = '#ec4899';
            if (type === 'EV') color = '#3b82f6'; // Blue for Generic
            
            typeTextSvg += `<tspan fill="${color}">${type}</tspan>`;
            if (index < types.length - 1) {
              typeTextSvg += `<tspan fill="#64748b"> | </tspan>`;
            }
          });
          innerHtml += `<text x="${currentX}" y="${boxTop + h/2 + 4.5}" font-family="system-ui, sans-serif" font-weight="900" font-size="11px">${typeTextSvg}</text>`;
      }
  }

  let strokeColor = '#ffffff';
  if (types.length === 1) {
    if (types[0] === 'AC') strokeColor = '#22c55e';
    else if (types[0] === 'DC') strokeColor = '#f59e0b';
    else if (types[0] === 'HPC') strokeColor = '#ec4899';
    else if (types[0] === 'EV') strokeColor = '#3b82f6'; // Blue
  } else if (types.length > 1) {
    strokeColor = '#e2e8f0'; // slate-200 for combos
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${contentSizeWidth} ${contentSizeHeight}" width="${contentSizeWidth}" height="${contentSizeHeight}">`,
    '<defs>',
    '<filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">',
    '<feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.5"/>',
    '</filter>',
    '</defs>',
    `<path d="${tooltipPath}" fill="#0f172a" stroke="${strokeColor}" stroke-width="2" filter="url(#drop-shadow)" />`,
    innerHtml,
    '</svg>'
  ].join('');

  return { svg, width: contentSizeWidth };
}

  const COMBO_KEYS = [
    [],
    ['AC'],
    ['DC'],
    ['HPC'],
    ['AC', 'DC'],
    ['AC', 'HPC'],
    ['DC', 'HPC'],
    ['AC', 'DC', 'HPC'],
    ['EV']
  ];

const PIN_SVGS: Record<string, { url: string, width: number }> = {};
COMBO_KEYS.forEach(combo => {
  const result = createLiquidGlassPinSvg(combo);
  PIN_SVGS[combo.join('_')] = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(result.svg),
    width: result.width
  };
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
  const { stationFilters } = useSettings();
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const [stations, setStations] = useState<any[]>([]);

  const sourceRef = useRef<'ocm' | 'google'>('ocm');
  const activeMarkerIdRef = useRef<string | null>(null);

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

    // noDraw=true: önce sessizce tüm eski marker'ları kaldır, sonra yenilerini ekle, 
    // böylece kümeleme motoru (MarkerClusterer) arada boş bir kare çizmez.
    clustererRef.current.clearMarkers(true); // true = noDraw, henüz haritayı güncelleme
    Object.values(markersRef.current).forEach(m => m.setMap(null));
    markersRef.current = {};
    activeMarkerIdRef.current = null; // Filtre/zoom değişiminde açık kalanı temizle

    const newMarkers: google.maps.Marker[] = [];

    stations.forEach((st: any) => {
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
      
      let hasMatch = false;
      if (stationFilters.length === 0) {
        hasMatch = true; // Hiç filtre yoksa tümünü göster
      } else if (types.size === 0) {
        hasMatch = false; // Filtre var ama istasyonda veri yoksa gizle
      } else {
        hasMatch = Array.from(types).some(t => stationFilters.includes(t));
      }

      if (hasMatch) {
        let comboArr = Array.from(types).sort();
        // Eğer boş bir Google istasyonuysa (Google API bağlantı tiplerini döndürememişse)
        if (comboArr.length === 0 && isGoogle) {
           comboArr = ['EV']; // Fallback generic tab
        }

        const svgKey = comboArr.join('_');
        
        let iconUrl = '';
        let iconWidth = 120;
        
        if (isGoogle) {
          const defaultData = PIN_SVGS[svgKey] || PIN_SVGS[''];
          iconUrl = defaultData.url;
          iconWidth = defaultData.width;
        } else {
          iconUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
        }

        const marker = new google.maps.Marker({
          position: { lat: st.latitude, lng: st.longitude },
          title: '', // Native (OS) tooltipi kapat
          visible: true, 
          opacity: isGoogle ? 1 : 0, // OCM ise tekil markerları şeffaf yap
          clickable: isGoogle,
          icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(iconWidth, 120),
            anchor: new google.maps.Point(iconWidth / 2, 90)
          }
        });

        if (isGoogle) {
          // Collapse fonksiyonunu tanımlayıp marker içerisine atıyoruz
          marker.set('collapse', () => {
             marker.setIcon({
                url: iconUrl,
                scaledSize: new google.maps.Size(iconWidth, 120),
                anchor: new google.maps.Point(iconWidth / 2, 90)
             });
             marker.setZIndex(undefined);
          });

          marker.addListener('click', () => {
            // Eğer tıkızlanan marker zaten açıksa, kapat ve çık
            if (activeMarkerIdRef.current === strId) {
                marker.get('collapse')();
                activeMarkerIdRef.current = null;
                return;
            }

            // Başka bir marker açıksa onu kapat
            if (activeMarkerIdRef.current) {
                const prevMarker = markersRef.current[activeMarkerIdRef.current];
                if (prevMarker && typeof prevMarker.get('collapse') === 'function') {
                    prevMarker.get('collapse')();
                }
            }

            // Yeni tıklananı genişlet
            const displayTitle = st.title || 'Şarj İstasyonu';
            const expanded = createLiquidGlassPinSvg(comboArr, displayTitle, true);
            marker.setIcon({
               url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(expanded.svg),
               scaledSize: new google.maps.Size(expanded.width, 120),
               anchor: new google.maps.Point(expanded.width / 2, 90)
            });
            marker.setZIndex(Number(google.maps.Marker.MAX_ZINDEX) + 999);
            
            activeMarkerIdRef.current = strId;
          });
        }

        markersRef.current[strId] = marker;
        newMarkers.push(marker);
      }
    });

    // clearMarkers(true) ile çizim ertelenmişti, şimdi addMarkers() ile tek seferde çiz.
    // Marker yoksa bile boş diziyle çağırarak kümeleme motorunu tetikliyoruz.
    clustererRef.current.addMarkers(newMarkers);
  }, [stations, map, stationFilters]);

  // Haritada scroll, pan, zoom veya click yapıldığında açık olanı kapatıyoruz
  useEffect(() => {
    if (!map) return;
    const hideTooltip = () => {
        if (activeMarkerIdRef.current) {
            const m = markersRef.current[activeMarkerIdRef.current];
            if (m && typeof m.get('collapse') === 'function') m.get('collapse')();
            activeMarkerIdRef.current = null;
        }
    };
    
    map.addListener('dragstart', hideTooltip);
    map.addListener('zoom_changed', hideTooltip);
    map.addListener('click', hideTooltip);
    
    return () => {
      google.maps.event.clearListeners(map, 'dragstart');
      google.maps.event.clearListeners(map, 'zoom_changed');
      google.maps.event.clearListeners(map, 'click');
    };
  }, [map]);

  return null;
}
