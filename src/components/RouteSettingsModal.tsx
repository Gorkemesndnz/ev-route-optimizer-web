import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CustomSwitch = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={cn(
        "w-12 h-7 rounded-full relative transition-colors duration-300 cursor-pointer flex items-center px-1",
        checked ? "bg-white" : "bg-white/10 border border-white/20"
      )}
    >
      <div 
        className={cn(
          "w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300",
          checked ? "translate-x-5 bg-black" : "translate-x-0 bg-white"
        )}
      />
    </div>
  );
};

export default function RouteSettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [routeType, setRouteType] = useState<"hizli" | "kisa">("hizli");
  const [toggles, setToggles] = useState({
    ucretli: false,
    feribot: false,
    otoban: true,
    trafik: true
  });

  const toggleOption = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[400px] w-[90vw] p-0 bg-transparent border-none z-[100]">
        
        {/* Main Container (The Glass Card) */}
        <div className="w-full bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl flex flex-col gap-6 relative">
          
          {/* Close Button overlaying the card */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header Section */}
          <div className="flex items-center gap-3 pr-8">
            <Settings size={20} className="text-white" />
            <h2 className="text-lg font-semibold text-white tracking-wide">Rota Ayarları</h2>
          </div>

          {/* Segmented Control (HIZLI / KISA Tab Picker) */}
          <div className="flex w-full bg-black/60 rounded-full p-1 backdrop-blur-md border border-white/10">
            <button
              onClick={() => setRouteType("hizli")}
              className={cn(
                "flex-1 py-2 text-center text-sm rounded-full transition-all duration-300 ease-in-out",
                routeType === "hizli" 
                  ? "bg-white text-black font-bold shadow-md" 
                  : "text-white/60 hover:text-white font-medium"
              )}
            >
              Hızlı Rota
            </button>
            <button
              onClick={() => setRouteType("kisa")}
              className={cn(
                "flex-1 py-2 text-center text-sm rounded-full transition-all duration-300 ease-in-out",
                routeType === "kisa" 
                  ? "bg-white text-black font-bold shadow-md" 
                  : "text-white/60 hover:text-white font-medium"
              )}
            >
              Kısa Rota
            </button>
          </div>

          {/* Options List (The Switches) */}
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium text-[15px]">Ücretli Yollar</span>
              <CustomSwitch checked={toggles.ucretli} onChange={() => toggleOption('ucretli')} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium text-[15px]">Feribot</span>
              <CustomSwitch checked={toggles.feribot} onChange={() => toggleOption('feribot')} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium text-[15px]">Otoban</span>
              <CustomSwitch checked={toggles.otoban} onChange={() => toggleOption('otoban')} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium text-[15px]">Trafik Yoğunluğu</span>
              <CustomSwitch checked={toggles.trafik} onChange={() => toggleOption('trafik')} />
            </div>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
