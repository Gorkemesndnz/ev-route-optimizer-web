import { useEffect, useRef, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import Supercluster from 'supercluster';
import { stationApi } from '../../api/stationApi';
import type { BaseStationDto, ChargingStationDto } from '../../types/api/station';
import { useSettings } from '../../contexts/SettingsContext';
import { useStation } from '../../contexts/StationContext';
import { createLiquidGlassPinSvg, extractTypes, getProviderErrorMessage, PIN_SVGS } from './stationsLayerHelpers';

// ─── Types ──────────────────────────────────────────────────────────────────────

type OcmStation = BaseStationDto;
type GoogleStation = ChargingStationDto;

interface ClusterHitArea {
  x: number;
  y: number;
  r: number;
  clusterId: number;
  lat: number;
  lng: number;
  count: number;
}

// ─── Canvas Cluster Overlay ─────────────────────────────────────────────────────
// Tek bir Canvas katmanında tüm küme baloncuklarını çizer.
// DOM element sayısı: 0 (vs. eski yaklaşımda ~50-100 google.maps.Marker)

function createClusterCanvasOverlay(
  map: google.maps.Map,
  supercluster: Supercluster
) {
  class ClusterCanvas extends google.maps.OverlayView {
    private canvas: HTMLCanvasElement | null = null;
    private _hitAreas: ClusterHitArea[] = [];

    onAdd() {
      this.canvas = document.createElement('canvas');
      this.canvas.style.position = 'absolute';
      this.canvas.style.pointerEvents = 'none'; // Harita etkileşimini engellemez
      const panes = this.getPanes();
      panes?.overlayLayer.appendChild(this.canvas);
    }

    draw() {
      if (!this.canvas) return;
      const projection = this.getProjection();
      const mapObj = this.getMap() as google.maps.Map;
      if (!projection || !mapObj) return;

      const bounds = mapObj.getBounds();
      const zoom = mapObj.getZoom();
      if (!bounds || zoom == null) return;

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const swPx = projection.fromLatLngToDivPixel(sw);
      const nePx = projection.fromLatLngToDivPixel(ne);
      if (!swPx || !nePx) return;

      const width = Math.abs(nePx.x - swPx.x);
      const height = Math.abs(swPx.y - nePx.y);
      const left = Math.min(swPx.x, nePx.x);
      const top = Math.min(swPx.y, nePx.y);

      const dpr = window.devicePixelRatio || 1;
      this.canvas.style.left = left + 'px';
      this.canvas.style.top = top + 'px';
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
      this.canvas.width = Math.ceil(width * dpr);
      this.canvas.height = Math.ceil(height * dpr);

      const ctx = this.canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // SuperCluster — kümeleri hesapla
      const clusters = supercluster.getClusters(
        [sw.lng(), sw.lat(), ne.lng(), ne.lat()],
        Math.floor(zoom)
      );

      this._hitAreas = [];

      let maxCount = 1;
      for (const c of clusters) {
        if (c.properties.cluster) {
          const cnt = c.properties.point_count || 1;
          if (cnt > maxCount) maxCount = cnt;
        }
      }

      for (const cluster of clusters) {
        if (!cluster.properties.cluster) continue;

        const [lng, lat] = cluster.geometry.coordinates;
        const point = projection.fromLatLngToDivPixel(
          new google.maps.LatLng(lat, lng)
        );
        if (!point) continue;

        const x = point.x - left;
        const y = point.y - top;

        const count = cluster.properties.point_count || 0;
        const scale = Math.min(45 + (count / maxCount) * 15, 65);
        const r = scale / 2;

        // ── Gölge ──
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(160, 175, 200, 0.3)';
        ctx.fill();
        ctx.restore();

        // ── Cam arka plan ──
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 210, 230, 0.28)';
        ctx.fill();

        // ── Kenar çizgisi ──
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // ── Üst ışık yansıması (glassmorphism) ──
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.clip();
        const grad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.restore();

        // ── Sayı metni ──
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 ${scale * 0.38}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.fillText(String(count), x, y + 1);
        ctx.restore();

        // Hit-test alanı kaydet
        this._hitAreas.push({
          x, y, r,
          clusterId: cluster.properties.cluster_id as number,
          lat, lng, count
        });
      }
    }

    /** Verilen LatLng'de bir küme var mı? */
    getClusterAt(latLng: google.maps.LatLng): ClusterHitArea | null {
      const projection = this.getProjection();
      if (!projection) return null;

      const mapObj = this.getMap() as google.maps.Map;
      const bounds = mapObj?.getBounds();
      if (!bounds) return null;

      const swPx = projection.fromLatLngToDivPixel(bounds.getSouthWest());
      const nePx = projection.fromLatLngToDivPixel(bounds.getNorthEast());
      if (!swPx || !nePx) return null;

      const left = Math.min(swPx.x, nePx.x);
      const top = Math.min(swPx.y, nePx.y);

      const px = projection.fromLatLngToDivPixel(latLng);
      if (!px) return null;

      const clickX = px.x - left;
      const clickY = px.y - top;

      for (const area of this._hitAreas) {
        const dx = clickX - area.x;
        const dy = clickY - area.y;
        if (dx * dx + dy * dy <= area.r * area.r) {
          return area;
        }
      }
      return null;
    }

    onRemove() {
      if (this.canvas) {
        this.canvas.parentNode?.removeChild(this.canvas);
        this.canvas = null;
      }
      this._hitAreas = [];
    }

    destroy() {
      this.setMap(null);
    }
  }

  const overlay = new ClusterCanvas();
  overlay.setMap(map);
  return overlay;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function StationsLayer({
  onProviderError,
}: {
  onProviderError?: (message: string | null) => void;
}) {
  const map = useMap();
  const { stationFilters } = useSettings();
  const { setSelectedStation } = useStation();

  const [ocmStations, setOcmStations] = useState<OcmStation[]>([]);
  const [googleStations, setGoogleStations] = useState<GoogleStation[]>([]);

  const superclusterRef = useRef<Supercluster | null>(null);
  const canvasOverlayRef = useRef<ReturnType<typeof createClusterCanvasOverlay> | null>(null);
  const googleMarkersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const activeMarkerIdRef = useRef<string | null>(null);
  const sourceRef = useRef<'ocm' | 'google'>('ocm');
  const abortRef = useRef<AbortController | null>(null);

  // Son fetch edilen geniş bounds — küçük pan'larda yeniden API çağrısı yapma
  const lastFetchedBoundsRef = useRef<{ sw: { lat: number, lng: number }, ne: { lat: number, lng: number }, zoom: number } | null>(null);

  // ─── Initialize SuperCluster ──────────────────────────────────────────────────

  useEffect(() => {
    superclusterRef.current = new Supercluster({
      radius: 80,
      maxZoom: 14,
      minPoints: 2,
    });
    return () => { superclusterRef.current = null; };
  }, []);

  // ─── Single Idle Listener: Load Data ──────────────────────────────────────────

  useEffect(() => {
    if (!map) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    /** Viewport mevcut fetched bounds içinde mi? */
    const isWithinFetchedBounds = (sw: google.maps.LatLng, ne: google.maps.LatLng, zoom: number): boolean => {
      const last = lastFetchedBoundsRef.current;
      if (!last) return false;
      if (Math.floor(zoom) !== last.zoom) return false; // Zoom değiştiyse yeniden fetch
      return (
        sw.lat() >= last.sw.lat &&
        sw.lng() >= last.sw.lng &&
        ne.lat() <= last.ne.lat &&
        ne.lng() <= last.ne.lng
      );
    };

    const loadStations = async () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom() || 6;
      if (!bounds) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const currentSource = zoom >= 10 ? 'google' : 'ocm';
      const sourceChanged = sourceRef.current !== currentSource;
      if (sourceChanged) sourceRef.current = currentSource;

      try {
        if (currentSource === 'ocm') {
          // ── OCM: Akıllı Fetch — küçük pan'larda yeniden çekme ──
          if (!sourceChanged && isWithinFetchedBounds(sw, ne, zoom)) return;

          // Viewport'u %35 genişlet → küçük pan'larda yeniden fetch gerekmez
          const latPad = (ne.lat() - sw.lat()) * 0.35;
          const lngPad = (ne.lng() - sw.lng()) * 0.35;
          const padSw = { lat: sw.lat() - latPad, lng: sw.lng() - lngPad };
          const padNe = { lat: ne.lat() + latPad, lng: ne.lng() + lngPad };

          const stations = await stationApi.getBase({
            swLat: padSw.lat, swLng: padSw.lng,
            neLat: padNe.lat, neLng: padNe.lng,
            zoom,
          }, {
            signal: controller.signal,
          });
          if (controller.signal.aborted) return;
          onProviderError?.(null);
          lastFetchedBoundsRef.current = { sw: padSw, ne: padNe, zoom: Math.floor(zoom) };
          setOcmStations(stations);
          if (sourceChanged) setGoogleStations([]);
        } else {
          // ── Google: Normal viewport fetch ──
          const stations = await stationApi.getGoogle({
            swLat: sw.lat(), swLng: sw.lng(),
            neLat: ne.lat(), neLng: ne.lng(),
          }, {
            signal: controller.signal,
          });
          if (controller.signal.aborted) return;
          onProviderError?.(null);
          lastFetchedBoundsRef.current = null;
          setGoogleStations(stations);
          if (sourceChanged) setOcmStations([]);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Failed to load stations', err);
        onProviderError?.(getProviderErrorMessage(err));
      }
    };

    loadStations();

    const listenerIdle = map.addListener('idle', () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(loadStations, 800);
    });

    return () => {
      google.maps.event.removeListener(listenerIdle);
      clearTimeout(timeoutId);
      abortRef.current?.abort();
    };
  }, [map, onProviderError]);

  // ─── Canvas Overlay: OCM clusters ─────────────────────────────────────────────

  useEffect(() => {
    if (!map || !superclusterRef.current) return;

    // Eski overlay'i yok et
    canvasOverlayRef.current?.destroy();
    canvasOverlayRef.current = null;

    if (ocmStations.length === 0) return;

    // GeoJSON noktalarına dönüştür (DOM operasyonu YOK)
    const points: Supercluster.PointFeature<{ id: string }>[] = ocmStations
      .filter(s => s.latitude !== 0 || s.longitude !== 0)
      .map(s => ({
        type: 'Feature' as const,
        properties: { id: String(s.id) },
        geometry: {
          type: 'Point' as const,
          coordinates: [s.longitude, s.latitude]
        }
      }));

    superclusterRef.current.load(points);

    // Canvas overlay oluştur — 0 DOM element ile kümeleme
    canvasOverlayRef.current = createClusterCanvasOverlay(map, superclusterRef.current);

    return () => {
      canvasOverlayRef.current?.destroy();
      canvasOverlayRef.current = null;
    };
  }, [ocmStations, map]);

  // ─── Cluster Click + Cursor: Map event listeners ──────────────────────────────

  useEffect(() => {
    if (!map) return;

    // Küme baloncuğuna tıklayınca zoom in
    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || !canvasOverlayRef.current || !superclusterRef.current) return;

      const hit = canvasOverlayRef.current.getClusterAt(e.latLng);
      if (hit) {
        const expansionZoom = superclusterRef.current.getClusterExpansionZoom(hit.clusterId);
        if (expansionZoom != null) {
          map.setZoom(Math.min(expansionZoom, 20));
          map.panTo({ lat: hit.lat, lng: hit.lng });
        }
      }
    });

    // Küme üstünde imleç → pointer
    const moveListener = map.addListener('mousemove', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || !canvasOverlayRef.current) return;
      const hit = canvasOverlayRef.current.getClusterAt(e.latLng);
      map.setOptions({ draggableCursor: hit ? 'pointer' : '' });
    });

    return () => {
      google.maps.event.removeListener(clickListener);
      google.maps.event.removeListener(moveListener);
    };
  }, [map]);

  // ─── Google Pins: Diff-Based Marker Sync ─────────────────────────────────────

  useEffect(() => {
    if (!map) return;

    const currentIds = new Set<string>();

    googleStations.forEach((st) => {
      if (st.latitude === 0 && st.longitude === 0) return;

      const strId = String(st.id);
      const types = extractTypes(st.connections);

      let hasMatch = false;
      if (stationFilters.length === 0) {
        hasMatch = true;
      } else if (types.length === 0) {
        hasMatch = stationFilters.includes('EV') || stationFilters.length === 0;
      } else {
        hasMatch = types.some(t => stationFilters.includes(t));
      }

      if (!hasMatch) return;
      currentIds.add(strId);

      if (googleMarkersRef.current[strId]) return;

      let comboArr = types;
      if (comboArr.length === 0) comboArr = ['EV'];

      const svgKey = comboArr.join('_');
      const defaultData = PIN_SVGS[svgKey] || PIN_SVGS['EV'];
      const iconUrl = defaultData.url;
      const iconWidth = defaultData.width;

      const marker = new google.maps.Marker({
        position: { lat: st.latitude, lng: st.longitude },
        map,
        title: '',
        visible: true,
        clickable: true,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(iconWidth, 120),
          anchor: new google.maps.Point(iconWidth / 2, 90)
        }
      });

      marker.set('collapse', () => {
        marker.setIcon({
          url: iconUrl,
          scaledSize: new google.maps.Size(iconWidth, 120),
          anchor: new google.maps.Point(iconWidth / 2, 90)
        });
        marker.setZIndex(undefined);
      });

      marker.addListener('click', () => {
        if (activeMarkerIdRef.current === strId) {
          marker.get('collapse')();
          activeMarkerIdRef.current = null;
          setSelectedStation(null);
          return;
        }

        if (activeMarkerIdRef.current) {
          const prevMarker = googleMarkersRef.current[activeMarkerIdRef.current];
          if (prevMarker && typeof prevMarker.get('collapse') === 'function') {
            prevMarker.get('collapse')();
          }
        }

        const displayTitle = st.title || 'Şarj İstasyonu';
        const expanded = createLiquidGlassPinSvg(comboArr, displayTitle, true);
        marker.setIcon({
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(expanded.svg),
          scaledSize: new google.maps.Size(expanded.width, 120),
          anchor: new google.maps.Point(expanded.width / 2, 90)
        });
        marker.setZIndex(Number(google.maps.Marker.MAX_ZINDEX) + 999);

        activeMarkerIdRef.current = strId;
        setSelectedStation({ ...st, id: strId, title: st.title || '' });

        if (map) {
          map.panTo({ lat: st.latitude, lng: st.longitude });
          if (map.getZoom()! < 14) {
            map.setZoom(14);
          }
        }
      });

      googleMarkersRef.current[strId] = marker;
    });

    Object.keys(googleMarkersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        googleMarkersRef.current[id].setMap(null);
        delete googleMarkersRef.current[id];
      }
    });

    if (activeMarkerIdRef.current && !googleMarkersRef.current[activeMarkerIdRef.current]) {
      activeMarkerIdRef.current = null;
    }
  }, [googleStations, map, stationFilters, setSelectedStation]);

  // ─── Collapse active marker on drag/zoom/click ────────────────────────────────

  useEffect(() => {
    if (!map) return;
    const hideTooltip = () => {
      if (activeMarkerIdRef.current) {
        const m = googleMarkersRef.current[activeMarkerIdRef.current];
        if (m && typeof m.get('collapse') === 'function') m.get('collapse')();
        activeMarkerIdRef.current = null;
      }
    };
    
    const l1 = map.addListener('dragstart', hideTooltip);
    const l2 = map.addListener('zoom_changed', hideTooltip);
    
    return () => {
      google.maps.event.removeListener(l1);
      google.maps.event.removeListener(l2);
    };
  }, [map]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      canvasOverlayRef.current?.destroy();
      canvasOverlayRef.current = null;
      Object.values(googleMarkersRef.current).forEach(m => m.setMap(null));
      googleMarkersRef.current = {};
    };
  }, []);

  return null;
}
