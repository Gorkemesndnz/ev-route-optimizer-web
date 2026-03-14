import { APIProvider } from "@vis.gl/react-google-maps";
import BackgroundMap from "./components/BackgroundMap";
import Sidebar from "./components/Sidebar";
import VehicleCard from "./components/VehicleCard";
import RouteSettingsView from "./components/RouteSettingsView";
import GarageView from "./components/GarageView";
import AddVehicleView from "./components/AddVehicleView";
import VehicleSettingsView from "./components/VehicleSettingsView";
import MapControls from "./components/MapControls";
import AuthModal from "./components/AuthModal";
import AccountDashboard from "./components/AccountDashboard";
import { User, LogOut } from "lucide-react";
import { lightMapStyle, darkMapStyle } from "./lib/mapStyles";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const [activeView, setActiveView] = useState<'main' | 'settings' | 'garage' | 'add_vehicle' | 'vehicle_settings' | 'account'>('main');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapStyleKey, setMapStyleKey] = useState<'default' | 'light' | 'dark' | 'satellite'>('dark');
  const [showTraffic, setShowTraffic] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [previousView, setPreviousView] = useState<'main' | 'account'>('main');

  // Sync with system theme on mount
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setMapStyleKey(isDark ? 'dark' : 'light');
  }, []);

  const getMapStyle = () => {
    if (mapStyleKey === 'light') return lightMapStyle;
    if (mapStyleKey === 'dark') return darkMapStyle;
    return [];
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || null;

  // Hardcoded for demo
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSy_demo";

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="relative w-screen h-[100svh] overflow-hidden bg-zinc-950">
        {/* 1. Background Map */}
        <BackgroundMap 
          userLocation={userLocation} 
          mapStyle={getMapStyle() as google.maps.MapTypeStyle[]} 
          showTraffic={showTraffic}
        />

        {/* 2. Map Controls (Bottom Right) */}
        <MapControls 
          onLocateUser={setUserLocation} 
          currentStyle={mapStyleKey}
          onStyleChange={setMapStyleKey}
          showTraffic={showTraffic}
          onToggleTraffic={() => setShowTraffic(!showTraffic)}
        />

        {/* Map Blur Overlay (New Feature) */}
        <AnimatePresence>
          {activeView !== 'main' && (
            <motion.div
              key="map-blur"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setActiveView('main')}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 pointer-events-auto cursor-pointer"
            />
          )}
        </AnimatePresence>

        {/* Floating UI Elements */}
        <div className="absolute inset-0 pointer-events-none p-4 md:p-6 lg:p-8 flex items-start justify-start z-40">
          <AnimatePresence mode="wait" initial={false}>
            {activeView === 'main' && (
              <motion.div
                key="main"
                initial={{ left: -50, opacity: 0 }}
                animate={{ left: 0, opacity: 1 }}
                exit={{ left: -50, opacity: 0 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className="flex flex-col gap-6 relative z-40 pointer-events-none"
              >
                <Sidebar onOpenRouteSettings={() => setActiveView('settings')} />

                <VehicleCard
                  selectedVehicle={selectedVehicle}
                  onOpenGarage={() => { setPreviousView('main'); setActiveView('garage'); }}
                  onOpenAddVehicle={() => { setPreviousView('main'); setActiveView('add_vehicle'); }}
                  onOpenVehicleSettings={() => { setPreviousView('main'); setActiveView('vehicle_settings'); }}
                  onUpdateSoC={(soc) => {
                    setVehicles(prev => prev.map(v => v.id === selectedVehicleId ? { ...v, soc } : v));
                  }}
                />
              </motion.div>
            )}

            {activeView === 'settings' && (
              <motion.div
                key="settings"
                initial={{ left: 50, opacity: 0 }}
                animate={{ left: 0, opacity: 1 }}
                exit={{ left: 50, opacity: 0 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className="relative z-40 pointer-events-none"
              >
                <RouteSettingsView onBack={() => setActiveView('main')} />
              </motion.div>
            )}

            {activeView === 'garage' && (
              <motion.div
                key="garage"
                initial={{ left: 50, opacity: 0 }}
                animate={{ left: 0, opacity: 1 }}
                exit={{ left: 50, opacity: 0 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className="relative z-40 pointer-events-none"
              >
                <GarageView 
                  vehicles={vehicles}
                  selectedVehicleId={selectedVehicleId}
                  onSelectVehicle={(id) => setSelectedVehicleId(id)}
                  onRenameVehicle={(id, newName) => {
                    setVehicles(prev => prev.map(v => v.id === id ? { ...v, customName: newName } : v));
                  }}
                  onDeleteVehicle={(id) => {
                    const newVehicles = vehicles.filter(v => v.id !== id);
                    setVehicles(newVehicles);
                    if (selectedVehicleId === id) {
                      setSelectedVehicleId(newVehicles.length > 0 ? newVehicles[0].id : null);
                    }
                  }}
                  onAddVehicle={() => setActiveView('add_vehicle')}
                  onBack={() => setActiveView(previousView === 'account' ? 'account' : 'main')}
                />
              </motion.div>
            )}

            {activeView === 'add_vehicle' && (
              <motion.div
                key="add_vehicle"
                initial={{ left: 50, opacity: 0 }}
                animate={{ left: 0, opacity: 1 }}
                exit={{ left: 50, opacity: 0 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className="relative z-40 pointer-events-none"
              >
                <AddVehicleView 
                  onBack={() => setActiveView(vehicles.length > 0 ? 'garage' : (previousView === 'account' ? 'account' : 'main'))}
                  onVehicleAdded={(vehicle) => {
                    setVehicles(prev => [...prev, vehicle]);
                    setSelectedVehicleId(vehicle.id);
                    setActiveView(previousView === 'account' ? 'account' : 'main');
                  }}
                />
              </motion.div>
            )}
            {activeView === 'vehicle_settings' && (
              <motion.div
                key="vehicle_settings"
                initial={{ left: 50, opacity: 0 }}
                animate={{ left: 0, opacity: 1 }}
                exit={{ left: 50, opacity: 0 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className="relative z-40 pointer-events-none"
              >
                <VehicleSettingsView onBack={() => setActiveView('main')} />
              </motion.div>
            )}
            {activeView === 'account' && currentUser && (
              <motion.div
                key="account"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-50"
              >
                <AccountDashboard 
                  user={currentUser}
                  activeVehicle={selectedVehicle}
                  onChangeVehicle={() => { setPreviousView('account'); setActiveView('garage'); }}
                  onClose={() => setActiveView('main')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Top Right Actions (Menu & Auth) */}
        <div className="absolute top-6 right-6 z-40 flex items-center gap-3 pointer-events-auto">
          {currentUser ? (
            <div className="flex items-center group overflow-hidden py-1">
              {/* 1. Hidden Logout Menu (Solda açılır) */}
              <div className="flex items-center overflow-hidden transition-all duration-300 ease-out max-w-0 opacity-0 group-hover:max-w-[60px] group-hover:opacity-100 group-hover:mr-2">
                <button 
                  onClick={() => setCurrentUser(null)}
                  title="Çıkış Yap"
                  className="w-10 h-10 shrink-0 rounded-full glass-panel flex items-center justify-center text-red-500 hover:text-red-400 border border-white/20 shadow-lg transition-all hover:bg-white/10"
                >
                  <LogOut size={18} />
                </button>
              </div>

              {/* 2. Avatar (Sağda sabit, baş harfleri beyaz) */}
              <button 
                onClick={() => setActiveView('account')}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center font-bold text-sm text-white border border-white/20 shadow-lg shrink-0 z-10 hover:border-white/40 transition-all"
              >
                {currentUser.firstName?.charAt(0).toUpperCase() || ''}{currentUser.lastName?.charAt(0).toUpperCase() || ''}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="glass-panel px-4 py-2 font-semibold text-sm hover:bg-white/10 transition-all border-white/20 active:scale-95 text-white"
            >
              Giriş Yap
            </button>
          )}

          <button 
            className="glass-panel p-2 flex flex-col items-center justify-center gap-[4px] w-10 h-10 hover:bg-white/10 transition-all border-white/20 active:scale-95"
          >
            <div className="w-4 h-px bg-white rounded-full" />
            <div className="w-4 h-px bg-white rounded-full" />
            <div className="w-4 h-px bg-white rounded-full" />
          </button>
        </div>

        {/* Modals */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onLogin={(user) => { setCurrentUser(user); setActiveView('account'); }}
        />
      </div>
    </APIProvider>
  );
}

export default App;
