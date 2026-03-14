import { Minus, Plus, LocateFixed, Layers, Car } from "lucide-react";
import { useMap } from "@vis.gl/react-google-maps";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function MapControls({ 
  onLocateUser, 
  onStyleChange,
  currentStyle,
  showTraffic,
  onToggleTraffic
}: { 
  onLocateUser: (loc: {lat: number, lng: number}) => void,
  onStyleChange: (style: 'default' | 'light' | 'dark' | 'satellite') => void,
  currentStyle: 'default' | 'light' | 'dark' | 'satellite',
  showTraffic: boolean,
  onToggleTraffic: () => void
}) {
  const map = useMap();

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
    const currentIndex = styles.indexOf(currentStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    onStyleChange(styles[nextIndex]);
    
    if (map) {
      map.setMapTypeId(styles[nextIndex] === 'satellite' ? 'hybrid' : 'roadmap');
    }
  };

  return (
    <div className="absolute bottom-6 right-6 z-40 pointer-events-auto">
      <div className="flex flex-row items-center bg-black/60 backdrop-blur-2xl border border-white/20 rounded-xl p-1 shadow-xl gap-0.5">
        <button 
          onClick={handleZoomOut}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title="Zoom Out"
        >
          <Minus size={18} />
        </button>
        
        <div className="w-px h-4 bg-white/20 mx-0.5" />
        
        <button 
          onClick={handleZoomIn}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title="Zoom In"
        >
          <Plus size={18} />
        </button>
        
        <div className="w-px h-4 bg-white/20 mx-0.5" />
        
        <button 
          onClick={handleLocateMe}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title="Locate Me"
        >
          <LocateFixed size={18} />
        </button>
        
        <div className="w-px h-4 bg-white/20 mx-0.5" />

        <button 
          onClick={onToggleTraffic}
          className={cn(
            "p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center min-w-[38px]",
            showTraffic ? "text-cyan-400 bg-cyan-400/10" : "text-white/80 hover:text-white hover:bg-white/10"
          )}
          title="Trafik Durumunu Göster"
        >
          <Car size={18} />
        </button>
        
        <div className="w-px h-4 bg-white/20 mx-0.5" />
        
        <button 
          onClick={handleToggleLayers}
          className={cn(
            "p-2 rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-0 min-w-[44px]",
            currentStyle !== 'default' ? "text-cyan-400 bg-cyan-400/10" : "text-white/80 hover:text-white hover:bg-white/10"
          )}
          title="Harita Stilini Değiştir"
        >
          <Layers size={18} />
          <span className="text-[8px] font-bold uppercase tracking-tighter leading-none">{currentStyle}</span>
        </button>
      </div>
    </div>
  );
}
