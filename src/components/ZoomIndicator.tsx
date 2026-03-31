import { useEffect, useState } from 'react';
import { useMap, MapControl, ControlPosition } from '@vis.gl/react-google-maps';

export default function ZoomIndicator() {
  const map = useMap();
  const [zoom, setZoom] = useState(map?.getZoom() || 0);

  useEffect(() => {
    if (!map) return;

    // İlk yüklendiğinde mevcut zoom değerini ayarla
    setZoom(map.getZoom() || 0);

    // 'zoom_changed' event'ini dinleyerek her zoom yapıldığında değeri güncelle
    const listener = map.addListener('zoom_changed', () => {
      // Küsuratlı sayıları yuvarlayarak tam sayı al
      setZoom(Math.round(map.getZoom() || 0)); 
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map]);

  if (!map) return null;

  return (
    <MapControl position={ControlPosition.BOTTOM_LEFT}>
      <div className="bg-black/80 text-cyan-400 px-3 py-1.5 rounded-xl border border-white/10 font-mono text-[13px] shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-none transition-all duration-300 ml-4 mb-8">
        <span className="opacity-70">🔍 Zoom:</span> 
        <span className="font-bold">{zoom}</span>
      </div>
    </MapControl>
  );
}
