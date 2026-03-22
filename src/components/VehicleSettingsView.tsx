import { useState } from "react";
import { ChevronLeft, Users, Thermometer as Thermostat, Weight, Gauge, Zap, Cog, CarFront, PlugZap } from "lucide-react";
import { cn } from "@/lib/utils";
import { translations } from "../lib/translations";

const CustomSwitch = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={cn(
        "w-12 h-7 rounded-full relative transition-colors duration-300 cursor-pointer flex items-center px-1 shadow-inner",
        checked ? "bg-cyan-400" : "bg-white/10 border border-white/20"
      )}
    >
      <div 
        className={cn(
          "w-5 h-5 rounded-full shadow-md transform transition-transform duration-300",
          checked ? "translate-x-5 bg-black" : "translate-x-0 bg-white/70"
        )}
      />
    </div>
  );
};

import { useSettings } from "../contexts/SettingsContext";
import { useVehicle } from "../contexts/VehicleContext";

export default function VehicleSettingsView({ 
  onBack,
}: { 
  onBack: () => void,
}) {
  const { language } = useSettings();
  const { selectedVehicle, updateVehicle } = useVehicle();
  const t = translations[language];

  // Initialize state from selectedVehicle or defaults
  const [passengers, setPassengers] = useState(selectedVehicle?.passengers ?? 1);
  const [extraWeight, setExtraWeight] = useState(selectedVehicle?.extraWeight ?? 0);
  const [climateControl, setClimateControl] = useState(selectedVehicle?.climateControl ?? true);
  const [plugTypes, setPlugTypes] = useState<string[]>(selectedVehicle?.preferredPlugTypes ?? ['ccs']);
  const [maxSpeed, setMaxSpeed] = useState(selectedVehicle?.maxSpeed ?? 130);
  const [refConsumption, setRefConsumption] = useState(selectedVehicle?.refConsumption ?? 16.5);
  const [drivingStyle, setDrivingStyle] = useState(selectedVehicle?.drivingStyle ?? 'normal');

  const handleApplySettings = async () => {
    if (!selectedVehicle) {
      onBack();
      return;
    }

    await updateVehicle(selectedVehicle.id, {
      passengers,
      extraWeight,
      climateControl,
      preferredPlugTypes: plugTypes,
      maxSpeed,
      refConsumption,
      drivingStyle: drivingStyle as any
    });

    onBack();
  };

  return (
    <div className="glass-panel w-full sm:w-[420px] px-4 py-5 pointer-events-auto flex flex-col gap-4 relative h-[calc(100svh-4rem)] sm:h-[650px] overflow-hidden custom-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/5 active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-xl font-bold tracking-tight text-white/90">{t.vehicleDriverSettings}</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 gap-8 flex flex-col custom-scrollbar pb-6">
         {/* ARAÇ AYARLARI */}
         <div className="flex flex-col gap-6">
            <h3 className="text-[13px] font-bold text-white/40 tracking-widest uppercase flex items-center gap-2">
              <Cog size={16} /> {t.vehicleSettings}
            </h3>
            
            <div className="flex flex-col gap-5 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-inner">
              
              {/* Kişi Sayısı */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-white/80 font-medium text-[15px] flex items-center gap-2"><Users size={16} className="text-cyan-400"/> {t.passengerCount}</span>
                  <span className="text-[11px] text-white/40">{t.passengerCountDesc}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1">
                  <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/20 text-white transition-colors">-</button>
                  <span className="w-4 text-center text-white font-bold">{passengers}</span>
                  <button onClick={() => setPassengers(Math.min(9, passengers + 1))} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/20 text-white transition-colors">+</button>
                </div>
              </div>

              <div className="h-px bg-white/10 w-full my-1"></div>

              {/* Ek Ağırlık */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-white/80 font-medium text-[15px] flex items-center gap-2"><Weight size={16} className="text-cyan-400"/> {t.extraWeight}</span>
                  <span className="text-[11px] text-white/40">{t.extraWeightDesc} <span className="text-cyan-400/80">(kg)</span></span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1">
                  <button onClick={() => setExtraWeight(Math.max(0, extraWeight - 5))} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/20 text-white transition-colors">-</button>
                  <input 
                    type="number" 
                    value={extraWeight} 
                    onChange={(e) => setExtraWeight(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-10 bg-transparent text-center text-white font-bold text-lg focus:outline-none border-b border-transparent focus:border-cyan-400 transition-colors"
                  />
                  <button onClick={() => setExtraWeight(extraWeight + 5)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/20 text-white transition-colors">+</button>
                </div>
              </div>

              <div className="h-px bg-white/10 w-full my-1"></div>

              {/* Klima */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-white/80 font-medium text-[15px] flex items-center gap-2"><Thermostat size={16} className="text-cyan-400"/> {t.climateControl}</span>
                  <span className="text-[11px] text-white/40">{t.climateControlDesc}</span>
                </div>
                <CustomSwitch checked={climateControl} onChange={setClimateControl} />
              </div>

              <div className="h-px bg-white/10 w-full my-1"></div>

              {/* Bağlayıcı Tipi */}
              <div className="flex flex-col gap-3">
                <span className="text-white/80 font-medium text-[15px] flex items-center gap-2"><PlugZap size={16} className="text-cyan-400"/> {t.plugTypes}</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['CCS', 'CHAdeMO', 'Type2']).map(tip => {
                    const val = tip.toLowerCase();
                    const isSelected = plugTypes.includes(val);
                    return (
                      <button
                        key={tip}
                        onClick={() => {
                          if (isSelected) {
                            setPlugTypes(plugTypes.filter(p => p !== val));
                          } else {
                            setPlugTypes([...plugTypes, val]);
                          }
                        }}
                        className={cn(
                          "py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300",
                          isSelected
                            ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)] border-cyan-400"
                            : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {tip}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
         </div>

         {/* SÜRÜCÜ AYARLARI */}
         <div className="flex flex-col gap-6">
            <h3 className="text-[13px] font-bold text-white/40 tracking-widest uppercase flex items-center gap-2">
              <CarFront size={16} /> {t.driverSettings}
            </h3>
            
            <div className="flex flex-col gap-5 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-inner">
              
              {/* Sürüş Tarzı */}
              <div className="flex flex-col gap-3">
                <span className="text-white/80 font-medium text-[15px] flex items-center gap-2">{t.drivingStyle}</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'eco', label: 'Eco' },
                    { id: 'normal', label: 'Normal' },
                    { id: 'sport', label: 'Sport' }
                  ].map(tip => (
                    <button
                      key={tip.id}
                      onClick={() => setDrivingStyle(tip.id as 'eco' | 'normal' | 'sport')}
                      className={cn(
                        "py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300",
                        drivingStyle === tip.id
                          ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)] border-cyan-400"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {tip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-white/10 w-full my-1"></div>

              {/* Maksimum Hız */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-white/80 font-medium text-[15px] flex items-center gap-2"><Gauge size={16} className="text-cyan-400"/> {t.maxSpeed}</span>
                  <span className="text-[11px] text-white/40">{t.maxSpeedDesc} <span className="text-cyan-400/80">(km/h)</span></span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1">
                  <button onClick={() => setMaxSpeed(Math.max(50, maxSpeed - 5))} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/20 text-white transition-colors">-</button>
                  <input 
                    type="number" 
                    value={maxSpeed} 
                    onChange={(e) => setMaxSpeed(Math.max(50, parseInt(e.target.value) || 50))}
                    className="w-10 bg-transparent text-center text-white font-bold text-lg focus:outline-none border-b border-white/10 focus:border-cyan-400 transition-colors"
                  />
                  <button onClick={() => setMaxSpeed(Math.min(200, maxSpeed + 5))} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/20 text-white transition-colors">+</button>
                </div>
              </div>

              <div className="h-px bg-white/10 w-full my-1"></div>

              {/* Referans Tüketim */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-white/80 font-medium text-[15px] flex items-center gap-2"><Zap size={16} className="text-cyan-400"/> {t.refConsumption}</span>
                  <span className="text-[11px] text-white/40">{t.refConsumptionDesc} <span className="text-cyan-400/80">(kWh/100km)</span></span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1">
                  <button onClick={() => setRefConsumption(Math.max(5, refConsumption - 0.5))} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/20 text-white transition-colors">-</button>
                  <input 
                    type="number" 
                    step="0.5"
                    value={refConsumption} 
                    onChange={(e) => setRefConsumption(Math.max(5, parseFloat(e.target.value) || 5))}
                    className="w-12 bg-transparent text-center text-white font-bold text-lg focus:outline-none border-b border-white/10 focus:border-cyan-400 transition-colors"
                  />
                  <button onClick={() => setRefConsumption(refConsumption + 0.5)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/20 text-white transition-colors">+</button>
                </div>
              </div>

            </div>
         </div>
      </div>
      {/* Footer */}
      <div className="shrink-0 bg-transparent border-t border-white/10 z-50 pt-3">
         <button onClick={handleApplySettings} className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-[0_0_15px_rgba(34,211,238,0.3)]">
           {t.applySettings}
         </button>
      </div>
    </div>
  );
}
