import { APIProvider } from "@vis.gl/react-google-maps";
import BackgroundMap from "./components/BackgroundMap";
import Sidebar from "./components/Sidebar";
import VehicleCard from "./components/VehicleCard";
import RouteSettingsView from "./components/RouteSettingsView";
import MyGarageModal from "./components/MyGarageModal";
import VehicleSettingsModal from "./components/VehicleSettingsModal";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const [activeView, setActiveView] = useState<'main' | 'settings'>('main');
  const [isGarageOpen, setGarageOpen] = useState(false);
  const [isVehicleSettingsOpen, setVehicleSettingsOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Hardcoded for demo
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSy_demo";

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="relative w-screen h-[100svh] overflow-hidden bg-zinc-950">
        {/* 1. Background Map */}
        <BackgroundMap />

        {/* Map Blur Overlay (New Feature) */}
        <AnimatePresence>
          {activeView === 'settings' && (
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
                  onOpenGarage={() => setGarageOpen(true)}
                  onOpenVehicleSettings={() => setVehicleSettingsOpen(true)}
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
          </AnimatePresence>
        </div>

        {/* 5. My Garage Modal */}
        <MyGarageModal 
          isOpen={isGarageOpen} 
          onClose={() => setGarageOpen(false)} 
          onSelectVehicle={(vehicle) => {
            setSelectedVehicle(vehicle);
            setGarageOpen(false);
          }}
        />

        {/* 6. Vehicle & Driver Settings Modal */}
        <VehicleSettingsModal 
          isOpen={isVehicleSettingsOpen} 
          onClose={() => setVehicleSettingsOpen(false)} 
        />

      </div>
    </APIProvider>
  );
}

export default App;
