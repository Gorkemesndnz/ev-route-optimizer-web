import { CarFront, Battery, ArrowLeftRight, Settings, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { memo } from "react";
import { translations } from "../lib/translations";

const NativeSlider = ({ value, min, max, onChange }: { value: number, min: number, max: number, onChange: (v: number) => void }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative w-full h-1.5 bg-white/20 rounded-full shadow-inner flex items-center mt-2 mb-2">
      <div 
        className="absolute left-0 h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)] pointer-events-none transition-all duration-75" 
        style={{ width: `${percentage}%` }} 
      />
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute w-full h-full opacity-0 cursor-ew-resize z-10 m-0 p-0"
      />
      <div 
        className="absolute w-5 h-5 bg-white rounded-full shadow-md pointer-events-none transition-all duration-75 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] border border-cyan-400/20" 
        style={{ left: `calc(${percentage}% - (${percentage * 20 / 100}px))` }}
      />
    </div>
  );
};

import { useVehicle } from "../contexts/VehicleContext";
import { useSettings } from "../contexts/SettingsContext";

const VehicleCard = memo(({ 
  onOpenGarage, 
  onOpenAddVehicle,
  onOpenVehicleSettings
}: { 
  onOpenGarage: () => void, 
  onOpenAddVehicle: () => void,
  onOpenVehicleSettings: () => void
}) => {
  const { language } = useSettings();
  const { selectedVehicle, setVehicles, selectedVehicleId } = useVehicle();
  const t = translations[language];

  const handleUpdateSoC = (soc: number) => {
    setVehicles(prev => prev.map(v => v.id === selectedVehicleId ? { ...v, soc } : v));
  };
  if (!selectedVehicle) {
    return (
      <div className="glass-panel w-full sm:w-[420px] p-6 pointer-events-auto flex flex-col items-center justify-center min-h-[160px] gap-4 mt-auto md:mt-2">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60 mb-1">
          <CarFront size={24} />
        </div>
        <p className="text-white/70 text-sm text-center">{t.noVehicleSelected}</p>
        <Button 
          onClick={onOpenAddVehicle}
          className="bg-zinc-100 text-black hover:bg-white transition-all duration-200 active:scale-95 rounded-xl h-12 px-8 font-bold w-full max-w-[220px] shadow-lg"
        >
          <Plus className="mr-2" size={20} /> {t.addSelectVehicle}
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-panel w-full sm:w-[420px] p-5 pointer-events-auto flex flex-col gap-5 mt-auto md:mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/20">
            <CarFront size={20} className="text-white" />
          </div>
          <div className="flex flex-col justify-center">
            {selectedVehicle.customName && selectedVehicle.customName !== `${selectedVehicle.brand} ${selectedVehicle.model}` && (
              <span className="text-[11px] font-medium text-cyan-400 uppercase tracking-wider mb-0.5">
                {selectedVehicle.brand} {selectedVehicle.model}
              </span>
            )}
            <span className="text-[17px] font-bold text-white tracking-tight">
              {selectedVehicle.customName || `${selectedVehicle.brand} ${selectedVehicle.model}`}
            </span>
          </div>
        </div>
        <button 
          onClick={onOpenGarage}
          className="text-white/60 hover:text-white p-2.5 hover:bg-white/10 rounded-full transition-all duration-200 active:scale-90 bg-white/5 border border-white/5"
          title={t.changeVehicle}
        >
          <ArrowLeftRight size={16} />
        </button>
      </div>

      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-inner">
        <div className="flex justify-between items-center font-medium">
          <span className="text-sm text-white/80 flex items-center gap-2"><Battery size={16} className="text-cyan-400" /> {t.currentCharge}</span>
          <span className="text-base text-cyan-400 font-bold tracking-tight">%{selectedVehicle.soc}</span>
        </div>
        <NativeSlider 
          value={selectedVehicle.soc} 
          min={0}
          max={100}
          onChange={handleUpdateSoC}
        />
      </div>

      <Button 
        onClick={onOpenVehicleSettings}
        variant="outline" 
        className="w-full text-white bg-transparent border-white/20 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-[0.98] rounded-xl h-12 border-dashed font-medium"
      >
        <Settings className="mr-2 text-white/70" size={18} /> {t.vehicleDriverSettings}
      </Button>
    </div>
  );
});

export default VehicleCard;
