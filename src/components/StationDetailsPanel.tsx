import { useEffect, useState, useRef } from 'react';
import TouristAttractionsPanel from './TouristAttractionsPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Heart, Share2, MapPin, Navigation, Phone, Calendar, Star, AlertCircle, CloudRain, Sun, Cloud, Snowflake, ShieldCheck } from 'lucide-react';
import { useStation } from '../contexts/StationContext';
import { translations } from '../lib/translations';
import { useSettings } from '../contexts/SettingsContext';
import { apiClient } from '../lib/apiClient';

const MOCK_COVER = "https://images.unsplash.com/photo-1620060935399-6e3e1ffb1046?q=80&w=600&auto=format&fit=crop";
const MOCK_LOGO = "https://ui-avatars.com/api/?name=ZES&background=0f172a&color=fff&bold=true";

const formatConnectionType = (type: string | undefined): string => {
  if (!type) return 'Bilinmiyor';
  if (type.includes('CCS_COMBO_2')) return 'CCS 2';
  if (type.includes('CCS_COMBO_1')) return 'CCS 1';
  if (type.includes('TYPE_2')) return 'Type 2';
  if (type.includes('TYPE_1')) return 'Type 1';
  if (type.includes('CHADEMO')) return 'CHAdeMO';
  if (type.includes('J1772')) return 'J1772';
  if (type.includes('TESLA')) return 'Tesla';
  if (type.includes('WALL')) return 'Priz (Wall)';
  return type.replace('EV_CONNECTOR_TYPE_', '').replace(/_/g, ' ');
};
export default function StationDetailsPanel({ 
  onBack,
  onSelectTouristSpot 
}: { 
  onBack: () => void,
  onSelectTouristSpot?: (spot: {lat: number, lng: number, name: string} | null) => void 
}) {
  const { selectedStation } = useStation();
  const { language } = useSettings();
  const t = translations[language];

  // Weather State
  const [weatherData, setWeatherData] = useState<{tempCelsius: number, description: string, iconCode: string} | null>(null);
  
  // Address State
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  
  // Reservation Button State
  const [reservationClicked, setReservationClicked] = useState(false);
  const reservationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showTouristPanel, setShowTouristPanel] = useState(false);

  const handleReservationClick = () => {
     setReservationClicked(true);
     if (reservationTimeoutRef.current) clearTimeout(reservationTimeoutRef.current);
     reservationTimeoutRef.current = setTimeout(() => {
        setReservationClicked(false);
     }, 2500);
  };

  useEffect(() => {
     return () => {
        if (reservationTimeoutRef.current) clearTimeout(reservationTimeoutRef.current);
     };
  }, []);
  // Nearby Amenities State
  const [nearbyAmenities, setNearbyAmenities] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedStation) return;
    
    // Fetch real-time weather on panel open
    apiClient(`/weather?lat=${selectedStation.latitude}&lng=${selectedStation.longitude}`)
      .then(res => res.json())
      .then(data => {
         if (data) setWeatherData(data);
      })
      .catch(err => console.error("Weather API error", err));
      
    // Fetch nearby amenities
    setNearbyAmenities([]); // Reset state on new station
    apiClient(`/stations/amenities?lat=${selectedStation.latitude}&lng=${selectedStation.longitude}`)
      .then(res => res.json())
      .then(result => {
         if (result.success && result.data) {
             setNearbyAmenities(result.data);
         }
      })
      .catch(err => console.error("Amenities API error", err));
      
  }, [selectedStation]);

  if (!selectedStation) return null;

  // Map OpenWeather iconCode to Lucide React icons
  const getWeatherIcon = (code: string) => {
    if (!code) return <Cloud size={20} className="text-zinc-400" />;
    if (code.includes('01')) return <Sun size={20} className="text-amber-400" />;
    if (code.includes('09') || code.includes('10')) return <CloudRain size={20} className="text-blue-300" />;
    if (code.includes('13')) return <Snowflake size={20} className="text-blue-100" />;
    return <Cloud size={20} className="text-zinc-300" />;
  };

  return (
    <div className="flex pointer-events-none">
      <div className="glass-panel w-full sm:w-[420px] h-[calc(100svh-48px)] overflow-hidden flex flex-col pointer-events-auto relative mt-2 mb-4 mx-4 shadow-3xl shrink-0">
      
      {/* Top Image Section */}
      <div className="relative h-36 shrink-0 bg-cover bg-center rounded-t-[1.3rem] overflow-hidden" style={{ backgroundImage: `url(${MOCK_COVER})` }}>
        {/* Gradient Overlay for Top Controls */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
        
        {/* Actions bar */}
        <div className="absolute top-4 left-4 flex gap-2">
          <button 
            onClick={onBack}
            className="p-1 -ml-1 text-white hover:scale-105 active:scale-95 transition-all drop-shadow-lg"
          >
            <ChevronLeft size={28} />
          </button>
        </div>

        {/* Floating Brand Cover Content & Actions */}
        <div className="absolute top-16 left-4 right-4 flex items-center justify-between pointer-events-none">
           <div className="flex gap-3 items-center pointer-events-auto">
             <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg overflow-hidden shrink-0">
                <img src={MOCK_LOGO} alt="Brand Logo" className="w-full h-full object-cover rounded-xl" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white leading-tight drop-shadow-md line-clamp-2">{selectedStation.title}</h2>
                <div className="flex items-center gap-1 mt-0.5">
                   {/* 0 Stars Mock Rating */}
                   <div className="flex text-zinc-500 drop-shadow-sm">
                     <Star size={14} className="fill-transparent" />
                     <Star size={14} className="fill-transparent" />
                     <Star size={14} className="fill-transparent" />
                     <Star size={14} className="fill-transparent" />
                     <Star size={14} className="fill-transparent" />
                     <span className="text-white ml-1 text-xs font-medium">0.0 <span className="text-zinc-300 font-normal">(0 {language === 'tr' ? 'değerlendirme' : 'reviews'})</span></span>
                   </div>
                </div>
             </div>
           </div>

           <div className="flex flex-row gap-2 pointer-events-auto shrink-0">
             <button className="w-10 h-10 rounded-full bg-white/95 text-red-500 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
               <Heart size={20} className="fill-red-500" />
             </button>
             <button className="w-10 h-10 rounded-full bg-white/95 text-black shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
               <Share2 size={18} />
             </button>
           </div>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-6 relative">
        <div className="p-5 flex flex-col gap-6">

            {/* Address & Status Row */}
            <div className="flex gap-4 justify-between items-start pt-1">
               <div className="flex gap-2 items-start flex-1 text-zinc-300 text-sm">
                  <MapPin size={18} className="shrink-0 mt-0.5" />
                  <p 
                    onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                    className={`cursor-pointer transition-all ${isAddressExpanded ? '' : 'line-clamp-2'}`}
                    title={!isAddressExpanded ? "Tamamını gör" : "Daralt"}
                  >
                    {selectedStation.formattedAddress || 'Adres bilgisi bulunamadı.'}
                  </p>
               </div>
               <div className="flex items-center gap-3 shrink-0">
                  {weatherData && (
                     <div className="flex flex-col items-center">
                        {getWeatherIcon(weatherData.iconCode)}
                        <span className="text-[10px] text-zinc-300 font-bold mt-0.5">{Math.round(weatherData.tempCelsius)}°C</span>
                     </div>
                  )}
                  <div className="flex flex-col items-center">
                     <MapPin size={18} className="text-emerald-400" />
                     <span className="text-[10px] text-emerald-400 font-bold mt-0.5 text-center">2km</span>
                  </div>
                  <button className="text-red-500 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 p-2 rounded-full transition-colors ml-1 self-center">
                     <AlertCircle size={18} />
                  </button>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
               <button className="bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1 text-sm shadow-lg shadow-blue-500/20">
                  <Navigation size={16} /> Yol Tarifi
               </button>
               <button className="bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1 text-sm shadow-lg shadow-blue-500/20">
                  <Phone size={16} /> Ara
               </button>
               <button 
                  onClick={handleReservationClick}
                  className="relative bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all text-white font-semibold rounded-xl flex items-center justify-center text-[13px] shadow-lg shadow-blue-500/20 whitespace-nowrap overflow-hidden h-10">
                  <AnimatePresence mode="wait">
                     {reservationClicked ? (
                        <motion.div
                           key="soon"
                           initial={{ opacity: 0, y: 15 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -15 }}
                           transition={{ duration: 0.2 }}
                           className="absolute flex items-center justify-center w-full"
                        >
                           Çok Yakında..
                        </motion.div>
                     ) : (
                        <motion.div
                           key="rez"
                           initial={{ opacity: 0, y: 15 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -15 }}
                           transition={{ duration: 0.2 }}
                           className="absolute flex items-center justify-center gap-1 w-full"
                        >
                           <Calendar size={16} /> Rezervasyon
                        </motion.div>
                     )}
                  </AnimatePresence>
               </button>
            </div>
            
            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 active:scale-[0.98] transition-all text-white/90 font-medium py-3 rounded-xl flex items-center justify-center text-sm shadow-md">
               Şarj Noktasını Değerlendir
            </button>

            {/* Sockets List */}
            <div className="flex flex-col gap-3">
               <h3 className="font-semibold text-white/80">Mevcut Soketler</h3>
               <div className="flex flex-col gap-2">
                  {selectedStation.connections?.length === 0 ? (
                     <div className="text-zinc-400 text-sm italic">Soket detayı bilinmiyor.</div>
                  ) : (
                     selectedStation.connections?.flatMap((conn, connIndex) => {
                        const count = conn.count || 1;
                        
                        return Array.from({ length: count }).map((_, i) => {
                           let isAvailable = true;
                           let statusText = "Bilinmiyor"; // varsayılan
                           let statusColorClass = "text-zinc-400";
                           let statusBgClass = "bg-zinc-400";
                           let showPulse = false;

                           // availableCount varsa ve null değilse kesin bilgiye göre renklendiriyoruz
                           if (conn.availableCount !== undefined && conn.availableCount !== null) {
                              isAvailable = i < conn.availableCount;
                              if (isAvailable) {
                                 statusText = "Müsait";
                                 statusColorClass = "text-emerald-400";
                                 statusBgClass = "bg-emerald-400";
                                 showPulse = true;
                              } else {
                                 statusText = "Dolu/Servis Dışı";
                                 statusColorClass = "text-red-500";
                                 statusBgClass = "bg-red-500";
                                 showPulse = false;
                              }
                           }

                           return (
                              <div key={`${connIndex}-${i}`} className="flex bg-white/5 border border-white/10 p-3 rounded-2xl items-center justify-between hover:bg-white/10 transition-colors">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                       <ShieldCheck size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-xs text-white/50">Soket {count > 1 ? i + 1 : ''}</span>
                                       <span className="font-bold">{formatConnectionType(conn.connectionType || conn.currentType)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-xs text-white/50">Güç</span>
                                       <span className="font-bold">{conn.powerKw ? `${conn.powerKw} kW` : 'Bilinmiyor'}</span>
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-end">
                                    <span className={`text-[10px] ${statusColorClass} flex items-center gap-1 font-bold`}>
                                       <div className={`w-1.5 h-1.5 rounded-full ${statusBgClass} ${showPulse ? 'animate-pulse' : ''}`} /> {statusText}
                                    </span>
                                    <div className="font-mono mt-0.5">
                                       <span className="font-bold text-lg">7,99₺</span>
                                       <span className="text-xs text-white/50"> /kWh</span>
                                    </div>
                                 </div>
                              </div>
                           );
                        });
                     })
                  )}
               </div>
            </div>

            {/* Amenities (Şarj Noktası Çevresindeki İmkanlar) */}
            {nearbyAmenities.length > 0 && (
               <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-white/80">Yürüme Mesafesindeki İmkanlar</h3>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                     {nearbyAmenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                           <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> {amenity}
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Tourist Attractions Quick Button */}
            <button 
               onClick={() => setShowTouristPanel(!showTouristPanel)}
               className="mt-1 w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-semibold py-3 rounded-xl border border-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
               🗺️ Çevredeki Turistik Yerleri Keşfet
            </button>

            {/* Kampanyalar Mock */}
            <div className="flex flex-col gap-3 mt-4">
               <h3 className="font-semibold text-white/80 shrink-0">Kampanyalar</h3>
               <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30 rounded-2xl p-4 flex flex-col gap-1">
                  <h4 className="font-bold text-blue-200">Hafta Sonu İndirimi!</h4>
                  <p className="text-xs text-blue-100/70">Cumartesi ve Pazar günleri yapılan tüm DC şarj işlemlerinde %10 net indirim kazanın.</p>
               </div>
            </div>

            {/* Değerlendirmeler Mock */}
            <div className="flex flex-col gap-3">
               <h3 className="font-semibold text-white/80">Değerlendirmeler</h3>
               <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <img src="https://ui-avatars.com/api/?name=Ge+Sen&background=random" className="w-10 h-10 rounded-full" alt="avatar" />
                        <div>
                           <p className="font-semibold text-sm">Görkem Esendeniz</p>
                           <p className="text-xs text-zinc-500">2 gün önce</p>
                        </div>
                     </div>
                     <div className="flex text-amber-500">
                        <Star size={12} className="fill-amber-500" />
                        <Star size={12} className="fill-amber-500" />
                        <Star size={12} className="fill-amber-500" />
                        <Star size={12} className="fill-amber-500" />
                        <Star size={12} className="fill-transparent" />
                     </div>
                  </div>
                  <p className="text-sm text-zinc-300 mt-1">
                     Keyifli ve sakin bir tesis. Hem çok iyi dinlendik, hem de aracımızı hızlıca tam şarj edebildik. Tekrar uğrayacağım.
                  </p>
               </div>
            </div>
            
        </div>
      </div>
      </div>

      <AnimatePresence>
        {showTouristPanel && (
           <TouristAttractionsPanel 
             station={selectedStation} 
             onSelectTouristSpot={onSelectTouristSpot}
             onClose={() => setShowTouristPanel(false)} 
           />
        )}
      </AnimatePresence>
    </div>
  );
}

