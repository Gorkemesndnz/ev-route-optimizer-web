import { useState, useCallback } from "react";
import { ArrowLeft, Plus, CheckCircle2, Circle, Trash2, CarFront, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { translations } from "../lib/translations";

import { useVehicle } from "../contexts/VehicleContext";
import { useSettings } from "../contexts/SettingsContext";
import type { Vehicle } from "../types/vehicle";

export default function GarageView({
  onAddVehicle,
  onBack,
}: {
  onAddVehicle: () => void;
  onBack: () => void;
}) {
  const { language } = useSettings();
  const { vehicles, selectedVehicleId, selectVehicle, updateVehicle, removeVehicle } = useVehicle();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const t = translations[language];

  const handleSelectVehicle = useCallback(async (id: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    await selectVehicle(id);
    setIsProcessing(false);
  }, [selectVehicle, isProcessing]);
  
  const handleRenameVehicle = useCallback(async (id: string, newName: string) => {
    if (isProcessing || !newName.trim()) return;
    setIsProcessing(true);
    await updateVehicle(id, { customName: newName });
    setIsProcessing(false);
  }, [updateVehicle, isProcessing]);

  const handleDeleteVehicle = useCallback(async (id: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    await removeVehicle(id);
    setIsProcessing(false);
  }, [removeVehicle, isProcessing]);

  return (
    <div className="glass-panel w-full sm:w-[420px] px-4 py-5 pointer-events-auto flex flex-col gap-4 relative h-[calc(100svh-4rem)] sm:h-auto sm:max-h-[85vh] overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/5 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-white/90">{t.myVehicles}</h2>
      </div>

      {/* Vehicle List */}
      <div className="flex flex-col gap-3 mt-2">
        {vehicles.map((vehicle) => {
          const isSelected = vehicle.id === selectedVehicleId;

          return (
            <div
              key={vehicle.id}
              data-vehicle-row
              className={cn(
                "relative flex flex-col gap-3 p-4 rounded-3xl border transition-all duration-300 group/row",
                isSelected
                  ? "bg-cyan-500/10 border-cyan-500/30"
                  : "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20"
              )}
            >
              {/* Top Row: Select & Title */}
              <div className="flex items-start justify-between gap-3">
                <div 
                  className="flex-1 flex gap-3 items-center cursor-pointer group"
                  onClick={() => handleSelectVehicle(vehicle.id)}
                >
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                    isSelected ? "text-cyan-400" : "text-white/30 group-hover:text-white/50"
                  )}>
                    {isSelected ? <CheckCircle2 size={24} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" /> : <Circle size={22} />}
                  </div>
                  
                  <div className="flex flex-col flex-1 justify-center">
                    {vehicle.customName && vehicle.customName !== `${vehicle.brand} ${vehicle.model}` && (
                      <span className="text-[11px] font-medium text-cyan-400 uppercase tracking-wider mb-0.5">{vehicle.brand} {vehicle.model}</span>
                    )}
                    
                    {editingId === vehicle.id ? (
                      <input
                        autoFocus
                        type="text"
                        className="bg-transparent border-none text-white font-bold text-lg p-0 focus:outline-none focus:ring-0 placeholder-white/30 border-b border-cyan-400/50 transition-colors w-full"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameVehicle(vehicle.id, tempName);
                            setEditingId(null);
                          } else if (e.key === 'Escape') {
                            setEditingId(null);
                          }
                        }}
                        onBlur={() => {
                          handleRenameVehicle(vehicle.id, tempName);
                          setEditingId(null);
                        }}
                        placeholder={t.vehicleName}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-lg font-bold text-white tracking-tight">
                        {vehicle.customName || `${vehicle.brand} ${vehicle.model}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center justify-center gap-2 pl-2 border-l border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(vehicle.id);
                      setTempName(vehicle.customName || `${vehicle.brand} ${vehicle.model}`);
                    }}
                    className="p-2 text-white/50 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all active:scale-90"
                    title={t.save}
                  >
                    <Edit2 size={16} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteVehicle(vehicle.id);
                    }}
                    className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                    title={t.clear}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {vehicles.length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3 opacity-50">
            <CarFront size={48} className="text-white/30" />
            <p className="text-sm text-white/70">{t.noVehiclesInGarage}</p>
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
          {t.addVehicle}
        </button>
      )}

      {vehicles.length >= 3 && (
        <p className="text-xs text-center text-white/40 mt-2">
          {t.myGarageFull}
        </p>
      )}
    </div>
  );
}
