import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Search, Edit2, Trash2, Plus, CarFront, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useVehicle } from "../contexts/VehicleContext";
import { useSettings } from "../contexts/SettingsContext";
import { translations } from "../lib/translations";
import type { Vehicle } from "../types/vehicle";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function MyGarageModal({ 
  isOpen, 
  onClose, 
  onOpenAddVehicle 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onOpenAddVehicle: () => void 
}) {
  const { language } = useSettings();
  const t = translations[language];
  const { vehicles, selectedVehicleId, removeVehicle, selectVehicle } = useVehicle();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVehicles = vehicles.filter(v => 
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.customName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectVehicle = async (id: string) => {
    await selectVehicle(id);
    onClose();
  };

  const handleDeleteVehicle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await removeVehicle(id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] glass-panel border-white/20 p-0 overflow-hidden bg-black/60 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            {t.myGarage} ({vehicles.length}/5)
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-6 bg-zinc-950/40 min-h-[400px]">
          
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
             {filteredVehicles.map(v => (
               <div 
                 key={v.id} 
                 className={cn(
                   "group relative bg-white/5 hover:bg-white/10 transition-all border rounded-2xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.98]",
                   selectedVehicleId === v.id ? "border-cyan-500/50 bg-cyan-500/5" : "border-white/10"
                 )} 
                 onClick={() => handleSelectVehicle(v.id)}
               >
                 <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        selectedVehicleId === v.id ? "bg-cyan-500 text-black" : "bg-white/10 text-white/80"
                      )}>
                      {selectedVehicleId === v.id ? <Check size={20} /> : <CarFront size={20} />}
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-[15px]">{v.customName}</h4>
                      <p className="text-white/50 text-xs mt-0.5">
                        {v.brand} {v.model} {v.soc !== undefined && `· %${v.soc}`}
                      </p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all" onClick={(e) => { e.stopPropagation(); }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="text-red-400/70 hover:text-red-400 p-2 rounded-full hover:bg-red-400/10 transition-all" onClick={(e) => handleDeleteVehicle(e, v.id)}>
                      <Trash2 size={16} />
                    </button>
                 </div>
               </div>
             ))}

             {vehicles.length === 0 && (
               <div className="py-12 text-center text-white/30 text-sm italic">
                  {t.noVehiclesInGarage}
               </div>
             )}
          </div>

          <div className="pt-2 border-t border-white/10 mt-auto">
             <h3 className="text-white/80 text-sm font-medium mb-3">{t.addNewVehicle}</h3>
             <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder={t.searchBrandModel} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[15px] text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all" 
                />
             </div>
             <div className="flex justify-end mt-4">
                 <Button 
                   onClick={() => { onClose(); onOpenAddVehicle(); }}
                   className="bg-white text-black hover:bg-zinc-200 active:scale-95 rounded-xl text-sm font-semibold h-11 px-6"
                 >
                    <Plus size={18} className="mr-1.5" /> {t.add}
                 </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
