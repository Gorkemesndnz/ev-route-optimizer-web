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
import CookieConsent from "./components/CookieConsent";
import GeneralMenu from "./components/GeneralMenu";
import StationDetailsPanel from "./components/StationDetailsPanel";
import { LogOut } from "lucide-react";
import { translations } from "./lib/translations";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { useSettings } from "./contexts/SettingsContext";
import { useAuth } from "./contexts/AuthContext";
import { useVehicle } from "./contexts/VehicleContext";
import { useStation } from "./contexts/StationContext";

function App() {
  const [activeView, setActiveView] = useState<'main' | 'settings' | 'garage' | 'add_vehicle' | 'vehicle_settings' | 'account' | 'privacy' | 'about' | 'terms' | 'station_details'>('main');
  const [previousView, setPreviousView] = useState<'main' | 'account' | 'settings' | 'garage' | 'add_vehicle' | 'vehicle_settings' | 'privacy' | 'about' | 'terms' | 'station_details'>('main');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedTouristSpot, setSelectedTouristSpot] = useState<{lat: number, lng: number, name: string} | null>(null);
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);

  const {
    language, getMapStyle, showTraffic,
    setShowCookieModal,
  } = useSettings();

  const t = translations[language];

  const {
    currentUser, setCurrentUser, logout,
    setIsAuthModalOpen,
  } = useAuth();

  const {
    vehicles,
  } = useVehicle();

  const { selectedStation, setSelectedStation } = useStation();

  // İstasyon seçildiğinde sol paneli aç
  useEffect(() => {
    if (selectedStation) {
      if (activeView !== 'station_details') {
        setPreviousView(activeView);
        setActiveView('station_details');
      }
    }
  }, [selectedStation]);

  const mapStyle = useMemo(() => getMapStyle() as google.maps.MapTypeStyle[], [getMapStyle]);

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!API_KEY) {
    return (
      <div className="w-screen h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">{t.apiErrorTitle}</h1>
        <p className="text-white/70 max-w-md">
          {t.apiErrorMessage}
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="relative w-screen h-[100svh] overflow-hidden bg-zinc-950">
        {/* 1. Background Map */}
        <BackgroundMap 
          userLocation={userLocation} 
          selectedTouristSpot={selectedTouristSpot}
          mapStyle={mapStyle} 
          showTraffic={showTraffic}
        />

        {/* 2. Map Controls (Bottom Right) */}
        <MapControls 
          onLocateUser={setUserLocation} 
        />

        {/* Map Blur Overlay */}
        <AnimatePresence>
          {activeView !== 'main' && (
            <motion.div
              key="map-blur"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                if (activeView === 'station_details') setSelectedStation(null);
                setActiveView('main');
              }}
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
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className="flex flex-col gap-6 relative z-40 pointer-events-none"
              >
                <Sidebar 
                  onOpenRouteSettings={() => setActiveView('settings')} 
                />

                <VehicleCard
                  onOpenGarage={() => { setPreviousView('main'); setActiveView('garage'); }}
                  onOpenAddVehicle={() => { setPreviousView('main'); setActiveView('add_vehicle'); }}
                  onOpenVehicleSettings={() => { setPreviousView('main'); setActiveView('vehicle_settings'); }}
                />
              </motion.div>
            )}

            {activeView === 'station_details' && (
              <motion.div
                key="station_details"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className="relative z-40 pointer-events-none"
              >
                <StationDetailsPanel 
                  onSelectTouristSpot={setSelectedTouristSpot}
                  onBack={() => {
                    setActiveView('main');
                    setSelectedStation(null);
                    setSelectedTouristSpot(null);
                  }} 
                />
              </motion.div>
            )}

            {activeView === 'settings' && (
              <motion.div
                key="settings"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className="relative z-40 pointer-events-none"
              >
                <RouteSettingsView 
                  onBack={() => setActiveView('main')} 
                />
              </motion.div>
            )}

            {activeView === 'garage' && (
              <motion.div
                key="garage"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className="relative z-40 pointer-events-none"
              >
                <GarageView 
                  onAddVehicle={() => setActiveView('add_vehicle')}
                  onBack={() => setActiveView(previousView === 'account' ? 'account' : 'main')}
                />
              </motion.div>
            )}

            {activeView === 'add_vehicle' && (
              <motion.div
                key="add_vehicle"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className="relative z-40 pointer-events-none"
              >
                <AddVehicleView 
                  onBack={() => setActiveView(vehicles.length > 0 ? 'garage' : (previousView === 'account' ? 'account' : 'main'))}
                  onVehicleAdded={() => {
                    setActiveView(previousView === 'account' ? 'account' : 'main');
                  }}
                />
              </motion.div>
            )}
            {activeView === 'vehicle_settings' && (
              <motion.div
                key="vehicle_settings"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
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
                className="relative z-50 pointer-events-none"
              >
                <AccountDashboard 
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
            <div className="flex flex-row-reverse items-center group overflow-hidden py-1">
              <button 
                onClick={() => setActiveView('account')}
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center font-bold text-sm text-white border border-white/20 shadow-none shrink-0 z-10 hover:border-white/40 transition-all outline-none"
              >
                {currentUser.firstName?.charAt(0).toUpperCase() || ''}{currentUser.lastName?.charAt(0).toUpperCase() || ''}
              </button>
              
              <div className="flex items-center overflow-hidden transition-all duration-300 ease-in-out max-w-0 opacity-0 group-hover:max-w-[70px] group-hover:opacity-100 group-hover:mr-2">
                <button 
                  onClick={() => { logout(); setActiveView('main'); }}
                  title={t.logout}
                  className="w-10 h-10 shrink-0 rounded-full glass-panel flex items-center justify-center text-red-500 hover:text-red-400 border border-white/20 shadow-none transition-all hover:bg-white/10 outline-none"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="glass-panel shadow-none px-4 h-10 flex items-center justify-center font-semibold text-sm hover:bg-white/10 transition-all border-white/20 active:scale-95 text-white"
            >
              {t.login}
            </button>
          )}

          <button 
            onClick={() => setIsRightMenuOpen(true)}
            className="glass-panel shadow-none p-2 flex flex-col items-center justify-center gap-[4px] w-10 h-10 hover:bg-white/10 transition-all border-white/20 active:scale-95"
          >
            <div className="w-4 h-px bg-white rounded-full" />
            <div className="w-4 h-px bg-white rounded-full" />
            <div className="w-4 h-px bg-white rounded-full" />
          </button>
        </div>

        {/* Modals */}
        <AuthModal 
          onLogin={(user) => { setCurrentUser(user); setActiveView('account'); }}
        />

        {/* Right General Menu */}
        <GeneralMenu 
          isOpen={isRightMenuOpen} 
          onClose={() => setIsRightMenuOpen(false)} 
          onOpenCookieConsent={() => { setShowCookieModal(true); setIsRightMenuOpen(false); }}
        />

        {/* Global Floating Elements */}
        <CookieConsent 
          onOpenPrivacy={() => { 
            window.open('/home/gizlilik', '_blank');
            setShowCookieModal(false); 
          }}
        />
      </div>
    </APIProvider>
  );
}

export default App;
