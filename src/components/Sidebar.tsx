import { useState } from "react";
import { GripVertical, ArrowDownUp, MapPin, Search } from "lucide-react";
import { Button } from "./ui/button";

export default function Sidebar({ onOpenRouteSettings }: { onOpenRouteSettings: () => void }) {
  const [locations, setLocations] = useState([
    { id: "start", type: "start", label: "Başlangıç Noktası", value: "" },
    { id: "end", type: "end", label: "Varış Noktası", value: "" },
  ]);

  const handleSwap = () => {
    setLocations([locations[1], locations[0]]);
  };

  return (
    <div className="glass-panel w-full sm:w-[380px] p-5 pointer-events-auto flex flex-col gap-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold tracking-tight text-white">Rota Planlama</h2>
      </div>

      <div className="relative flex flex-col gap-4">
        {locations.map((loc, index) => (
          <div key={loc.id} className="flex flex-row items-center gap-3">
            <button className="text-white/40 hover:text-white cursor-grab active:cursor-grabbing p-1 rounded-md transition-colors">
              <GripVertical size={18} />
            </button>
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                {index === 0 ? <MapPin size={16} /> : <Search size={16} />}
              </div>
              <input 
                type="text" 
                placeholder={loc.label}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-medium"
              />
            </div>
          </div>
        ))}

        <button 
          onClick={handleSwap}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-zinc-800 text-white hover:text-white border border-white/20 p-2 rounded-full transition-all duration-200 active:scale-90 hover:bg-zinc-700 shadow-xl z-10"
        >
          <ArrowDownUp size={14} />
        </button>
      </div>

      <div className="flex flex-row gap-3 mt-2">
        <Button 
          variant="outline" 
          className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95 rounded-xl h-11"
        >
          + Durak Ekle
        </Button>
        <Button 
          onClick={onOpenRouteSettings}
          className="flex-[1.2] bg-white text-black hover:bg-zinc-200 transition-all duration-200 active:scale-95 border-0 shadow-lg rounded-xl h-11 font-semibold"
        >
          Rota Ayarları
        </Button>
      </div>
    </div>
  );
}
