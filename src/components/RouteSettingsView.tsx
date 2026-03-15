import { useState } from "react";
import { ChevronLeft, Zap, BatteryMedium, Calendar as CalendarIcon, MapPin, Search } from "lucide-react";
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

const NativeSlider = ({ value, min, max, onChange }: { value: number, min: number, max: number, onChange: (v: number) => void }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative w-full h-1.5 bg-white/20 rounded-full shadow-inner flex items-center">
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

export default function RouteSettingsView({ 
  onBack, 
  language = 'tr' 
}: { 
  onBack: () => void,
  language?: 'tr' | 'en'
}) {
  const t = translations[language];
  const [sarjSikligi, setSarjSikligi] = useState<"optimal" | "az" | "sik">("optimal");
  const [varisSarj, setVarisSarj] = useState(20);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
    <div className="glass-panel w-full sm:w-[420px] h-full sm:h-auto sm:max-h-[90vh] flex flex-col pointer-events-auto">
      <div className="flex items-center gap-3 pt-6 px-6 pb-4 shrink-0 border-b border-white/10 z-10 sticky top-0 bg-transparent">
        <button 
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-white mb-0.5">{t.routeSettingsTitle}</h2>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 gap-8 flex flex-col [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        
        <div className="flex flex-col gap-6">
          <h3 className="text-[13px] font-bold text-white/40 tracking-widest uppercase">{language === 'tr' ? 'Genel Rota Ayarları' : 'General Route Settings'}</h3>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-cyan-400" />
              <span className="text-white font-semibold text-[15px]">{language === 'tr' ? 'Şarj Sıklığı' : 'Charging Frequency'}</span>
            </div>
            <div className="flex w-full bg-white/5 rounded-2xl p-1 border border-white/10 shadow-inner">
              {(language === 'tr' ? ["Optimal", "Az", "Sık"] : ["Optimal", "Few", "Many"]).map((label, idx) => {
                const values = ["optimal", "az", "sik"] as const;
                const val = values[idx];
                const isActive = sarjSikligi === val;
                return (
                  <button
                    key={val}
                    onClick={() => setSarjSikligi(val)}
                    className={cn(
                      "flex-1 py-2.5 text-center text-sm font-medium rounded-xl transition-all duration-300",
                      isActive ? "bg-cyan-400 text-black shadow-md font-semibold" : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BatteryMedium size={18} className="text-cyan-400" />
                <span className="text-white font-semibold text-[15px]">{t.arrivalSoC}</span>
              </div>
              <div className="flex items-center">
                <span className="text-cyan-400 font-bold mr-0.5">%</span>
                <span className="w-8 text-cyan-400 font-bold text-[15px] text-center">{varisSarj}</span>
              </div>
            </div>
            <NativeSlider value={varisSarj} min={0} max={100} onChange={setVarisSarj} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-cyan-400" />
              <span className="text-white font-semibold text-[15px]">{language === 'tr' ? 'Yola Çıkış Zamanı' : 'Departure Time'}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3.5 text-white/70 text-sm border border-white/10 focus:outline-none focus:border-cyan-400/50 transition-all [color-scheme:dark]"
              />
              <input 
                type="time" 
                value={yolaCikisSaati}
                onChange={(e) => setYolaCikisSaati(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3.5 text-white/70 text-sm border border-white/10 focus:outline-none focus:border-cyan-400/50 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 mt-2 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-inner">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-white/10">
              <MapPin size={18} className="text-cyan-400" />
              <span className="text-white font-semibold text-[15px]">{language === 'tr' ? 'Yol Tercihleri' : 'Road Preferences'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80 font-medium text-[15px]">{language === 'tr' ? 'Devlet Otoyolları' : 'State Highways'}</span>
              <CustomSwitch checked={toggles.devletOtoyollari} onChange={() => toggleOption('devletOtoyollari')} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80 font-medium text-[15px]">{language === 'tr' ? 'Feribot' : 'Ferries'}</span>
              <CustomSwitch checked={toggles.feribot} onChange={() => toggleOption('feribot')} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80 font-medium text-[15px]">{language === 'tr' ? 'Özel Otoyollar' : 'Private Highways'}</span>
              <CustomSwitch checked={toggles.ozelOtoyollar} onChange={() => toggleOption('ozelOtoyollar')} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80 font-medium text-[15px]">{t.avoidTolls}</span>
              <CustomSwitch checked={toggles.ucretliOtoyollar} onChange={() => toggleOption('ucretliOtoyollar')} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80 font-medium text-[15px]">{language === 'tr' ? 'Köprü' : 'Bridges'}</span>
              <CustomSwitch checked={toggles.kopru} onChange={() => toggleOption('kopru')} />
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full my-1"></div>

        <div className="flex flex-col gap-6">
          <h3 className="text-[13px] font-bold text-white/40 tracking-widest uppercase">{language === 'tr' ? 'İstasyon Ayarları' : 'Station Settings'}</h3>

          <div className="flex flex-col gap-5">
            <span className="text-white font-semibold text-[15px]">{language === 'tr' ? 'İstasyon Şarj Limitleri' : 'Station Charge Limits'}</span>
            
            <div className="flex items-center justify-between gap-6 bg-white/5 border border-white/10 p-5 rounded-2xl shadow-inner">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between pr-2">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">{language === 'tr' ? 'Varış' : 'Arrival'}</span>
                  <div className="flex items-center">
                    <span className="text-white font-bold text-sm">%</span>
                    <span className="w-8 text-white font-bold text-sm text-center">{istasyonVarisSarj}</span>
                  </div>
                </div>
                <NativeSlider value={istasyonVarisSarj} min={0} max={100} onChange={setIstasyonVarisSarj} />
              </div>
              
              <div className="flex-1 flex flex-col gap-4 border-l border-white/5 pl-6">
                <div className="flex items-center justify-between pr-2">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">{language === 'tr' ? 'Ayrılış' : 'Departure'}</span>
                  <div className="flex items-center">
                    <span className="text-white font-bold text-sm">%</span>
                    <span className="w-8 text-white font-bold text-sm text-center">{istasyonAyrisSarj}</span>
                  </div>
                </div>
                <NativeSlider value={istasyonAyrisSarj} min={0} max={100} onChange={setIstasyonAyrisSarj} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 overflow-hidden relative">
            <span className="text-white font-semibold text-[15px]">{language === 'tr' ? 'İstasyon Markaları' : 'Station Brands'}</span>
            <div className="relative">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
               <input type="text" placeholder={language === 'tr' ? 'Marka Seç' : 'Select Brand'} className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner" />
            </div>
            <div className="mt-1 w-full pl-0.5">
              <span className="text-white/40 text-[12px] font-medium mb-3 block">{language === 'tr' ? 'Sık tercih edilenler' : 'Frequently selected'}</span>
              <div className="grid grid-cols-4 gap-2.5 w-full">
                {['ZES', 'Eşarj', 'Sharz', 'Trugo', 'Voltrun', 'Tesla', 'Wat', 'DB'].map((brand) => (
                  <button key={brand} className="bg-white/5 hover:bg-white/15 text-white/80 transition-all py-1.5 rounded-xl text-sm border border-white/10 hover:border-white/30 hover:shadow-md text-center">
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-white font-semibold text-[15px]">{language === 'tr' ? 'İstasyon Şarj Tercihleri' : 'Charge Preferences'}</span>
            <div className="flex gap-2.5">
               {(['HPC', 'DC', 'AC'] as const).map(tip => (
                 <button 
                   key={tip}
                   onClick={() => setSarjTercipi(tip)}
                   className={cn(
                     "flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-300",
                     sarjTercipi === tip 
                       ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)] border-cyan-400" 
                       : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                   )}
                 >
                   {tip}
                 </button>
               ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-white font-semibold text-[15px]">{language === 'tr' ? 'İstasyon Lokasyon Tercihleri' : 'Location Preferences'}</span>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'AVM', icon: '🏢', labelTr: 'AVM', labelEn: 'Mall' },
                { id: 'Kafe', icon: '☕', labelTr: 'Kafe', labelEn: 'Cafe' },
                { id: 'Otel', icon: '🏨', labelTr: 'Otel', labelEn: 'Hotel' },
                { id: 'Tuvalet', icon: '🚻', labelTr: 'Tuvalet', labelEn: 'Restroom' },
                { id: 'Dinlenme Tesisi', icon: '🌲', labelTr: 'Dinlenme Tesisi', labelEn: 'Rest Area' },
                { id: 'Benzinlik', icon: '⛽', labelTr: 'Benzinlik', labelEn: 'Gas Station' },
              ].map((item) => {
                const isActive = selectedLokasyonlar.includes(item.id);
                const label = language === 'tr' ? item.labelTr : item.labelEn;
                return (
                  <button 
                    key={item.id}
                    onClick={() => toggleLokasyon(item.id)}
                    className={cn(
                      "flex flex-col flex-1 items-center justify-center p-4 gap-2 rounded-2xl border transition-all duration-300 shadow-sm",
                      isActive 
                         ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400" 
                         : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/50"
                    )}
                  >
                    <span className={cn("text-2xl mb-1 transition-all duration-300", isActive ? "scale-110 drop-shadow-md" : "opacity-50 grayscale")}>{item.icon}</span>
                    <span className={cn("text-[12px] font-medium text-center transition-colors", isActive ? "text-cyan-400" : "text-white/50")}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
      </div>

      <div className="px-6 py-5 shrink-0 bg-transparent border-t border-white/10 z-50">
         <button onClick={onBack} className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-[0_0_15px_rgba(34,211,238,0.3)]">
           {language === 'tr' ? 'Ayarları Uygula' : 'Apply Settings'}
         </button>
      </div>
    </div>
  );
}
