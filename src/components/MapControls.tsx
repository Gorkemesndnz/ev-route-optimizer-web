import { Minus, Plus, LocateFixed, Car, Zap, Check, Layers } from "lucide-react";
import { useMap } from "@vis.gl/react-google-maps";
import { cn } from "@/lib/utils";
import { translations } from "../lib/translations";
import { memo, useState, useRef, useEffect } from "react";

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
    setShowTraffic,
    stationFilters,
    setStationFilters
  } = useSettings();
  const map = useMap();
  const t = translations[language];

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Filtre menüsü dışına tıklandığında otomatik kapat
  useEffect(() => {
    if (!showFilterMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu]);

  const onToggleTraffic = () => setShowTraffic(!showTraffic);

  const toggleStationFilter = (type: string) => {
    if (stationFilters.includes(type)) {
      setStationFilters(stationFilters.filter(t => t !== type));
    } else {
      setStationFilters([...stationFilters, type]);
    }
  };

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
          onClick={handleToggleLayers}
          className="w-8 h-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title="Katman Değiştir"
        >
          <Layers size={18} />
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

        <div className="w-px h-4 bg-white/20 mx-0.5" />

        <div ref={filterMenuRef} className="relative flex items-center justify-center">
          {(() => {
            let btnTextColor = "text-white/80 hover:text-white";
            let btnBgColor = "hover:bg-white/10";
            
            if (showFilterMenu) {
               btnTextColor = "text-cyan-400";
               btnBgColor = "bg-cyan-400/10";
            } else if (stationFilters.length > 0) {
               if (stationFilters.length === 1) {
                   if (stationFilters[0] === 'AC') { btnTextColor = "text-green-500"; btnBgColor = "bg-green-500/10"; }
                   else if (stationFilters[0] === 'DC') { btnTextColor = "text-amber-500"; btnBgColor = "bg-amber-500/10"; }
                   else { btnTextColor = "text-pink-500"; btnBgColor = "bg-pink-500/10"; }
               } else {
                   btnTextColor = "text-cyan-400"; btnBgColor = "bg-cyan-400/10"; // Multiple selected
               }
            }

            return (
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={cn(
                  "h-8 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center min-w-[38px]",
                  btnTextColor, btnBgColor
                )}
                title="İstasyon Tipi"
              >
                <Zap size={18} fill={stationFilters.length > 0 ? "currentColor" : "none"} />
              </button>
            );
          })()}
          
          {showFilterMenu && (
            <div className="absolute bottom-full mb-3 right-0 w-36 bg-zinc-900/95 backdrop-blur border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
              <div className="px-2 pb-1 mb-1 border-b border-white/10 text-xs font-medium text-white/50 uppercase tracking-wider">
                FiLTRELER
              </div>
              {['AC', 'DC', 'HPC'].map(type => {
                const isActive = stationFilters.includes(type);
                // Renk ayarlamaları stationsLayer'a paralel
                let colorClass = "text-cyan-400";
                if (type === 'AC') colorClass = "text-green-500";
                if (type === 'DC') colorClass = "text-amber-500";
                if (type === 'HPC') colorClass = "text-pink-500";
                
                return (
                  <button
                    key={type}
                    onClick={() => toggleStationFilter(type)}
                    className={cn(
                      "flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-lg transition-all text-left",
                      isActive ? "bg-white/10 text-white font-medium" : "text-white/40 hover:bg-white/5"
                    )}
                  >
                    <span>{type}</span>
                    {isActive && <Check size={14} className={colorClass} />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default MapControls;
