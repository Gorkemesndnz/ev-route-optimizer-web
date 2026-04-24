import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  X, Navigation, Clock, Zap, Battery, BatteryFull, TrendingDown, DollarSign,
  MapPin, Info, AlertTriangle, Leaf, Bookmark, Share2,
  Cloud, Sun, CloudRain, Snowflake, Car, Heart,
  ShoppingCart, Coffee, Wifi, SlidersHorizontal, ChevronRight, Star
} from "lucide-react";
import { useRouteContext, type ChargingStopDto, type RouteInsight, type WeatherInfo, type RouteResultDto } from "../../contexts/RouteContext";
import { apiClient } from "../../lib/apiClient";
import { ENDPOINTS } from "../../lib/endpoints";
import { useSavedRoute } from "../../contexts/SavedRouteContext";
import RouteRatingModal from "./RouteRatingModal";
import { useSettings } from "../../contexts/SettingsContext";
import { useVehicle } from "../../contexts/VehicleContext";
import { useStation } from "../../contexts/StationContext";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} dk`;
  return `${h}sa ${m}dk`;
}

function WeatherIcon({ weather, className }: { weather?: WeatherInfo | null, className?: string }) {
  if (!weather || !weather.condition) return <Sun size={14} className={cn("text-yellow-400", className)} />;
  const lower = weather.condition.toLowerCase();
  
  let Icon = Sun;
  let color = "text-yellow-400";
  
  if (lower.includes("rain") || lower.includes("yağmur")) { Icon = CloudRain; color = "text-blue-300"; }
  else if (lower.includes("snow") || lower.includes("kar")) { Icon = Snowflake; color = "text-white"; }
  else if (lower.includes("cloud") || lower.includes("bulut")) { Icon = Cloud; color = "text-white/60"; }
  
  return (
    <div className={cn("flex flex-col items-center justify-center leading-none mt-1", className)}>
      <Icon size={14} className={color} />
      {weather.temp_c !== undefined && (
        <span className="text-white/70 text-[9px] mt-0.5 font-bold">{Math.round(weather.temp_c)}°C</span>
      )}
    </div>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatShortAddress(address?: string | null) {
  if (!address) return 'Adres bilinmiyor';
  const parts = address.split(',').map(p => p.trim());
  
  // Filter out Plus Codes (e.g., "8JWG+XP")
  const filtered = parts.filter(p => !p.includes('+'));
  if (filtered.length <= 2) return filtered.join(', ');
  
  const lastIndex = filtered.length - 1;
  const isTurkey = filtered[lastIndex].toLowerCase() === 'türkiye' || filtered[lastIndex].toLowerCase() === 'turkey';
  
  // Get the city/district part
  let cityDistrict = isTurkey && filtered.length > 1 ? filtered[lastIndex - 1] : filtered[lastIndex];
  
  // Clean zip codes from city string if present (e.g. "10582 Savaştepe/Balıkesir" -> "Savaştepe/Balıkesir")
  cityDistrict = cityDistrict.replace(/^\d{5}\s*/, '');
  
  if (filtered[0] === cityDistrict) return filtered[0];
  
  return `${filtered[0]}, ${cityDistrict}`;
}

function StopCard({
  stop, nodeIndex, arrivalTime, setSelectedStation
}: {
  stop: ChargingStopDto;
  nodeIndex: number;
  arrivalTime: Date;
  setSelectedStation: (s: any) => void;
}) {
  const [appRating, setAppRating] = useState<{ avg: number; total: number } | null>(null);
  useEffect(() => {
    const id = stop.station_id;
    if (!id) return;
    apiClient(ENDPOINTS.reviewsByStation(id))
      .then(r => r.json())
      .then(result => {
        if (result.success && result.data?.totalReviews > 0) {
          setAppRating({ avg: result.data.averageRating, total: result.data.totalReviews });
        }
      })
      .catch(() => {});
  }, [stop.station_id]);

  const connectors = ((stop as any).connections || stop.connectors || []) as any[];
  const maxPower = connectors.length > 0
    ? Math.max(...connectors.map((c: any) => c.power_kw || c.powerKw || c.power || 0))
    : 0;

  return (
    <div className="relative flex items-center mb-0">
      <div className="w-10 shrink-0 self-stretch flex justify-center items-center relative">
        <div className="absolute top-0 bottom-[-2px] w-[2px] bg-gradient-to-b from-green-500/10 via-green-500 to-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] z-0" />
        <div className="relative w-6 h-6 rounded-full bg-[#09090b] flex items-center justify-center border-2 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] z-10 box-content">
          <Zap size={14} className="text-green-500 fill-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
        </div>
      </div>

      <div
        className="flex-1 min-w-0 flex flex-col gap-1.5 border border-white/10 bg-white/[0.02] p-3 rounded-2xl my-2 cursor-pointer hover:bg-white/[0.04] transition-colors"
        onClick={() => setSelectedStation({
          id: stop.station_id || `stop-${nodeIndex}`,
          title: stop.station_name || stop.operator || 'Şarj İstasyonu',
          latitude: stop.lat,
          longitude: stop.lon,
          formattedAddress: stop.address || '',
          connections: connectors.map((c: any) => ({
            connectionType: c.plug_type || c.connectionType || c.type,
            currentType: c.charger_type || c.currentType || c.category,
            powerKw: c.power_kw || c.powerKw || c.power,
            status: c.status,
            count: c.count || c.quantity || 1,
            availableCount: c.available_count ?? c.availableCount ?? (c.status === 'Available' ? (c.count || 1) : 0),
            price: c.price_per_kwh || c.price || undefined
          })),
        })}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
            <span className="text-white font-bold text-[15px] truncate">{stop.operator || stop.station_name}</span>
            {maxPower > 0 && <span className="text-blue-400 text-[11px] font-bold shrink-0">{maxPower} kW</span>}
            {appRating && (
              <div className="flex items-center gap-0.5 text-yellow-400 text-[11px] font-bold shrink-0">
                <Star size={10} className="fill-yellow-400" />
                <span>{appRating.avg.toFixed(1)}</span>
              </div>
            )}
            <WeatherIcon weather={stop.weather} className="shrink-0" />
          </div>
          <div className="flex flex-col items-end gap-1.5 mt-0.5 shrink-0">
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-red-500 hover:scale-110 transition-transform" onClick={e => e.stopPropagation()} />
              <button className="text-white/30 hover:text-white transition-colors" onClick={e => e.stopPropagation()}>
                <SlidersHorizontal size={14} />
              </button>
            </div>
            <span className="text-white/50 text-[11px] font-medium">{formatTime(arrivalTime)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-white/40 text-[12px] flex-1 min-w-0 pr-4">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{formatShortAddress(stop.address)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 shrink-0">
            <BatteryFull size={15} className="text-green-500 shrink-0" />
            <span className="text-green-400 font-bold text-[13px] whitespace-nowrap">
              %{Math.round(stop.arrival_soc)} → %{Math.round(stop.departure_soc)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/30 text-[10px] font-medium whitespace-nowrap">Şarj Süresi</span>
            <span className="text-white/90 font-semibold text-[13px] whitespace-nowrap">{Math.round(stop.charge_time_min)} dk</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/30 text-[10px] font-medium whitespace-nowrap">Maliyet</span>
            <span className="text-white/90 font-semibold text-[13px] whitespace-nowrap">{stop.estimated_cost?.toFixed(0) || 0} ₺</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/30 text-[10px] font-medium whitespace-nowrap">Enerji</span>
            <span className="text-white/90 font-semibold text-[13px] whitespace-nowrap">{stop.energy_added_kwh.toFixed(0)} kWh</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RouteResultPanel({
  onClose,
  mode = 'live',
  savedRouteId,
  onSaved,
}: {
  onClose: () => void;
  mode?: 'live' | 'readonly';
  savedRouteId?: string;
  onSaved?: (id: string) => void;
}) {
  const { routeResult: liveResult, routeLocations, setRouteResult } = useRouteContext();
  const { language } = useSettings();
  const { selectedVehicle } = useVehicle();
  const { setSelectedStation } = useStation();
  const { saveRoute, getSavedRoute, rateSavedRoute } = useSavedRoute();
  const { currentUser, requireAuth } = useAuth();

  // Readonly mod için async yüklenen sonuç
  const [readonlyResult, setReadonlyResult] = useState<RouteResultDto | null>(null);
  const [readonlyLoading, setReadonlyLoading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(savedRouteId ?? null);
  const [isSaved, setIsSaved] = useState(mode === 'readonly' || !!savedRouteId);
  const [savedRating, setSavedRating] = useState<number | null>(null);
  const [savedComment, setSavedComment] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (mode !== 'readonly' || !savedRouteId) return;
    setReadonlyLoading(true);
    getSavedRoute(savedRouteId).then(detail => {
      if (!detail) return;
      try {
        const parsed: RouteResultDto = JSON.parse(detail.routeResultJson);
        setReadonlyResult(parsed);
        setRouteResult(parsed); // haritada polyline çizilsin
      } catch { /* json parse hatası */ }
      setSavedRating(detail.rating);
      setSavedComment(detail.ratingComment);
    }).finally(() => setReadonlyLoading(false));

    return () => { setRouteResult(null); }; // panel kapanınca haritayı temizle
  }, [mode, savedRouteId]);

  const routeResult = mode === 'readonly' ? readonlyResult : liveResult;

  const handleSave = useCallback(async () => {
    if (!currentUser) { requireAuth('Rotayı kaydetmek için'); return; }
    if (!routeResult || isSaved || isSaving) return;
    setIsSaving(true);
    setSaveError(false);
    const startLabel = routeLocations[0]?.value || routeResult.legs[0]?.from_location || 'Başlangıç';
    const endLabel = routeLocations[routeLocations.length - 1]?.value || routeResult.legs[routeResult.legs.length - 1]?.to_location || 'Varış';
    const id = await saveRoute({ result: routeResult, request: { locations: routeLocations }, startLabel, endLabel });
    setIsSaving(false);
    if (id) { setSavedId(id); setIsSaved(true); onSaved?.(id); }
    else { setSaveError(true); setTimeout(() => setSaveError(false), 2500); }
  }, [currentUser, requireAuth, routeResult, routeLocations, saveRoute, isSaved, isSaving]);

  const handleRate = useCallback(async (id: string, rating: number, comment?: string) => {
    await rateSavedRoute(id, rating, comment);
    setSavedRating(rating);
    setSavedComment(comment ?? null);
  }, [rateSavedRoute]);

  const vehicleName = selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "Araç";

  const timelineNodes = useMemo(() => {
    if (!routeResult) return [];

    const nodes: any[] = [];
    let currentTime = new Date(); // Start from now

    // 1. Start Node
    nodes.push({
      type: 'start',
      location: routeLocations[0]?.value || routeResult.legs[0]?.from_location || 'Başlangıç',
      weather: routeResult.start_weather,
      soc: routeResult.legs[0]?.start_soc || 100,
      time: new Date(currentTime)
    });

    // 1b. Kullanıcı tarafından eklenen ara duraklar (origin/destination hariç)
    // Backend legs'leri yalnızca şarj duraklarında böler; kullanıcı durakları
    // leg sınırı oluşturmaz, bu nedenle rota üzerinde geçilecek noktalar olarak
    // start'tan hemen sonra sıralı biçimde gösteriyoruz.
    const userWaypoints = routeLocations.slice(1, -1);
    userWaypoints.forEach((wp, idx) => {
      nodes.push({
        type: 'waypoint',
        index: idx + 1,
        location: wp.value,
        coords: wp.coords,
      });
    });

    routeResult.legs.forEach((leg, i) => {
      currentTime = new Date(currentTime.getTime() + leg.duration_min * 60000);
      
      nodes.push({
        type: 'leg',
        duration: leg.duration_min,
        distance: leg.distance_km,
        consumption: leg.consumption_kwh
      });

      const isLastLeg = i === routeResult.legs.length - 1;
      if (!isLastLeg) {
        const stop = routeResult.charging_stops[i];
        if (stop) {
          nodes.push({
            type: 'stop',
            index: i + 1,
            stop: stop,
            arrivalTime: new Date(currentTime)
          });
          currentTime = new Date(currentTime.getTime() + stop.charge_time_min * 60000);
        }
      } else {
        nodes.push({
          type: 'end',
          location: routeLocations[routeLocations.length - 1]?.value || leg.to_location || 'Varış',
          weather: routeResult.end_weather,
          soc: leg.end_soc,
          time: new Date(currentTime)
        });
      }
    });

    return nodes;
  }, [routeResult, routeLocations]);

  if (mode === 'readonly' && readonlyLoading) {
    return (
      <div className="glass-panel w-full sm:w-[420px] h-32 flex items-center justify-center pointer-events-auto border-white/10">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
      </div>
    );
  }

  if (!routeResult) return null;

  const totalChargeTime = routeResult.charging_stops?.reduce((acc, stop) => acc + stop.charge_time_min, 0) || 0;
  const driveTime = routeResult.total_duration_min - totalChargeTime;
  const avgConsumption = routeResult.total_distance_km > 0 ? routeResult.consumption_kwh / routeResult.total_distance_km * 10 : 0;

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="glass-panel w-full sm:w-[420px] h-full sm:h-auto sm:max-h-[92vh] flex flex-col pointer-events-auto overflow-hidden border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
    >
      {/* Top Summary Area */}
      <div className="flex flex-col gap-3 pb-4 border-b border-white/10 px-5 pt-5 shrink-0 bg-white/[0.02]">
        <div className="flex items-center gap-2 text-white">
          <Clock size={18} className="text-blue-400 shrink-0" />
          <span className="font-bold text-xl">{formatDuration(routeResult.total_duration_min)}</span>
          <span className="text-white/60 font-medium text-lg">({Math.round(routeResult.total_distance_km)} km)</span>
          
          <div className="ml-auto flex items-center gap-1.5">
            {mode === 'readonly' ? (
              <button
                onClick={() => setShowRatingModal(true)}
                className="flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 transition-colors"
              >
                <Star size={13} className={savedRating ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400'} />
                <span className="text-yellow-400 text-xs font-semibold">
                  {savedRating ? `${savedRating}/5` : 'Değerlendir'}
                </span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving || isSaved}
                title={isSaved ? 'Kaydedildi' : saveError ? 'Kaydetme başarısız' : 'Rotayı Kaydet'}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  saveError ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-white/5 hover:bg-white/10',
                  (isSaving || isSaved) && 'cursor-default'
                )}
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                ) : (
                  <Bookmark size={14} className={
                    isSaved ? 'text-yellow-400 fill-yellow-400' :
                    saveError ? 'text-red-400' : 'text-white/70'
                  } />
                )}
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 hover:text-red-400 flex items-center justify-center transition-colors ml-1">
              <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-sm text-white/80 mt-1">
           {/* Row 1 */}
           <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-white/40 font-medium">Sürüş</span>
              <span className="font-bold text-white/90 text-[14px]">{formatDuration(driveTime)}</span>
           </div>
           <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-white/40 font-medium">Şarj</span>
              <span className="font-bold text-white/90 text-[14px]">{formatDuration(totalChargeTime)}</span>
           </div>
           <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-white/40 font-medium">Ortalama Tüketim</span>
              <span className="font-bold text-white/90 text-[14px]">{avgConsumption.toFixed(2)} km/kWh</span>
           </div>
           
           {/* Row 2 */}
           <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-white/40 font-medium">Harcanan Enerji</span>
              <span className="font-bold text-white/90 text-[14px]">{routeResult.consumption_kwh.toFixed(1)} kWh</span>
           </div>
           <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-white/40 font-medium">Şarj Maliyeti</span>
              <span className="font-bold text-white/90 text-[14px]">{routeResult.total_charging_cost.toFixed(0)} ₺</span>
           </div>
           <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-white/40 font-medium">CO₂ Emisyonu</span>
              <span className="font-bold text-white/90 text-[14px]">{routeResult.total_co2_savings_kg.toFixed(1)} kg</span>
           </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto px-5 py-3 custom-scrollbar">
         <div className="relative pb-6">
            
            {timelineNodes.map((node, i) => {
               if (node.type === 'start') {
                  return (
                     <div key={i} className="relative mb-0 flex items-center">
                        {/* Indicator Gutter */}
                        <div className="w-10 shrink-0 self-stretch flex justify-center items-center relative">
                           {/* Line segment: starts at center, goes down to next node */}
                           <div className="absolute top-1/2 bottom-[-2px] w-[2px] bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] z-0"></div>
                           {/* Pin */}
                           <div className="relative w-2.5 h-2.5 rounded-full bg-green-500 border-[3px] border-green-500/20 box-content shadow-[0_0_8px_rgba(34,197,94,0.8)] z-10"></div>
                        </div>

                        <div className="flex-1 flex flex-col gap-1 border border-white/10 bg-white/[0.02] p-3 rounded-2xl mt-1 mb-2">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                                 <span className="text-white font-semibold text-[14px] truncate" title={node.location}>{formatShortAddress(node.location)}</span>
                                 <WeatherIcon weather={node.weather} className="ml-1 shrink-0" />
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                 <span className="text-white/50 text-[12px] font-medium">{formatTime(node.time)}</span>
                                 <button className="text-white/30 hover:text-white transition-colors">
                                    <SlidersHorizontal size={14} />
                                 </button>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 text-white/50 text-[12px] mt-1">
                              <Battery size={14} className="text-white/40" />
                              <span className="font-semibold text-white/70">%{Math.round(node.soc)}</span>
                           </div>
                        </div>
                     </div>
                  );
               }

               if (node.type === 'leg') {
                  return (
                     <div key={i} className="relative flex items-center">
                        {/* Indicator Gutter */}
                        <div className="w-10 shrink-0 self-stretch flex justify-center items-center relative">
                           {/* Line segment: fades from bright to dim */}
                           <div className="absolute top-0 bottom-[-2px] w-[2px] bg-gradient-to-b from-green-500 to-green-500/10 shadow-[0_0_8px_rgba(34,197,94,0.2)] z-0"></div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-[11px] text-white/50 ml-1 my-1">
                           <div className="flex items-center gap-1.5"><Navigation size={12} className="text-white/30" /> {Math.round(node.distance)} km</div>
                           <div className="w-1 h-1 rounded-full bg-white/10" />
                           <div className="flex items-center gap-1.5"><Clock size={12} className="text-white/30" /> {formatDuration(node.duration)}</div>
                           <div className="w-1 h-1 rounded-full bg-white/10" />
                           <div className="flex items-center gap-1.5"><Battery size={12} className="text-white/30" /> {node.consumption.toFixed(1)} kWh</div>
                        </div>
                     </div>
                  );
               }

               if (node.type === 'waypoint') {
                  return (
                     <div key={i} className="relative flex items-center">
                        <div className="w-10 shrink-0 self-stretch flex justify-center items-center relative">
                           <div className="absolute top-0 bottom-[-2px] w-[2px] bg-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)] z-0"></div>
                           <div className="relative w-2.5 h-2.5 rounded-full bg-amber-500 border-[3px] border-amber-500/20 box-content shadow-[0_0_8px_rgba(245,158,11,0.8)] z-10"></div>
                        </div>
                        <div className="flex-1 flex items-center gap-2 border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2 rounded-xl my-1">
                           <MapPin size={14} className="text-amber-400 shrink-0" />
                           <span className="text-white/70 text-[11px] font-semibold shrink-0">{node.index}. Durak</span>
                           <span className="text-white/80 text-[12px] truncate" title={node.location}>{formatShortAddress(node.location)}</span>
                        </div>
                     </div>
                  );
               }

               if (node.type === 'stop') {
                  return (
                    <StopCard
                      key={i}
                      stop={node.stop as ChargingStopDto}
                      nodeIndex={i}
                      arrivalTime={node.arrivalTime}
                      setSelectedStation={setSelectedStation}
                    />
                  );
               }

               if (node.type === 'end') {
                  return (
                     <div key={i} className="relative flex items-center">
                        {/* Indicator Gutter */}
                        <div className="w-10 shrink-0 self-stretch flex justify-center items-center relative">
                           {/* Line segment: arrives dim, glows at destination */}
                           <div className="absolute top-0 h-[calc(50%+2px)] w-[2px] bg-gradient-to-b from-green-500/10 to-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] z-0"></div>
                           {/* Pin */}
                           <div className="relative w-2.5 h-2.5 rounded-full bg-green-500 border-[3px] border-green-500/20 box-content shadow-[0_0_8px_rgba(34,197,94,0.8)] z-10"></div>
                        </div>

                        <div className="flex-1 flex flex-col gap-1 border border-white/10 bg-white/[0.02] p-3 rounded-2xl mt-2 mb-1">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                                 <span className="text-white font-semibold text-[14px] truncate" title={node.location}>{formatShortAddress(node.location)}</span>
                                 <WeatherIcon weather={node.weather} className="ml-1 shrink-0" />
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                 <span className="text-white/50 text-[12px] font-medium">{formatTime(node.time)}</span>
                                 <button className="text-white/30 hover:text-white transition-colors">
                                    <SlidersHorizontal size={14} />
                                 </button>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 text-white/50 text-[12px] mt-1">
                              <Battery size={14} className="text-white/40" />
                              <span className="font-semibold text-white/70">%{Math.round(node.soc)}</span>
                           </div>
                        </div>
                     </div>
                  );
               }

               return null;
            })}
         </div>
      </div>
    </motion.div>

    {showRatingModal && savedId && (
      <RouteRatingModal
        savedRouteId={savedId}
        existingRating={savedRating}
        existingComment={savedComment}
        onRate={handleRate}
        onClose={() => setShowRatingModal(false)}
      />
    )}
  </>
  );
}

