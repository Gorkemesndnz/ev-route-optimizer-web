import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Search } from 'lucide-react';
import { useMap } from '@vis.gl/react-google-maps';
import type { StationData } from '../../contexts/StationContext';
import { apiClient } from '../../lib/apiClient';
import { ENDPOINTS } from '../../lib/endpoints';

interface Attraction {
  id: string;
  name: string;
  rating: number;
  userRatingCount: number;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  durationSeconds: number;
  primaryType?: string;
}

export default function TouristAttractionsPanel({
  station,
  onClose,
  onSelectTouristSpot
}: {
  station: StationData;
  onClose: () => void;
  onSelectTouristSpot?: (spot: {lat: number, lng: number, name: string} | null) => void;
}) {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const map = useMap();

  useEffect(() => {
    setLoading(true);
    apiClient(`${ENDPOINTS.STATIONS_TOURIST_SPOTS}?lat=${station.latitude}&lng=${station.longitude}`)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setAttractions(result.data);
        }
      })
      .catch(err => console.error("Error loading tourist spots:", err))
      .finally(() => setLoading(false));
  }, [station]);

  const handlePanTo = (lat: number, lng: number, name: string) => {
    if (map) {
      map.panTo({ lat, lng });
      map.setZoom(14);
    }
    if (onSelectTouristSpot) {
      onSelectTouristSpot({ lat, lng, name });
    }
    onClose();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} sn`;
    const mins = Math.round(seconds / 60);
    return `${mins} dk`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="glass-panel w-full sm:w-[380px] h-full overflow-hidden flex flex-col pointer-events-auto shadow-3xl shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-white">Çevreyi Keşfet</h2>
          <p className="text-xs text-white/50">Arabayı şarj ederken gezilecek yerler</p>
        </div>
        <button 
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-zinc-400">
            <Search className="animate-pulse" size={24} />
            <span className="text-sm">Turistik yerler aranıyor...</span>
          </div>
        ) : attractions.length === 0 ? (
          <div className="text-center text-zinc-400 text-sm mt-10">
            İstasyonun 50 km çevresinde popüler bir turistik yer bulunamadı.
          </div>
        ) : (
          attractions.map((spot, i) => (
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              key={spot.id} 
              onClick={() => handlePanTo(spot.latitude, spot.longitude, spot.name)}
              className="group flex flex-col gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-sm"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white/90 text-[15px] leading-tight line-clamp-2">
                  {spot.name}
                </h3>
                {spot.rating > 0 && (
                  <div className="flex flex-col items-end shrink-0">
                    <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-1.5 py-0.5 rounded-md">
                      ★ {spot.rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-white/40 mt-1">({spot.userRatingCount})</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-1 text-sm text-zinc-300">
                <div className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg">
                  <MapPin size={12} />
                  <span className="font-semibold text-xs">
                    {formatDistance(spot.distanceMeters)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span>🚗</span> {formatDuration(spot.durationSeconds)} sürüş
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
