import { Minus, Plus, LocateFixed, Layers, Car } from "lucide-react";
import { useMap } from "@vis.gl/react-google-maps";
import { cn } from "@/lib/utils";
import { translations } from "../lib/translations";
import { memo } from "react";

import { useSettings } from "../contexts/SettingsContext";

const MapControls = memo(({ 
  onLocateUser, 
}: { 
  onLocateUser: (loc: {lat: number, lng: number}) => void,
}) => {
  const { 
    language, 
    mapStyleKey: currentStyle, 
    setMapStyleKey: onStyleChange,
    showTraffic,
    setShowTraffic
  } = useSettings();
  const map = useMap();
  const t = translations[language];

  const onToggleTraffic = () => setShowTraffic(!showTraffic);

  const handleZoomIn = () => {
    if (map) map.setZoom((map.getZoom() || 0) + 1);
  };

  const handleZoomOut = () => {
    if (map) map.setZoom((map.getZoom() || 0) - 1);
  };

  const handleLocateMe = () => {
    if (!map) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.panTo(pos);
          map.setZoom(15);
          onLocateUser(pos);
        },
        () => {
          console.error("Geolocation service failed.");
        }
      );
    }
  };

  const handleToggleLayers = () => {
    const styles: ('default' | 'light' | 'dark' | 'satellite')[] = ['default', 'light', 'dark', 'satellite'];
    const currentIndex = styles.indexOf(currentStyle as any);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % styles.length;
    const nextStyle = styles[nextIndex];
    onStyleChange(nextStyle);
    
    if (map) {
      map.setMapTypeId(nextStyle === 'satellite' ? 'hybrid' : 'roadmap');
    }
  };

  return (
    <div className="absolute bottom-6 right-6 z-40 pointer-events-auto">
      <div className="flex flex-row items-center h-10 px-1 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl gap-0.5">
        <button 
          onClick={handleZoomOut}
          className="w-8 h-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title={t.zoomOut}
        >
          <Minus size={18} />
        </button>
        
        <div className="w-px h-4 bg-white/20 mx-0.5" />
        
        <button 
          onClick={handleZoomIn}
          className="w-8 h-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title={t.zoomIn}
        >
          <Plus size={18} />
        </button>
        
        <div className="w-px h-4 bg-white/20 mx-0.5" />
        
        <button 
          onClick={handleLocateMe}
          className="w-8 h-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title={t.locateMe}
        >
          <LocateFixed size={18} />
        </button>
        
        <div className="w-px h-4 bg-white/20 mx-0.5" />

        <button 
          onClick={onToggleTraffic}
          className={cn(
            "h-8 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center min-w-[38px]",
            showTraffic ? "text-cyan-400 bg-cyan-400/10" : "text-white/80 hover:text-white hover:bg-white/10"
          )}
          title={t.showTraffic}
        >
          <Car size={18} />
        </button>
      </div>
    </div>
  );
});

export default MapControls;
