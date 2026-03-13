import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Slider } from "./ui/slider";
import { X, Zap, BatteryMedium, Calendar, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const CustomSwitch = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={cn(
        "w-12 h-7 rounded-full relative transition-colors duration-300 cursor-pointer flex items-center px-1 shadow-inner",
        checked ? "bg-blue-500" : "bg-white/10 border border-white/20"
      )}
    >
      <div 
        className={cn(
          "w-5 h-5 rounded-full shadow-md transform transition-transform duration-300",
          checked ? "translate-x-5 bg-white" : "translate-x-0 bg-white/70"
        )}
      />
    </div>
  );
};

export default function RouteSettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [sarjSikligi, setSarjSikligi] = useState<"optimal" | "az" | "sik">("optimal");
  const [varisSarj, setVarisSarj] = useState(20);
  const [yolaCikisTarihi, setYolaCikisTarihi] = useState(new Date().toISOString().split('T')[0]);
  const [yolaCikisSaati, setYolaCikisSaati] = useState("10:00");
  
  const [istasyonVarisSarj, setIstasyonVarisSarj] = useState(10);
  const [istasyonAyrisSarj, setIstasyonAyrisSarj] = useState(80);

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
      <DialogContent showCloseButton={false} className="sm:max-w-[440px] w-full p-0 border border-white/20 bg-black/40 backdrop-blur-3xl shadow-2xl rounded-3xl z-[100] h-[90vh] sm:h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header (Sticky) */}
        <div className="flex items-center justify-between p-6 shrink-0 border-b border-white/10">
          <h2 className="text-xl font-bold text-white tracking-wide">Rota Ayarları</h2>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all border border-transparent hover:border-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 gap-8 flex flex-col [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          
          {/* GENEL ROTA AYARLARI */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[13px] font-bold text-white/40 tracking-widest uppercase">Genel Rota Ayarları</h3>

            {/* Şarj Sıklığı */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-blue-400" />
                <span className="text-white font-semibold text-[15px]">Şarj Sıklığı</span>
              </div>
              <div className="flex w-full bg-black/40 rounded-2xl p-1 border border-white/10 shadow-inner">
                {(["Optimal", "Az", "Sık"] as const).map((tip) => {
                  const val = tip.toLowerCase() as typeof sarjSikligi;
                  const isActive = sarjSikligi === val;
                  return (
                    <button
                      key={val}
                      onClick={() => setSarjSikligi(val)}
                      className={cn(
                        "flex-1 py-2.5 text-center text-sm font-medium rounded-xl transition-all duration-300",
                        isActive ? "bg-blue-500 text-white shadow-md" : "text-white/50 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {tip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Varış Şarj Durumu */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BatteryMedium size={18} className="text-blue-400" />
                  <span className="text-white font-semibold text-[15px]">Varış Şarj Durumu</span>
                </div>
                <span className="font-bold text-[15px] text-blue-400">%{varisSarj}</span>
              </div>
              <Slider 
                value={[varisSarj]} 
                onValueChange={(vals) => setVarisSarj(vals[0])}
                min={0}
                max={100}
                step={1}
                className="[&_[data-slot=slider-range]]:bg-blue-500 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-thumb]]:border-4 [&_[data-slot=slider-thumb]]:border-blue-500 [&_[data-slot=slider-thumb]]:bg-white"
              />
            </div>

            {/* Yola Çıkış Zamanı */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-400" />
                <span className="text-white font-semibold text-[15px]">Yola Çıkış Zamanı</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <input 
                    type="date" 
                    value={yolaCikisTarihi}
                    onChange={(e) => setYolaCikisTarihi(e.target.value)}
                    className="w-full bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3.5 text-white/70 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer [appearance:none] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="relative group">
                  <input 
                    type="time" 
                    value={yolaCikisSaati}
                    onChange={(e) => setYolaCikisSaati(e.target.value)}
                    className="w-full bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3.5 text-white/70 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer [appearance:none] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Clock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            </div>

            {/* Yol Tercihleri */}
            <div className="flex flex-col gap-5 mt-2 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-inner">
              <div className="flex items-center gap-2 mb-2 pb-3 border-b border-white/10">
                <MapPin size={18} className="text-blue-400" />
                <span className="text-white font-semibold text-[15px]">Yol Tercihleri</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white/80 font-medium text-[15px]">Devlet Otoyolları</span>
                <CustomSwitch checked={toggles.devletOtoyollari} onChange={() => toggleOption('devletOtoyollari')} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80 font-medium text-[15px]">Feribot</span>
                <CustomSwitch checked={toggles.feribot} onChange={() => toggleOption('feribot')} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80 font-medium text-[15px]">Özel Otoyollar</span>
                <CustomSwitch checked={toggles.ozelOtoyollar} onChange={() => toggleOption('ozelOtoyollar')} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80 font-medium text-[15px]">Ücretli Otoyollar</span>
                <CustomSwitch checked={toggles.ucretliOtoyollar} onChange={() => toggleOption('ucretliOtoyollar')} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80 font-medium text-[15px]">Köprü</span>
                <CustomSwitch checked={toggles.kopru} onChange={() => toggleOption('kopru')} />
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full my-1"></div>

          {/* İSTASYON AYARLARI */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[13px] font-bold text-white/40 tracking-widest uppercase">İstasyon Ayarları</h3>

            {/* İstasyon Şarj Limitleri */}
            <div className="flex flex-col gap-5">
              <span className="text-white font-semibold text-[15px]">İstasyon Şarj Limitleri</span>
              
              <div className="flex items-center justify-between gap-6 bg-white/5 border border-white/10 p-5 rounded-2xl shadow-inner">
                <div className="flex-1 flex flex-col gap-4">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Varış %</span>
                  <div className="flex items-center gap-3">
                    <Slider 
                      value={[istasyonVarisSarj]} 
                      onValueChange={(vals) => setIstasyonVarisSarj(vals[0])}
                      min={0}
                      max={50}
                      step={1}
                      className="[&_[data-slot=slider-range]]:bg-blue-500 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-[3px] [&_[data-slot=slider-thumb]]:border-blue-500 [&_[data-slot=slider-thumb]]:bg-white"
                    />
                    <span className="text-white font-bold text-sm w-8">%{istasyonVarisSarj}</span>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-4 border-l border-white/5 pl-6">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Ayrılış %</span>
                  <div className="flex items-center gap-3">
                    <Slider 
                      value={[istasyonAyrisSarj]} 
                      onValueChange={(vals) => setIstasyonAyrisSarj(vals[0])}
                      min={50}
                      max={100}
                      step={1}
                      className="[&_[data-slot=slider-range]]:bg-blue-500 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-[3px] [&_[data-slot=slider-thumb]]:border-blue-500 [&_[data-slot=slider-thumb]]:bg-white"
                    />
                    <span className="text-white font-bold text-sm w-8">%{istasyonAyrisSarj}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* İstasyon Markaları */}
            <div className="flex flex-col gap-4">
              <span className="text-white font-semibold text-[15px]">İstasyon Markaları</span>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">🔍</span>
                 <input type="text" placeholder="Marka Seç" className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner" />
              </div>
              <div className="mt-1">
                <span className="text-white/40 text-[12px] font-medium mb-3 block">Sık tercih edilenler</span>
                <div className="flex flex-wrap gap-2.5">
                  {['ZES', 'Eşarj', 'Sharz', 'Trugo', 'Voltrun'].map(brand => (
                    <button key={brand} className="bg-white/5 hover:bg-white/15 text-white/80 transition-all py-1.5 px-4 rounded-xl text-sm border border-white/10 hover:border-white/30 hover:shadow-md">
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* İstasyon Şarj Tercihleri */}
            <div className="flex flex-col gap-3">
              <span className="text-white font-semibold text-[15px]">İstasyon Şarj Tercihleri</span>
              <div className="flex gap-2.5">
                 {(['HPC', 'DC', 'AC'] as const).map(tip => (
                   <button 
                     key={tip}
                     onClick={() => setSarjTercipi(tip)}
                     className={cn(
                       "flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-300",
                       sarjTercipi === tip 
                         ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                         : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
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
              <div className="grid grid-cols-3 gap-3">
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
                        "flex flex-col flex-1 items-center justify-center p-4 gap-2 rounded-2xl border transition-all duration-300 shadow-sm",
                        isActive 
                           ? "bg-blue-500/20 border-blue-500" 
                           : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      <span className={cn("text-2xl mb-1 transition-all duration-300", isActive ? "scale-110 drop-shadow-md" : "opacity-50 grayscale")}>{item.icon}</span>
                      <span className={cn("text-[12px] font-medium text-center transition-colors", isActive ? "text-blue-400" : "text-white/50")}>{item.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
        </div>

        {/* Footer (Sticky) */}
        <div className="p-5 shrink-0 bg-black/40 border-t border-white/10 backdrop-blur-xl">
           <button onClick={onClose} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.4)]">
             Ayarları Uygula
           </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
