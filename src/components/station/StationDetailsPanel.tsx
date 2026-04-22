import { useEffect, useState, useRef, useCallback } from 'react';
import TouristAttractionsPanel from './TouristAttractionsPanel';
import ReviewStationPanel from './ReviewStationPanel';
import ReportIssuePanel from './ReportIssuePanel';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Heart, Plus, Share2, MapPin, Navigation, Phone, Calendar, Star, AlertCircle, CloudRain, Sun, Cloud, Snowflake, CloudDrizzle, Wind, ShieldCheck, Loader2, Pencil, Trash } from 'lucide-react';
import { useStation } from '../../contexts/StationContext';
import { translations } from '../../lib/translations';
import { useSettings } from '../../contexts/SettingsContext';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../contexts/AuthContext';

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
// Haversine formula — kuş uçuşu mesafe hesabı (km)
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
   const R = 6371;
   const dLat = (lat2 - lat1) * Math.PI / 180;
   const dLon = (lon2 - lon1) * Math.PI / 180;
   const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Mesafe formatlama
function formatDistance(km: number): string {
   if (km < 1) return `${Math.round(km * 1000)}m`;
   if (km < 10) return `${km.toFixed(1)}km`;
   return `${Math.round(km)}km`;
}

// Review response interface
interface ReviewData {
   id: string;
   userId: string;
   userFullName: string;
   userInitials: string;
   rating: number;
   comment?: string;
   tags: string[];
   photos?: string[];
   createdAt: string;
}

interface RatingSummary {
   averageRating: number;
   totalReviews: number;
   reviews: ReviewData[];
}

