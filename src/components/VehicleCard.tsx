import { CarFront, Zap, ArrowLeftRight, Settings, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

export default function VehicleCard({ 
  selectedVehicle, 
  onOpenGarage, 
  onOpenVehicleSettings 
}: { 
  selectedVehicle: any, 
  onOpenGarage: () => void, 
  onOpenVehicleSettings: () => void 
}) {
  if (!selectedVehicle) {
    return (
      <div className="glass-panel w-full sm:w-[380px] p-6 pointer-events-auto flex flex-col items-center justify-center min-h-[160px] gap-4 mt-auto md:mt-2">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60 mb-1">
          <CarFront size={24} />
        </div>
        <p className="text-white/70 text-sm text-center">Henüz araç seçilmedi. En iyi rota için bir araç seçin.</p>
        <Button 
          onClick={onOpenGarage}
          className="bg-zinc-100 text-black hover:bg-white transition-all duration-200 active:scale-95 rounded-xl h-12 px-8 font-bold w-full max-w-[220px] shadow-lg"
        >
          <Plus className="mr-2" size={20} /> Araç Ekle / Seç
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-panel w-full sm:w-[380px] p-5 pointer-events-auto flex flex-col gap-5 mt-auto md:mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/20">
            <CarFront size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-white/50 font-semibold tracking-wider uppercase">Seçili Araç</span>
            <span className="text-[17px] font-bold text-white tracking-tight">{selectedVehicle.name}</span>
          </div>
        </div>
        <button 
          onClick={onOpenGarage}
          className="text-white/60 hover:text-white p-2.5 hover:bg-white/10 rounded-full transition-all duration-200 active:scale-90 bg-white/5 border border-white/5"
          title="Farklı Araç Seç"
        >
          <ArrowLeftRight size={16} />
        </button>
      </div>

      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-inner">
        <div className="flex justify-between items-center font-medium">
          <span className="text-sm text-white/80 flex items-center gap-2"><Zap size={16} className="text-yellow-400 fill-yellow-400/20" /> Mevcut Şarj</span>
          <span className="text-base text-white font-bold tracking-tight">80%</span>
        </div>
        <Slider defaultValue={[80]} max={100} step={1} className="w-full cursor-grab active:cursor-grabbing" />
      </div>

      <Button 
        onClick={onOpenVehicleSettings}
        variant="outline" 
        className="w-full text-white bg-transparent border-white/20 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-[0.98] rounded-xl h-12 border-dashed font-medium"
      >
        <Settings className="mr-2 text-white/70" size={18} /> Araç ve Sürücü Ayarları
      </Button>
    </div>
  );
}
