import type { Vehicle } from "../../types/vehicle";
import { motion } from "framer-motion";
import { translations } from "../../lib/translations";
import { Car, Battery, Zap, Navigation, Map } from "lucide-react";
import { useRef } from "react";

type TranslationType = typeof translations.tr;

interface Route {
  id: string | number;
  route: string;
  date: string;
  duration: string;
  energy: string;
}

interface AccountOverviewTabProps {
  t: TranslationType;
  activeVehicle: Vehicle | null;
  vehicles: Vehicle[];
  selectVehicle: (id: string) => Promise<void>;
  mockRoutes: Route[]; // Changed from any[] to Route[]
  onChangeVehicle: () => void;
}

export default function AccountOverviewTab({
  t,
  activeVehicle,
  vehicles,
  selectVehicle,
  mockRoutes,
  onChangeVehicle,
}: AccountOverviewTabProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      // Dikey scroll (deltaY) kaydırmasını yatay (scrollLeft) yap
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const inactiveVehicles = vehicles.filter(v => v.id !== activeVehicle?.id);
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="col-start-1 row-start-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      {/* Left Column: Active Vehicle */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Car className="text-cyan-400" size={24} />
          <h3 className="text-xl font-bold text-white">{t.selectedVehicle}</h3>
        </div>

        {activeVehicle ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-2xl font-bold text-white">{activeVehicle.brand}</h4>
                <p className="text-white/60 font-medium">{activeVehicle.model} {activeVehicle.variant}</p>
              </div>
              <div className="px-3 py-1 bg-cyan-400/20 text-cyan-400 rounded-full text-xs font-bold border border-cyan-400/30">
                {t.active}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Battery className="text-white/40" size={18} />
                <div className="flex flex-col">
                  <span className="text-xs text-white/50">{t.capacity}</span>
                  <span className="text-sm font-semibold text-white">{activeVehicle.batteryCapacityKwh ?? 0} kWh</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="text-amber-400/70" size={18} />
                <div className="flex flex-col">
                  <span className="text-xs text-white/50">{t.maxPower}</span>
                  <span className="text-sm font-semibold text-white">{activeVehicle.maxChargingPowerKw ?? 0} kW</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="text-cyan-400/70" size={18} />
                <div className="flex flex-col">
                  <span className="text-xs text-white/50">{t.wltpRange}</span>
                  <span className="text-sm font-semibold text-white">{activeVehicle.rangeWLTP ?? 0} km</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Map className="text-emerald-400/70" size={18} />
                <div className="flex flex-col">
                  <span className="text-xs text-white/50">{t.estRange}</span>
                  <span className="text-sm font-semibold text-white">{activeVehicle.realRangeKm ?? 0} km</span>
                </div>
              </div>
            </div>

            {/* Quick Switch */}
            {inactiveVehicles.length > 0 && (
              <div className="mt-2 pt-4 border-t border-white/10">
                <p className="text-xs text-white/50 mb-3">{t.myVehicles}</p>
                <div 
                  ref={scrollRef}
                  onWheel={handleScroll}
                  className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1 cursor-ew-resize"
                >
                  {inactiveVehicles.map(v => (
                    <button
                      key={v.id}
                      onClick={() => selectVehicle(v.id)}
                      className="flex-shrink-0 flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all active:scale-95"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                        <Car size={16} />
                      </div>
                      <div className="flex flex-col text-left mr-4">
                        <span className="text-sm font-bold text-white">{v.customName || v.model}</span>
                        <span className="text-[10px] text-white/40">{v.soc}% {t.capacity}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onChangeVehicle}
              className="w-full mt-2 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold text-white transition-all active:scale-95"
            >
              {t.changeVehicleBtn}
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/30">
              <Car size={32} />
            </div>
            <div>
              <p className="text-white font-medium">{t.garageEmpty}</p>
              <p className="text-sm text-white/50 mt-1">{t.addVehiclePrompt}</p>
            </div>
            <button
              onClick={onChangeVehicle}
              className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all active:scale-95 mt-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              {t.addVehicle}
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Recent Routes */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Map className="text-cyan-400" size={24} />
          <h3 className="text-xl font-bold text-white">{t.recentRoutes}</h3>
        </div>

        <div className="flex flex-col gap-3">
          {mockRoutes.length > 0 ? (
            mockRoutes.map((route) => (
              <div key={route.id} className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-5 flex items-center justify-between group cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-lg">{route.route}</span>
                  <span className="text-white/50 text-sm">{route.date}</span>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-cyan-400 font-medium text-sm">{route.duration}</span>
                  <span className="text-white/60 text-xs">{route.energy}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/50">
              {t.noRecentRoutes}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
