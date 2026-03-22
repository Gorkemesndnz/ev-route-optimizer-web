import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { translations } from "../lib/translations";
import { useAuth } from "../contexts/AuthContext";
import { useVehicle } from "../contexts/VehicleContext";
import { useSettings } from "../contexts/SettingsContext";

// Sub-components
import AccountOverviewTab from "./account/AccountOverviewTab";
import AccountProfileTab from "./account/AccountProfileTab";
import AccountPricesTab from "./account/AccountPricesTab";

export default function AccountDashboard({
  onClose,
  onChangeVehicle,
}: {
  onClose: () => void;
  onChangeVehicle: () => void;
}) {
  const { language } = useSettings();
  const { currentUser: user } = useAuth();
  const { selectedVehicle: activeVehicle, vehicles, selectVehicle } = useVehicle();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'prices'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[language];

  if (!user) return null;

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
            {activeTab === 'overview' && (
              <AccountOverviewTab 
                t={t} 
                activeVehicle={activeVehicle} 
                vehicles={vehicles}
                selectVehicle={selectVehicle}
                mockRoutes={mockRoutes} 
                onChangeVehicle={onChangeVehicle} 
              />
            )}

            {activeTab === 'profile' && (
              <AccountProfileTab 
                t={t} 
                user={user} 
              />
            )}

            {activeTab === 'prices' && (
              <AccountPricesTab 
                t={t} 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                mockPrices={mockPrices} 
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
