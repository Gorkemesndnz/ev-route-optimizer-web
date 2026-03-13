import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { X, Zap, BatteryMedium, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Özel Renk Sabitleri
const GREEN_ACCENT = "bg-[#34C759]"; // Daha canlı Apple yeşili
const GREEN_TEXT = "text-[#34C759]"; 
const DARK_BG = "bg-[#202022]"; // Görseldeki spesifik modal arka planı

const CustomSwitch = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={cn(
        "w-12 h-7 rounded-full relative transition-colors duration-300 cursor-pointer flex items-center px-[3px]",
        checked ? GREEN_ACCENT : "bg-[#101010] border border-white/5"
      )}
    >
      <div 
        className={cn(
          "w-5 h-5 rounded-full shadow-md transform transition-transform duration-300",
          checked ? "translate-x-5 bg-black" : "translate-x-0 bg-[#3A3A3C]"
        )}
      />
    </div>
  );
};

export default function RouteSettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [sarjSikligi, setSarjSikligi] = useState<"optimal" | "az" | "sik">("optimal");
  const [toggles, setToggles] = useState({
    devletOtoyollari: true,
    feribot: false,
    ozelOtoyollar: true,
    ucretliOtoyollar: true,
    kopru: true
  });
  
  const [sarjTercipi, setSarjTercipi] = useState<"HPC" | "DC" | "AC" | null>("HPC");
  const [selectedLokasyonlar, setSelectedLokasyonlar] = useState<string[]>([]);

  const toggleOption = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleLokasyon = (isim: string) => {
    setSelectedLokasyonlar(prev => 
      prev.includes(isim) ? prev.filter(l => l !== isim) : [...prev, isim]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className={cn("sm:max-w-[440px] w-full p-0 border-white/10 shadow-2xl z-[100] h-[90vh] sm:h-[80vh] flex flex-col", DARK_BG)}>
        
        {/* Header (Sticky) */}
        <div className="flex items-center justify-between p-6 shrink-0 border-b border-white/5">
          <h2 className="text-lg font-bold text-white tracking-wide">Rota Ayarları</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 gap-8 flex flex-col [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
          
          {/* GENEL ROTA AYARLARI */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[12px] font-bold text-white/40 tracking-wider">GENEL ROTA AYARLARI</h3>

            {/* Şarj Sıklığı */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className={GREEN_TEXT} />
                <span className="text-white font-semibold text-[15px]">Şarj Sıklığı</span>
              </div>
              <div className="flex w-full bg-[#1A1A1C] rounded-2xl p-1 border border-white/5">
                {(["Optimal", "Az", "Sık"] as const).map((tip) => {
                  const val = tip.toLowerCase() as typeof sarjSikligi;
                  const isActive = sarjSikligi === val;
                  return (
                    <button
                      key={val}
                      onClick={() => setSarjSikligi(val)}
                      className={cn(
                        "flex-1 py-2 text-center text-sm font-medium rounded-xl transition-all duration-200",
                        isActive ? `${GREEN_ACCENT} text-black shadow-md` : "text-white/50 hover:text-white/80"
                      )}
                    >
                      {tip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Varış Şarj Durumu */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BatteryMedium size={16} className={GREEN_TEXT} />
                  <span className="text-white font-semibold text-[15px]">Varış Şarj Durumu</span>
                </div>
                <span className={cn("font-bold text-[15px]", GREEN_TEXT)}>20%</span>
              </div>
              {/* Custom Sliders for Green Look */}
              <div className="relative w-full h-2 bg-[#1A1A1C] rounded-full mt-2">
                <div className={cn("absolute left-0 top-0 h-full rounded-full w-[20%]", GREEN_ACCENT)}></div>
                <div className={cn("absolute top-1/2 -translate-y-1/2 left-[20%] w-5 h-5 rounded-full border-[3px] border-[#1c1c1e] shadow-sm transform -translate-x-1/2 cursor-pointer", GREEN_ACCENT)}></div>
              </div>
            </div>

            {/* Yola Çıkış Zamanı */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className={GREEN_TEXT} />
                <span className="text-white font-semibold text-[15px]">Yola Çıkış Zamanı</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1A1A1C] rounded-xl px-4 py-3 flex items-center justify-between text-white/50 text-sm border border-white/5">
                  gg.aa.yyyy <Calendar size={14} />
                </div>
                <div className="bg-[#1A1A1C] rounded-xl px-4 py-3 flex items-center justify-between text-white/50 text-sm border border-white/5">
                  --:-- <span className="text-[12px]">🕒</span>
                </div>
              </div>
            </div>

            {/* Yol Tercihleri */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} className={GREEN_TEXT} />
                <span className="text-white font-semibold text-[15px]">Yol Tercihleri</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white/60 font-medium text-[15px]">Devlet Otoyolları</span>
                <CustomSwitch checked={toggles.devletOtoyollari} onChange={() => toggleOption('devletOtoyollari')} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 font-medium text-[15px]">Feribot</span>
                <CustomSwitch checked={toggles.feribot} onChange={() => toggleOption('feribot')} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 font-medium text-[15px]">Özel Otoyollar</span>
                <CustomSwitch checked={toggles.ozelOtoyollar} onChange={() => toggleOption('ozelOtoyollar')} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 font-medium text-[15px]">Ücretli Otoyollar</span>
                <CustomSwitch checked={toggles.ucretliOtoyollar} onChange={() => toggleOption('ucretliOtoyollar')} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 font-medium text-[15px]">Köprü</span>
                <CustomSwitch checked={toggles.kopru} onChange={() => toggleOption('kopru')} />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full my-2"></div>

          {/* İSTASYON AYARLARI */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[12px] font-bold text-white/40 tracking-wider">İSTASYON AYARLARI</h3>

            {/* İstasyon Şarj Limitleri */}
            <div className="flex flex-col gap-4">
              <span className="text-white font-semibold text-[15px]">İstasyon Şarj Limitleri</span>
              
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-white/50 text-xs">Varış %</span>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full h-2 bg-[#1A1A1C] rounded-full">
                      <div className={cn("absolute left-0 top-0 h-full rounded-full w-[10%]", GREEN_ACCENT)}></div>
                      <div className={cn("absolute top-1/2 -translate-y-1/2 left-[10%] w-4 h-4 rounded-full border-[2px] border-[#1c1c1e] transform -translate-x-1/2", GREEN_ACCENT)}></div>
                    </div>
                    <span className="text-white font-bold text-sm">10%</span>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-white/50 text-xs">Ayrılış %</span>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full h-2 bg-[#1A1A1C] rounded-full">
                      <div className={cn("absolute left-0 top-0 h-full rounded-full w-[80%]", GREEN_ACCENT)}></div>
                      <div className={cn("absolute top-1/2 -translate-y-1/2 left-[80%] w-4 h-4 rounded-full border-[2px] border-[#1c1c1e] transform -translate-x-1/2", GREEN_ACCENT)}></div>
                    </div>
                    <span className="text-white font-bold text-sm w-8">80%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* İstasyon Markaları */}
            <div className="flex flex-col gap-3">
              <span className="text-white font-semibold text-[15px]">İstasyon Markaları</span>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">🔍</span>
                 <input type="text" placeholder="Marka Seç" className="w-full bg-[#1A1A1C] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/10" />
              </div>
              <div className="mt-1">
                <span className="text-white/40 text-[11px] mb-2 block">Sık tercih edilenler</span>
                <div className="flex flex-wrap gap-2">
                  {['ZES', 'Eşarj', 'Sharz', 'Trugo', 'Voltrun'].map(brand => (
                    <button key={brand} className="bg-[#1A1A1C] hover:bg-white/10 text-white/60 transition-colors py-[6px] px-4 rounded-lg text-sm border border-white/5">
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* İstasyon Şarj Tercihleri */}
            <div className="flex flex-col gap-3">
              <span className="text-white font-semibold text-[15px]">İstasyon Şarj Tercihleri</span>
              <div className="flex gap-2">
                 {(['HPC', 'DC', 'AC'] as const).map(tip => (
                   <button 
                     key={tip}
                     onClick={() => setSarjTercipi(tip)}
                     className={cn(
                       "flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all",
                       sarjTercipi === tip 
                         ? "bg-[#1B3623] border-[#34C759]/50 text-[#34C759]" 
                         : "bg-[#1A1A1C] border-white/5 text-white/40"
                     )}
                   >
                     {tip}
                   </button>
                 ))}
              </div>
            </div>

            {/* İstasyon Lokasyon Tercihleri */}
            <div className="flex flex-col gap-3">
              <span className="text-white font-semibold text-[15px]">İstasyon Lokasyon Tercihleri</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'AVM', icon: '🏢' },
                  { id: 'Kafe', icon: '☕' },
                  { id: 'Otel', icon: '🏨' },
                  { id: 'Tuvalet', icon: '🚻' },
                  { id: 'Dinlenme Tesisi', icon: '🌲' },
                  { id: 'Benzinlik', icon: '⛽' },
                ].map((item) => {
                  const isActive = selectedLokasyonlar.includes(item.id);
                  return (
                    <button 
                      key={item.id}
                      onClick={() => toggleLokasyon(item.id)}
                      className={cn(
                        "flex flex-col flex-1 items-center justify-center p-3 gap-2 rounded-2xl border transition-all",
                        isActive 
                           ? "bg-[#1B3623] border-[#34C759]/30" 
                           : "bg-[#1A1A1C] border-transparent hover:border-white/5"
                      )}
                    >
                      <span className={cn("text-xl mb-1", isActive ? "opacity-100" : "opacity-40 grayscale")}>{item.icon}</span>
                      <span className={cn("text-[11px] font-medium text-center", isActive ? GREEN_TEXT : "text-white/40")}>{item.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
        </div>

        {/* Footer (Sticky) */}
        <div className="p-4 shrink-0 bg-[#202022] border-t border-white/5">
           <button onClick={onClose} className={cn("w-full text-black font-bold py-3.5 rounded-xl transition-transform active:scale-95 shadow-lg", GREEN_ACCENT)}>
             Ayarları Uygula
           </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
