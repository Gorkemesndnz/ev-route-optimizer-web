import { useState } from "react";
import { X, User, Car, Map, Settings, Battery, Zap, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { translations } from "../lib/translations";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  batteryCapacity: number;
  maxChargingPower: number;
  rangeWLTP: number;
  plugType: string;
  soc?: number;
}

import { useAuth } from "../contexts/AuthContext";
import { useVehicle } from "../contexts/VehicleContext";
import { useSettings } from "../contexts/SettingsContext";

export default function AccountDashboard({
  onClose,
  onChangeVehicle,
}: {
  onClose: () => void;
  onChangeVehicle: () => void;
}) {
  const { language } = useSettings();
  const { currentUser: user } = useAuth();
  const { selectedVehicle: activeVehicle } = useVehicle();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'prices'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[language];

  if (!user) return null; // Safe guard for missing user

  const mockRoutes = [
    { id: 1, route: language === 'tr' ? "İstanbul -> Ankara" : "Istanbul -> Ankara", date: "12 Mar 2026", duration: language === 'tr' ? "4s 15dk" : "4h 15m", energy: "45 kWh" },
    { id: 2, route: language === 'tr' ? "İzmir -> Bodrum" : "Izmir -> Bodrum", date: "05 Mar 2026", duration: language === 'tr' ? "2s 40dk" : "2h 40m", energy: "28 kWh" },
  ];

  const mockPrices = [
    { provider: "ZES", ac: "₺8.40/kWh", dc: "₺10.50/kWh" },
    { provider: "Eşarj", ac: "₺8.25/kWh", dc: "₺10.80/kWh" },
    { provider: "Trugo", ac: "₺8.50/kWh", dc: "₺10.20/kWh" },
    { provider: "Astor Şarj", ac: "₺8.00/kWh", dc: "₺9.80/kWh" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-5xl glass-panel flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/10">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-wide">{t.yourAccount}</h2>
            <p className="text-cyan-400 font-medium mt-1 uppercase tracking-wider text-sm">
              {user.firstName} {user.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2 p-6 md:px-8 border-b border-white/5 bg-white/5 overflow-x-auto hide-scrollbar">
          {[
            { id: 'overview', label: t.overview },
            { id: 'profile', label: t.updateProfile },
            { id: 'prices', label: t.chargingPrices }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'profile' | 'prices')}
              className={cn(
                "whitespace-nowrap px-5 py-2.5 font-semibold text-sm rounded-lg outline-none transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-cyan-400 text-zinc-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div 
          className={cn(
            "p-6 md:p-8 overflow-y-auto flex-1 min-h-[500px] grid grid-cols-1 pr-4 md:pr-6",
            activeTab === 'overview' ? "hide-scrollbar" : "custom-scrollbar"
          )}
        >
          <AnimatePresence mode="popLayout">

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
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
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

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
                            <span className="text-sm font-semibold text-white">{activeVehicle.batteryCapacity} kWh</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="text-amber-400/70" size={18} />
                          <div className="flex flex-col">
                            <span className="text-xs text-white/50">{t.maxPower}</span>
                            <span className="text-sm font-semibold text-white">{activeVehicle.maxChargingPower} kW</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="text-cyan-400/70" size={18} />
                          <div className="flex flex-col">
                            <span className="text-xs text-white/50">{t.wltpRange}</span>
                            <span className="text-sm font-semibold text-white">{activeVehicle.rangeWLTP} km</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Map className="text-emerald-400/70" size={18} />
                          <div className="flex flex-col">
                            <span className="text-xs text-white/50">{t.estRange}</span>
                            <span className="text-sm font-semibold text-white">{Math.round(activeVehicle.rangeWLTP * 0.85)} km</span>
                          </div>
                        </div>
                      </div>

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
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="col-start-1 row-start-1 max-w-2xl mx-auto flex flex-col gap-6 w-full"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white/70">{t.firstNameLabel}</label>
                    <input type="text" defaultValue={user.firstName} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white/70">{t.lastNameLabel}</label>
                    <input type="text" defaultValue={user.lastName} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/70">{t.emailLabel}</label>
                  <input type="email" defaultValue={user.email} disabled className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-white/50 cursor-not-allowed font-medium" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/70">{t.phoneLabel}</label>
                  <input type="tel" defaultValue={user.phone} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium font-mono" />
                </div>

                <h4 className="text-lg font-bold text-white mt-4 border-t border-white/10 pt-6">{t.changePass}</h4>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/70">{t.currentPass}</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/70">{t.newPass}</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium" />
                </div>

                <div className="flex justify-end mt-4">
                  <button className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    {t.saveChanges}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Prices Tab */}
            {activeTab === 'prices' && (
              <motion.div
                key="prices"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="col-start-1 row-start-1 w-full flex flex-col gap-6"
              >
                <div className="flex gap-4 mb-2">
                  <input
                    type="text"
                    placeholder={t.searchProvider}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/40 shadow-inner"
                  />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-3 bg-black/40 p-4 border-b border-white/10">
                    <div className="text-white/50 font-medium text-sm">{t.provider}</div>
                    <div className="text-white/50 font-medium text-sm">{t.acCharge}</div>
                    <div className="text-white/50 font-medium text-sm">{t.dcCharge}</div>
                  </div>
                  {mockPrices.filter(p => p.provider.toLowerCase().includes(searchQuery.toLowerCase())).map((price, i) => (
                    <div key={i} className="grid grid-cols-3 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center">
                      <div className="text-white font-bold">{price.provider}</div>
                      <div className="text-emerald-400 font-mono">{price.ac}</div>
                      <div className="text-amber-400 font-mono">{price.dc}</div>
                    </div>
                  ))}
                  <div className="p-4 bg-white/5 text-xs text-white/40 text-center">
                    {t.priceNotice}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
