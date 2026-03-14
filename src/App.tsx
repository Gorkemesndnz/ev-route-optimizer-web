import { APIProvider } from "@vis.gl/react-google-maps";
import BackgroundMap from "./components/BackgroundMap";
import Sidebar from "./components/Sidebar";
import VehicleCard from "./components/VehicleCard";
import RouteSettingsView from "./components/RouteSettingsView";
import GarageView from "./components/GarageView";
import AddVehicleView from "./components/AddVehicleView";
import VehicleSettingsView from "./components/VehicleSettingsView";
import MapControls from "./components/MapControls";
import { lightMapStyle, darkMapStyle } from "./lib/mapStyles";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const [activeView, setActiveView] = useState<'main' | 'settings' | 'garage' | 'add_vehicle' | 'vehicle_settings'>('main');
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapStyleKey, setMapStyleKey] = useState<'default' | 'light' | 'dark' | 'satellite'>('dark');
  const [showTraffic, setShowTraffic] = useState(true);

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
                  onOpenGarage={() => setActiveView('garage')}
                  onOpenAddVehicle={() => setActiveView('add_vehicle')}
                  onOpenVehicleSettings={() => setActiveView('vehicle_settings')}
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
                  onBack={() => setActiveView('main')}
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
                  onBack={() => setActiveView(vehicles.length > 0 ? 'garage' : 'main')}
                  onVehicleAdded={(vehicle) => {
                    setVehicles(prev => [...prev, vehicle]);
                    setSelectedVehicleId(vehicle.id);
                    setActiveView('main');
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
          </AnimatePresence>
        </div>

      </div>
    </APIProvider>
  );
}

export default App;
