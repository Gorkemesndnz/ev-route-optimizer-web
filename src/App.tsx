import { APIProvider } from "@vis.gl/react-google-maps";
import BackgroundMap from "./components/BackgroundMap";
import Sidebar from "./components/Sidebar";
import VehicleCard from "./components/VehicleCard";
import RouteSettingsModal from "./components/RouteSettingsModal";
import MyGarageModal from "./components/MyGarageModal";
import VehicleSettingsModal from "./components/VehicleSettingsModal";
import { useState } from "react";

function App() {
  const [isRouteSettingsOpen, setRouteSettingsOpen] = useState(false);
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

      {/* Floating UI Elements */}
      <div className="absolute inset-0 pointer-events-none p-4 md:p-6 lg:p-8 flex flex-col gap-6 z-10 items-start justify-start">
        
        {/* 2. Route Planning Sidebar */}
        <Sidebar onOpenRouteSettings={() => setRouteSettingsOpen(true)} />

        {/* 4. Main Vehicle Card */}
        <VehicleCard 
          selectedVehicle={selectedVehicle}
          onOpenGarage={() => setGarageOpen(true)}
          onOpenVehicleSettings={() => setVehicleSettingsOpen(true)}
        />
        
      </div>

      {/* 3. Route Settings Modal */}
      <RouteSettingsModal 
        isOpen={isRouteSettingsOpen} 
        onClose={() => setRouteSettingsOpen(false)} 
      />

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