export default function StationDetailsPanel({
   onBack,
   onSelectTouristSpot
}: {
   onBack: () => void,
   onSelectTouristSpot?: (spot: { lat: number, lng: number, name: string } | null) => void
}) {
   const { selectedStation } = useStation();
   const { language } = useSettings();
   const t = translations[language];
   const { currentUser, requireAuth } = useAuth();

   // Weather State
   const [weatherData, setWeatherData] = useState<{ tempCelsius: number, description: string, iconCode: string } | null>(null);

   // Address State
   const [isAddressExpanded, setIsAddressExpanded] = useState(false);

   // Reservation Button State
   const [reservationClicked, setReservationClicked] = useState(false);
   const reservationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   const [showTouristPanel, setShowTouristPanel] = useState(false);
   const [showReviewPanel, setShowReviewPanel] = useState(false);
   const [showReportIssuePanel, setShowReportIssuePanel] = useState(false);

   const [showPhone, setShowPhone] = useState(false);

   // Geolocation / Distance State
   const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
   const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');

   // Reviews State
   const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);
   const [reviewsLoading, setReviewsLoading] = useState(false);
   const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
   const [editingReview, setEditingReview] = useState<ReviewData | null>(null);
   const [enrichedConnections, setEnrichedConnections] = useState<any[] | null>(null);

   const handleDeleteReview = async (reviewId: string) => {
      if (!window.confirm("Değerlendirmeyi silmek istediğinize emin misiniz?")) return;
      try {
         const res = await apiClient(`/reviews/${reviewId}`, { method: 'DELETE' });
         if (res.ok) {
            if (selectedStation) fetchReviews(selectedStation.id);
         } else {
            const data = await res.json();
            alert(data.message || "Silme işlemi başarısız oldu.");
         }
      } catch (err) {
         console.error(err);
         alert("Bağlantı hatası yaşandı.");
      }
   };

   const handlePhoneClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPhone(!showPhone);
   };

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

   // Geolocation — konum izni al
   useEffect(() => {
      if (!navigator.geolocation) {
         setLocationPermission('denied');
         return;
      }
      navigator.geolocation.getCurrentPosition(
         (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocationPermission('granted');
         },
         () => {
            setLocationPermission('denied');
         },
         { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
   }, []);

   // Reviews fetch fonksiyonu — ReviewStationPanel kapandığında yeniden çekmek için
   const fetchReviews = useCallback((stationId: string) => {
      setReviewsLoading(true);
      apiClient(`/reviews/${stationId}`)
         .then(res => res.json())
         .then(result => {
            if (result.success && result.data) {
               setRatingSummary(result.data);
            }
         })
         .catch(err => console.error("Reviews API error", err))
         .finally(() => setReviewsLoading(false));
   }, []);

   useEffect(() => {
      if (!selectedStation) {
         setEnrichedConnections(null);
         return;
      }

      // Reset enriched data when station changes
      setEnrichedConnections(null);

      // Enrichment logic: Fetch full station data from specialized service
      const fetchFullDetails = async () => {
         try {
            // Integer OCM ID → direct detail endpoint
            const numericId = parseInt(selectedStation.id, 10);
            if (!isNaN(numericId) && String(numericId) === selectedStation.id) {
               const res = await apiClient(`/stations/${numericId}`);
               if (res.ok) {
                  const result = await res.json();
                  if (result.success && result.data && result.data.connections) {
                     setEnrichedConnections(result.data.connections);
                     return;
                  }
               }
            }

            // Coordinate-based search (Google Place IDs and route stops)
            // delta=0.003 ≈ 330m her yönde — rota durakları için güvenilir eşleşme sağlar
            const delta = 0.003;
            const swLat = selectedStation.latitude - delta;
            const swLng = selectedStation.longitude - delta;
            const neLat = selectedStation.latitude + delta;
            const neLng = selectedStation.longitude + delta;

            const res = await apiClient(`/stations/google?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`);
            const result = await res.json();

            if (result.success && result.data && Array.isArray(result.data)) {
               const COORD_TOLERANCE = 0.003;
               const fullStation = result.data.find((s: any) =>
                  String(s.id) === String(selectedStation.id) ||
                  (Math.abs(s.latitude - selectedStation.latitude) < COORD_TOLERANCE &&
                   Math.abs(s.longitude - selectedStation.longitude) < COORD_TOLERANCE)
               );

               if (fullStation && fullStation.connections && fullStation.connections.length > 0) {
                  setEnrichedConnections(fullStation.connections);
               }
            }
         } catch (err) {
            console.error("Enrichment fetch failed", err);
         }
      };

      fetchFullDetails();
   }, [selectedStation?.id]);

   useEffect(() => {
      if (!selectedStation) return;
      let isCancelled = false;

      // Normalize backend response (PascalCase → camelCase)
      const normalizeWeather = (d: any) => ({
         tempCelsius: d.tempCelsius ?? d.TempCelsius ?? 0,
         description: d.description ?? d.Description ?? '',
         iconCode: d.iconCode ?? d.IconCode ?? '01d'
      });

      // Clear stale data from previous station immediately
      setWeatherData(null);

      apiClient(`/weather?lat=${selectedStation.latitude}&lng=${selectedStation.longitude}`)
         .then(res => {
            if (!res.ok) {
               console.error("Weather API HTTP error:", res.status, res.statusText);
               return null;
            }
            return res.json();
         })
         .then(result => {
            if (isCancelled || !result) return;
            if (result.success && result.data) {
               setWeatherData(normalizeWeather(result.data));
            } else if (result.tempCelsius !== undefined || result.TempCelsius !== undefined) {
               setWeatherData(normalizeWeather(result));
            } else {
               console.warn("Weather API unexpected response:", result);
            }
         })
         .catch(err => {
            if (!isCancelled) console.error("Weather API error:", err);
         });

      // Fetch nearby amenities
      setNearbyAmenities([]);
      apiClient(`/stations/amenities?lat=${selectedStation.latitude}&lng=${selectedStation.longitude}`)
         .then(res => res.json())
         .then(result => {
            if (isCancelled) return;
            if (result.success && result.data) {
               setNearbyAmenities(result.data);
            }
         })
         .catch(err => { if (!isCancelled) console.error("Amenities API error", err); });

      // Fetch reviews
      fetchReviews(selectedStation.id);

      return () => { isCancelled = true; };
   }, [selectedStation, fetchReviews]);

   if (!selectedStation) return null;

   // Mesafe hesaplama
   const distanceToStation = (userLocation && selectedStation)
      ? haversineDistance(userLocation.lat, userLocation.lng, selectedStation.latitude, selectedStation.longitude)
      : null;

   // Map OpenWeather iconCode to Lucide React icons
   const getWeatherIcon = (code: string) => {
      if (!code) return <Cloud size={20} className="text-zinc-400" />;
      if (code.includes('01')) return <Sun size={20} className="text-amber-400" />;
      if (code.includes('02')) return <Cloud size={20} className="text-amber-300" />;
      if (code.includes('03') || code.includes('04')) return <Cloud size={20} className="text-zinc-300" />;
      if (code.includes('09')) return <CloudDrizzle size={20} className="text-blue-300" />;
      if (code.includes('10')) return <CloudRain size={20} className="text-blue-300" />;
      if (code.includes('11')) return <CloudRain size={20} className="text-yellow-300" />;
      if (code.includes('13')) return <Snowflake size={20} className="text-blue-100" />;
      if (code.includes('50')) return <Wind size={20} className="text-zinc-400" />;
      return <Cloud size={20} className="text-zinc-300" />;
   };

   // Tarih formatlama (review için)
   const formatRelativeDate = (dateStr: string) => {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffMins < 1) return language === 'tr' ? 'Az önce' : 'Just now';
      if (diffMins < 60) return `${diffMins} ${language === 'tr' ? 'dk önce' : 'min ago'}`;
      if (diffHours < 24) return `${diffHours} ${language === 'tr' ? 'saat önce' : 'hours ago'}`;
      if (diffDays < 30) return `${diffDays} ${language === 'tr' ? 'gün önce' : 'days ago'}`;
      return date.toLocaleDateString('tr-TR');
   };

   return (
      <div className="flex gap-4 md:gap-6 pointer-events-none h-full">
         <div className="glass-panel w-full sm:w-[420px] h-full overflow-hidden flex flex-col pointer-events-auto relative shadow-3xl shrink-0">

            {/* Top Image Section */}
            <div className="relative h-36 shrink-0 rounded-t-[1.3rem] overflow-hidden">
               {/* Subtle Gradient Overlay for Text Readability */}
               <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />

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
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent((selectedStation.title || 'S').substring(0, 3))}&background=0f172a&color=fff&bold=true`} alt="Brand Logo" className="w-full h-full object-cover rounded-xl" />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-white leading-tight drop-shadow-md line-clamp-2">{selectedStation.title}</h2>
                        <div className="flex items-center gap-1 mt-0.5">
                           <div className="flex text-zinc-500 drop-shadow-sm">
                              {[1, 2, 3, 4, 5].map((star) => {
                                 const avg = ratingSummary?.averageRating || 0;
                                 const isFull = avg >= star;
                                 const isHalf = !isFull && avg >= star - 0.5;
                                 return <Star key={star} size={14} className={isFull ? 'fill-amber-400 text-amber-400' : isHalf ? 'fill-amber-400/50 text-amber-400' : 'fill-transparent'} />;
                              })}
                              <span className="text-white ml-1 text-xs font-medium">{(ratingSummary?.averageRating || 0).toFixed(1)} <span className="text-zinc-300 font-normal">({ratingSummary?.totalReviews || 0} {language === 'tr' ? 'değerlendirme' : 'reviews'})</span></span>
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
                           {selectedStation.formattedAddress || t.stationDetails.addressNotFound}
                        </p>
                     </div>
                     <div className="flex items-center gap-3 shrink-0">
                        {weatherData && (
                           <div className="flex flex-col items-center" title={weatherData.description}>
                              {getWeatherIcon(weatherData.iconCode)}
                              <span className="text-[10px] text-zinc-300 font-bold mt-0.5">{Math.round(weatherData.tempCelsius)}°C</span>
                           </div>
                        )}
                        {locationPermission === 'granted' && distanceToStation !== null && (
                           <div className="flex flex-col items-center">
                              <MapPin size={18} className="text-emerald-400" />
                              <span className="text-[10px] text-emerald-400 font-bold mt-0.5 text-center">{formatDistance(distanceToStation)}</span>
                           </div>
                        )}
                        <button 
                           onClick={() => {
                              if (!currentUser) {
                                 requireAuth(t.stationDetails.requireAuthReport);
                                 return;
                              }
                              setShowReportIssuePanel(!showReportIssuePanel);
                              if (!showReportIssuePanel) {
                                 setShowReviewPanel(false);
                                 setShowTouristPanel(false);
                              }
                           }}
                           className="text-red-500 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 p-2 rounded-full transition-colors ml-1 self-center"
                        >
                           <AlertCircle size={18} />
                        </button>
                     </div>
                  </div>

                  {/* Action Buttons */}
                  <motion.div layout className="flex gap-2 h-11 w-full bg-transparent overflow-hidden">
                     <motion.button
                        key="nav"
                        type="button"
                        layout
                        initial={false}
                        animate={{
                           width: showPhone ? 0 : "33.33%",
                           opacity: showPhone ? 0 : 1,
                           paddingLeft: showPhone ? 0 : 12,
                           paddingRight: showPhone ? 0 : 12,
                           marginRight: showPhone ? -8 : 0
                        }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0 }}
                        className="bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all text-white font-semibold rounded-xl flex items-center justify-center gap-1 text-sm shadow-lg shadow-blue-500/20 whitespace-nowrap overflow-hidden"
                        style={{ pointerEvents: showPhone ? "none" : "auto" }}
                     >
                        <Navigation size={16} className="shrink-0" /> <span className="truncate">{t.stationDetails.directions}</span>
                     </motion.button>

                     <motion.button
                        key="ara"
                        type="button"
                        layout
                        onClick={handlePhoneClick}
                        transition={{ duration: 0.3, type: "spring", bounce: 0 }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all text-white font-semibold rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 h-full overflow-hidden shrink-0 z-10 relative"
                     >
                        <AnimatePresence mode="wait">
                           {showPhone ? (
                              <motion.div
                                 key="phone"
                                 initial={{ opacity: 0, scale: 0.8 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.8 }}
                                 transition={{ duration: 0.2 }}
                                 className="flex items-center justify-center gap-2 w-full text-[15px]"
                              >
                                 <Phone size={18} className={selectedStation?.contactTelephone ? "animate-pulse" : ""} />
                                 {selectedStation?.contactTelephone || t.stationDetails.noPhone}
                              </motion.div>
                           ) : (
                              <motion.div
                                 key="call"
                                 initial={{ opacity: 0, scale: 0.8 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 0.8 }}
                                 transition={{ duration: 0.2 }}
                                 className="flex items-center justify-center gap-1 w-full text-sm whitespace-nowrap px-4"
                              >
                                 <Phone size={16} /> {t.stationDetails.call}
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </motion.button>

                     <motion.button
                        key="rez"
                        type="button"
                        layout
                        initial={false}
                        animate={{
                           width: showPhone ? 0 : "33.33%",
                           opacity: showPhone ? 0 : 1,
                           paddingLeft: showPhone ? 0 : 12,
                           paddingRight: showPhone ? 0 : 12,
                           marginLeft: showPhone ? -8 : 0
                        }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0 }}
                        onClick={handleReservationClick}
                        className="relative bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all text-white font-semibold rounded-xl flex items-center justify-center text-[13px] shadow-lg shadow-blue-500/20 whitespace-nowrap overflow-hidden"
                        style={{ pointerEvents: showPhone ? "none" : "auto" }}
                     >
                        <AnimatePresence mode="wait">
                           {reservationClicked ? (
                              <motion.div
                                 key="soon"
                                 initial={{ opacity: 0, y: 15 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -15 }}
                                 transition={{ duration: 0.2 }}
                                 className="absolute inset-0 flex items-center justify-center"
                              >
                                 {t.stationDetails.comingSoon}
                              </motion.div>
                           ) : (
                              <motion.div
                                 key="rez"
                                 initial={{ opacity: 0, y: 15 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -15 }}
                                 transition={{ duration: 0.2 }}
                                 className="absolute inset-0 flex items-center justify-center gap-1 px-2"
                              >
                                 <Calendar size={16} className="shrink-0" /> <span className="truncate">{t.stationDetails.reservation}</span>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </motion.button>
                  </motion.div>

                  <button 
                     onClick={() => {
                        if (!currentUser) {
                           requireAuth(t.stationDetails.requireAuthReview);
                           return;
                        }
                        setShowReviewPanel(!showReviewPanel);
                        if (!showReviewPanel) {
                           setShowTouristPanel(false);
                           setShowReportIssuePanel(false);
                        }
                     }}
                     className="w-full bg-white/10 hover:bg-white/20 border border-white/20 active:scale-[0.98] transition-all text-white/90 font-medium py-3 rounded-xl flex items-center justify-center text-sm shadow-md"
                  >
                     {t.stationDetails.rateStation}
                  </button>

                  {/* Sockets List */}
                  <div className="flex flex-col gap-3">
                     <h3 className="font-semibold text-white/80">{t.stationDetails.availableSockets}</h3>
                     <div className="flex flex-col gap-2">
                        {(!enrichedConnections && (!selectedStation.connections || selectedStation.connections.length === 0)) ? (
                           <div className="text-zinc-400 text-sm italic">{t.stationDetails.unknownSocket}</div>
                        ) : (
                           (enrichedConnections || selectedStation.connections || []).flatMap((conn, connIndex) => {
                              const count = conn.count || 1;

                              return Array.from({ length: count }).map((_, i) => {
                                 let isAvailable = true;
                                 let statusText = t.stationDetails.unknown; // varsayılan
                                 let statusColorClass = "text-zinc-400";
                                 let statusBgClass = "bg-zinc-400";
                                 let showPulse = false;

                                 // availableCount varsa ve null değilse kesin bilgiye göre renklendiriyoruz
                                 if (conn.availableCount !== undefined && conn.availableCount !== null) {
                                    isAvailable = i < conn.availableCount;
                                    if (isAvailable) {
                                       statusText = t.stationDetails.available;
                                       statusColorClass = "text-emerald-400";
                                       statusBgClass = "bg-emerald-400";
                                       showPulse = true;
                                    } else {
                                       statusText = t.stationDetails.unavailable;
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
                                          <div className="flex flex-col min-w-[90px]">
                                             <span className="text-xs text-white/50">{t.stationDetails.socket} {count > 1 ? i + 1 : ''}</span>
                                             <span className="font-bold">{formatConnectionType(conn.connectionType || conn.currentType)}</span>
                                          </div>
                                          <div className="flex flex-col">
                                             <span className="text-xs text-white/50">{t.stationDetails.power}</span>
                                             <span className="font-bold">{conn.powerKw ? `${conn.powerKw} kW` : t.stationDetails.unknown}</span>
                                          </div>
                                       </div>
                                       <div className="flex flex-col items-end">
                                          <span className={`text-[10px] ${statusColorClass} flex items-center gap-1 font-bold`}>
                                             <div className={`w-1.5 h-1.5 rounded-full ${statusBgClass} ${showPulse ? 'animate-pulse' : ''}`} /> {statusText}
                                          </span>
                                          <div className="font-mono mt-0.5 text-right">
                                             {conn.price ? (
                                                <>
                                                   <span className="font-bold text-lg">{conn.price.toFixed(2)}₺</span>
                                                   <span className="text-xs text-white/50"> /kWh</span>
                                                </>
                                             ) : (
                                                <span className="text-xs text-zinc-500 font-sans">Fiyat bilinmiyor</span>
                                             )}
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
                        <h3 className="font-semibold text-white/80">{t.stationDetails.nearbyAmenities}</h3>
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
                     onClick={() => {
                        if (!currentUser) {
                           requireAuth(t.stationDetails.requireAuthTourist);
                           return;
                        }
                        setShowTouristPanel(!showTouristPanel);
                        if (!showTouristPanel) {
                           setShowReviewPanel(false);
                           setShowReportIssuePanel(false);
                        }
                     }}
                     className="mt-1 w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-semibold py-3 rounded-xl border border-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                     {t.stationDetails.discoverTourist}
                  </button>



                  {/* Değerlendirmeler */}
                  <div className="flex flex-col gap-3">
                     <h3 className="font-semibold text-white/80">{language === 'tr' ? 'Değerlendirmeler' : 'Reviews'}</h3>
                     {reviewsLoading ? (
                        <div className="flex items-center justify-center py-6">
                           <Loader2 size={24} className="animate-spin text-blue-400" />
                        </div>
                     ) : !ratingSummary || ratingSummary.totalReviews === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                           <p className="text-zinc-400 text-sm">{language === 'tr' ? 'Henüz değerlendirme yok. İlk değerlendiren siz olun!' : 'No reviews yet. Be the first to review!'}</p>
                        </div>
                     ) : (
                        ratingSummary.reviews.slice(0, 5).map((review) => (
                           <div key={review.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 relative">
                              <div className="flex justify-between items-start">
                                 <div className="flex items-center gap-3">
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.userInitials)}&background=random`} className="w-10 h-10 rounded-full" alt="avatar" />
                                    <div>
                                       <p className="font-semibold text-sm">{review.userFullName}</p>
                                       <p className="text-xs text-zinc-500">{formatRelativeDate(review.createdAt)}</p>
                                    </div>
                                 </div>
                                 <div className="flex text-amber-500">
                                    {[1, 2, 3, 4, 5].map(s => (
                                       <Star key={s} size={12} className={review.rating >= s ? 'fill-amber-500' : 'fill-transparent'} />
                                    ))}
                                 </div>
                              </div>
                              {review.photos && review.photos.length > 0 && (
                                 <div className="flex gap-2 mt-2 mb-1">
                                    {review.photos.map((photo, i) => (
                                       <button 
                                          key={i} 
                                          onClick={() => setSelectedPhoto(photo)}
                                          className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 hover:border-white/40 transition-all cursor-zoom-in shrink-0 relative group"
                                       >
                                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                                          <img src={photo} alt="Review" className="w-full h-full object-cover relative z-0" />
                                       </button>
                                    ))}
                                 </div>
                              )}
                              {review.comment && (
                                 <p className="text-sm text-zinc-300 mt-1">{review.comment}</p>
                              )}
                              {review.tags && review.tags.length > 0 && (
                                 <div className="flex flex-wrap gap-1 mt-1">
                                    {review.tags.map((tag, i) => (
                                       <span key={i} className="text-[10px] bg-white/10 text-zinc-300 px-2 py-0.5 rounded-md">{tag}</span>
                                    ))}
                                 </div>
                              )}
                              {currentUser?.id === review.userId && (
                                 <div className="flex justify-end items-center gap-2 mt-2 pt-2 border-t border-white/5">
                                    <button 
                                       onClick={() => {
                                          setEditingReview(review);
                                          setShowReviewPanel(true);
                                       }}
                                       className="py-1 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
                                       title="Düzenle"
                                    >
                                       <Pencil size={12} /> Düzenle
                                    </button>
                                    <button 
                                       onClick={() => handleDeleteReview(review.id)}
                                       className="py-1 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-md text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 text-xs font-medium"
                                       title="Sil"
                                    >
                                       <Trash size={12} /> Sil
                                    </button>
                                 </div>
                              )}
                           </div>
                        ))
                     )}
                  </div>

               </div>
            </div>
         </div>

         {/* Lightbox Modal */}
         <AnimatePresence>
            {selectedPhoto && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedPhoto(null)}
                  className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out pointer-events-auto"
               >
                  <motion.img
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.9, opacity: 0 }}
                     transition={{ type: "spring", stiffness: 300, damping: 25 }}
                     src={selectedPhoto}
                     alt="Enlarged review photo"
                     className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                     onClick={(e) => e.stopPropagation()}
                  />
                  <button 
                     onClick={() => setSelectedPhoto(null)} 
                     className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
                  >
                     <Plus className="rotate-45" size={24} />
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {showTouristPanel && (
               <TouristAttractionsPanel
                  station={selectedStation}
                  onSelectTouristSpot={onSelectTouristSpot}
                  onClose={() => setShowTouristPanel(false)}
               />
            )}
            {showReviewPanel && (
               <ReviewStationPanel
                  station={selectedStation}
                  initialReviewData={editingReview}
                  onClose={() => {
                     setShowReviewPanel(false);
                     setEditingReview(null);
                     // Review paneli kapanınca güncel listeyi çek
                     if (selectedStation) fetchReviews(selectedStation.id);
                  }}
               />
            )}
            {showReportIssuePanel && (
               <ReportIssuePanel
                  station={selectedStation}
                  onClose={() => setShowReportIssuePanel(false)}
               />
            )}
         </AnimatePresence>
      </div>
   );
}

