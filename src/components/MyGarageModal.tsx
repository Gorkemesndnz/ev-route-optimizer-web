import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Search, Edit2, Trash2, Plus, CarFront } from "lucide-react";
import { Button } from "./ui/button";

export default function MyGarageModal({ isOpen, onClose, onSelectVehicle }: { isOpen: boolean, onClose: () => void, onSelectVehicle: (v: any) => void }) {
  // Demo data
  const vehicles = [
    { id: 1, name: "Tesla Model Y RWD", battery: 60, range: 455 }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] glass-panel border-white/20 p-0 overflow-hidden bg-black/60 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            Araçlarım (1/3)
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-6 bg-zinc-950/40">
          
          <div className="flex flex-col gap-3">
             {vehicles.map(v => (
               <div key={v.id} className="group relative bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer" onClick={() => onSelectVehicle(v)}>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                      <CarFront size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-[15px]">{v.name}</h4>
                      <p className="text-white/50 text-xs mt-0.5">{v.battery} kWh Batarya · {v.range} km Menzil WLTP</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all" onClick={(e) => { e.stopPropagation(); }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="text-red-400/70 hover:text-red-400 p-2 rounded-full hover:bg-red-400/10 transition-all" onClick={(e) => { e.stopPropagation(); }}>
                      <Trash2 size={16} />
                    </button>
                 </div>
               </div>
             ))}
          </div>

          <div className="pt-2 border-t border-white/10">
             <h3 className="text-white/80 text-sm font-medium mb-3">Yeni Araç Ekle</h3>
             <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Marka, Model ara..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[15px] text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all" 
                />
             </div>
             <div className="flex justify-end mt-4">
                 <Button className="bg-white text-black hover:bg-zinc-200 active:scale-95 rounded-xl text-sm font-semibold h-11 px-6">
                    <Plus size={18} className="mr-1.5" /> Ekle
                 </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
