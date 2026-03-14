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
        <div className="absolute inset-0 pointer-events-none p-4 md:p-6 lg:p-8 flex items-start justify-start z-40 overflow-hidden">
          <div className="relative w-full sm:w-[400px]">
            
            {/* MAIN VIEW */}
            <div 
              className={`flex flex-col gap-6 w-full ${
                activeView === 'main' 
                  ? 'opacity-100 pointer-events-auto transition-opacity duration-300' 
                  : 'opacity-0 pointer-events-none transition-none absolute'
              }`}
            >
              <Sidebar onOpenRouteSettings={() => setActiveView('settings')} />
              
              <VehicleCard 
                selectedVehicle={selectedVehicle}
                onOpenGarage={() => setGarageOpen(true)}
                onOpenVehicleSettings={() => setVehicleSettingsOpen(true)}
              />
            </div>

            {/* SETTINGS VIEW */}
            <div 
              className={`absolute top-0 w-full transition-all duration-300 ease-in-out ${
                activeView === 'settings' 
                  ? 'left-0 opacity-100 pointer-events-auto' 
                  : '-left-[110%] opacity-0 pointer-events-none'
              }`}
            >
              <RouteSettingsView onBack={() => setActiveView('main')} />
            </div>

          </div>
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
