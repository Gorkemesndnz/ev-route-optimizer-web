import { ArrowLeft, Plus, CheckCircle2, Circle, Trash2, CarFront } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GarageView({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onRenameVehicle,
  onDeleteVehicle,
  onAddVehicle,
  onBack
}) {
  return (
    <div className="glass-panel w-full sm:w-[400px] px-4 py-5 pointer-events-auto flex flex-col gap-4 relative h-[calc(100svh-4rem)] sm:h-auto sm:max-h-[85vh] overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/5 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-white/90">Araçlarım</h2>
      </div>

      {/* Vehicle List */}
      <div className="flex flex-col gap-3 mt-2">
        {vehicles.map((vehicle) => {
          const isSelected = vehicle.id === selectedVehicleId;

          return (
            <div
              key={vehicle.id}
              className={cn(
                "relative flex flex-col gap-3 p-4 rounded-3xl border transition-all duration-300",
                isSelected
                  ? "bg-cyan-500/10 border-cyan-500/30"
                  : "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20"
              )}
            >
              {/* Top Row: Select & Title */}
              <div className="flex items-start justify-between gap-3">
                <div 
                  className="flex-1 flex gap-3 items-center cursor-pointer group"
                  onClick={() => onSelectVehicle(vehicle.id)}
                >
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                    isSelected ? "text-cyan-400" : "text-white/30 group-hover:text-white/50"
                  )}>
                    {isSelected ? <CheckCircle2 size={24} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" /> : <Circle size={22} />}
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium text-white/50">{vehicle.brand} {vehicle.model}</span>
                    <input
                      type="text"
                      className="bg-transparent border-none text-white font-medium text-lg p-0 focus:outline-none focus:ring-0 placeholder-white/30 border-b border-transparent focus:border-white/20 transition-colors w-full"
                      value={vehicle.customName}
                      onChange={(e) => onRenameVehicle(vehicle.id, e.target.value)}
                      placeholder="Araç İsmi (Örn: Tesla)"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteVehicle(vehicle.id);
                  }}
                  className="p-2 -mt-1 -mr-1 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}

        {vehicles.length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3 opacity-50">
            <CarFront size={48} className="text-white/30" />
            <p className="text-sm text-white/70">Henüz aracınız bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* Footer / Add Button */}
      {vehicles.length < 3 && (
        <button
          onClick={onAddVehicle}
          className="mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          Yeni Araç Ekle
        </button>
      )}

      {vehicles.length >= 3 && (
        <p className="text-xs text-center text-white/40 mt-2">
          Maksimum 3 adet araç ekleyebilirsiniz.
        </p>
      )}
    </div>
  );
}
