import { useEffect, useState } from "react";
import { ChevronLeft, Zap, BatteryMedium, Calendar as CalendarIcon, MapPin, Search, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { translations } from "../../lib/translations";
import {
  normalizeRouteSettingsSoc,
  normalizeStationSocPair,
  ROUTE_SOC_BOUNDS,
} from "../../lib/routeSocSettings";

const CustomSwitch = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: (val: boolean) => void, disabled?: boolean }) => {
  return (
    <div
      onClick={() => { if (!disabled) onChange(!checked); }}
      className={cn(
        "w-12 h-7 rounded-full relative transition-colors duration-300 flex items-center px-1 shadow-inner",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
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

const NativeSlider = ({ value, min, max, onChange, disabled = false }: { value: number, min: number, max: number, onChange: (v: number) => void, disabled?: boolean }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("relative w-full h-1.5 bg-white/20 rounded-full shadow-inner flex items-center", disabled && "opacity-40")}>
      <div
        className="absolute left-0 h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)] pointer-events-none transition-all duration-75"
        style={{ width: `${percentage}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("absolute w-full h-full opacity-0 z-10 m-0 p-0", disabled ? "cursor-not-allowed" : "cursor-ew-resize")}
      />
      <div
        className="absolute w-5 h-5 bg-white rounded-full shadow-md pointer-events-none transition-all duration-75 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] border border-cyan-400/20"
        style={{ left: `calc(${percentage}% - (${percentage * 20 / 100}px))` }}
      />
    </div>
  );
};

import { useSettings } from "../../contexts/SettingsContext";
import { useRouteContext, type RouteSettings } from "../../contexts/RouteContext";

/**
 * Override slider — manuel/otomatik mod arasında geçiş yapar.
 * value=null → "Otomatik" badge'i + slider 50% pozisyonunda gri.
 * value=number → kullanıcı override etti, slider aktif + reset butonu çıkar.
 *
 * Kullanıcı slider'a dokununca onChange(number) tetiklenir → null'dan çıkar.
 * Reset butonu onChange(null) çağırır.
 */
const OverrideSlider = ({
  label,
  value,
  defaultDisplay,
  min,
  max,
  onChange,
  language,
  disabled = false,
}: {
  label: string,
  value: number | null,
  defaultDisplay: number,  // null iken slider'ın görsel pozisyonu
  min: number,
  max: number,
  onChange: (v: number | null) => void,
  language: 'tr' | 'en',
  disabled?: boolean,
}) => {
  const isAuto = value === null;
  const displayValue = value ?? defaultDisplay;
  return (
    <div className={cn("flex flex-col gap-3", disabled && "opacity-60")}>
      <div className="flex items-center justify-between">
        <span className="text-white/70 text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {isAuto || disabled ? (
            <span className="text-[10px] font-semibold tracking-wider uppercase text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              {language === 'tr' ? 'Otomatik' : 'Auto'}
            </span>
          ) : (
            <>
              <button
                onClick={() => onChange(null)}
                title={language === 'tr' ? 'Otomatiğe sıfırla' : 'Reset to auto'}
                className="text-white/40 hover:text-cyan-400 transition-colors p-1 rounded-md hover:bg-white/10"
              >
                <RotateCcw size={12} />
              </button>
              <div className="flex items-center">
                <span className="text-cyan-400 font-bold text-sm">%</span>
                <span className="w-8 text-cyan-400 font-bold text-sm text-center">{value}</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className={cn("transition-opacity", isAuto && "opacity-50")}>
        <NativeSlider value={displayValue} min={min} max={max} onChange={(v) => onChange(v)} disabled={disabled} />
      </div>
    </div>
  );
};

export default function RouteSettingsView({
  onBack,
}: {
  onBack: () => void,
}) {
  const { language } = useSettings();
  const t = translations[language];
  const { pendingSettings, commitSettings } = useRouteContext();
  const [draftSettings, setDraftSettings] = useState<RouteSettings>(() => normalizeRouteSettingsSoc(pendingSettings));
  const [brandQuery, setBrandQuery] = useState("");

  useEffect(() => {
    setDraftSettings(normalizeRouteSettingsSoc(pendingSettings));
  }, [pendingSettings]);

  const updateDraft = (patch: Partial<RouteSettings>) => {
    setDraftSettings(prev => ({ ...prev, ...patch }));
  };

  const toggles = {
    devletOtoyollari: draftSettings.toggleOtoyollar,
    feribot: draftSettings.toggleFeribot,
    ozelOtoyollar: draftSettings.toggleOzelOtoyollar,
    ucretliOtoyollar: draftSettings.toggleUcretliOtoyollar,
    kopru: draftSettings.toggleKopruler,
  };

  const stationBrands = draftSettings.stationBrands ?? [];
  const selectedLokasyonlar = draftSettings.locationPrefs ?? [];
  const sarjTercipi = draftSettings.chargerSpeedPref === 'any' ? null : draftSettings.chargerSpeedPref;

  const toggleOption = (key: keyof typeof toggles) => {
    switch (key) {
      case 'devletOtoyollari':
        updateDraft({ toggleOtoyollar: !draftSettings.toggleOtoyollar });
        break;
      case 'feribot':
        updateDraft({ toggleFeribot: !draftSettings.toggleFeribot });
        break;
      case 'ozelOtoyollar':
        updateDraft({ toggleOzelOtoyollar: !draftSettings.toggleOzelOtoyollar });
        break;
      case 'ucretliOtoyollar':
        updateDraft({ toggleUcretliOtoyollar: !draftSettings.toggleUcretliOtoyollar });
        break;
      case 'kopru':
        updateDraft({ toggleKopruler: !draftSettings.toggleKopruler });
        break;
    }
  };

  const toggleLokasyon = (isim: string) => {
    if (draftSettings.smartPlanner) return;
    const nextPrefs = selectedLokasyonlar.includes(isim)
      ? selectedLokasyonlar.filter(l => l !== isim)
      : [...selectedLokasyonlar, isim];
    updateDraft({ locationPrefs: nextPrefs });
  };

  const toggleBrand = (brand: string) => {
    const nextBrands = stationBrands.includes(brand)
      ? stationBrands.filter(b => b !== brand)
      : [...stationBrands, brand];
    updateDraft({ stationBrands: nextBrands });
  };

  const setSmartPlanner = (smartPlanner: boolean) => {
    updateDraft({
      smartPlanner,
      arrivalSoc: smartPlanner ? null : draftSettings.arrivalSoc,
      stationArrivalSoc: smartPlanner ? null : draftSettings.stationArrivalSoc,
      stationDepartureSoc: smartPlanner ? null : draftSettings.stationDepartureSoc,
    });
  };

  const setStationArrivalSoc = (stationArrivalSoc: number | null) => {
    updateDraft(normalizeStationSocPair(stationArrivalSoc, draftSettings.stationDepartureSoc));
  };

  const setStationDepartureSoc = (stationDepartureSoc: number | null) => {
    updateDraft(normalizeStationSocPair(draftSettings.stationArrivalSoc, stationDepartureSoc));
  };

  // istasyon ayarları smart açıkken devre dışı
  const stationDisabled = draftSettings.smartPlanner;

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

        {/* ============================== */}
        {/* GENEL ROTA AYARLARI */}
        {/* ============================== */}
        <div className="flex flex-col gap-6">
          <h3 className="text-[13px] font-bold text-white/40 tracking-widest uppercase">{language === 'tr' ? 'Genel Rota Ayarları' : 'General Route Settings'}</h3>

          {/* Yol Tercihleri (en üstte) */}
          <div className="flex flex-col gap-5 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-inner">
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

          {/* Yola Çıkış Saati */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-cyan-400" />
              <span className="text-white font-semibold text-[15px]">{language === 'tr' ? 'Yola Çıkış Zamanı' : 'Departure Time'}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={draftSettings.departureDate}
                onChange={(e) => updateDraft({ departureDate: e.target.value })}
                className="w-full bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3.5 text-white/70 text-sm border border-white/10 focus:outline-none focus:border-cyan-400/50 transition-all [color-scheme:dark]"
              />
              <input
                type="time"
                value={draftSettings.departureTime}
                onChange={(e) => updateDraft({ departureTime: e.target.value })}
                className="w-full bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3.5 text-white/70 text-sm border border-white/10 focus:outline-none focus:border-cyan-400/50 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* İstasyon Markaları */}
          <div className="flex flex-col gap-4 overflow-hidden relative">
            <span className="text-white font-semibold text-[15px]">{language === 'tr' ? 'İstasyon Markaları' : 'Station Brands'}</span>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
              <input
                type="text"
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                placeholder={language === 'tr' ? 'Marka Seç' : 'Select Brand'}
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner"
              />
            </div>
            <div className="mt-1 w-full pl-0.5">
              <span className="text-white/40 text-[12px] font-medium mb-3 block">{language === 'tr' ? 'Sık tercih edilenler' : 'Frequently selected'}</span>
              <div className="grid grid-cols-4 gap-2.5 w-full">
                {['ZES', 'Eşarj', 'Sharz', 'Trugo', 'Voltrun', 'Tesla', 'Wat', 'DB']
                  .filter(b => !brandQuery || b.toLowerCase().includes(brandQuery.toLowerCase()))
                  .map((brand) => {
                    const active = stationBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className={cn(
                          "transition-all py-1.5 rounded-xl text-sm border hover:shadow-md text-center",
                          active
                            ? "bg-cyan-400/15 border-cyan-400/60 text-cyan-300"
                            : "bg-white/5 hover:bg-white/15 text-white/80 border-white/10 hover:border-white/30"
                        )}
                      >
                        {brand}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Akıllı Rota Planlayıcı toggle */}
          <div className={cn(
            "flex flex-col gap-5 rounded-2xl p-5 border transition-all",
            draftSettings.smartPlanner
              ? "bg-cyan-400/10 border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
              : "bg-white/5 border-white/10"
          )}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Sparkles size={18} className={cn("mt-0.5 shrink-0", draftSettings.smartPlanner ? "text-cyan-300" : "text-white/60")} />
                <div className="flex flex-col gap-1">
                  <span className="text-white font-semibold text-[15px]">{t.smartPlannerTitle}</span>
                  <span className="text-white/60 text-[12px] leading-snug">{t.smartPlannerDesc}</span>
                </div>
              </div>
              <CustomSwitch checked={draftSettings.smartPlanner} onChange={setSmartPlanner} />
            </div>
            <div className="pt-4 border-t border-white/10">
              <OverrideSlider
                label={t.arrivalSoC}
                value={draftSettings.smartPlanner ? null : draftSettings.arrivalSoc}
                defaultDisplay={20}
                min={ROUTE_SOC_BOUNDS.arrivalSoc.min}
                max={ROUTE_SOC_BOUNDS.arrivalSoc.max}
                onChange={(arrivalSoc) => updateDraft({ arrivalSoc })}
                language={language}
                disabled={draftSettings.smartPlanner}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full my-1"></div>

        {/* ============================== */}
        {/* İSTASYON AYARLARI */}
        {/* ============================== */}
        <div className={cn("flex flex-col gap-6 transition-opacity", stationDisabled && "opacity-50 pointer-events-none select-none")}
             aria-disabled={stationDisabled}>
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-white/40 tracking-widest uppercase">{language === 'tr' ? 'İstasyon Ayarları' : 'Station Settings'}</h3>
            {stationDisabled && (
              <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-300/80 bg-cyan-400/10 border border-cyan-400/30 px-2 py-1 rounded-full">
                {t.smartActiveBadge}
              </span>
            )}
          </div>

          {/* Şarj Sıklığı */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-cyan-400" />
              <span className="text-white font-semibold text-[15px]">{language === 'tr' ? 'Şarj Sıklığı' : 'Charging Frequency'}</span>
            </div>
            <div className="flex w-full bg-white/5 rounded-2xl p-1 border border-white/10 shadow-inner">
              {(language === 'tr' ? ["Optimal", "Az", "Sık"] : ["Optimal", "Few", "Many"]).map((label, idx) => {
                const values = ["optimal", "az", "sik"] as const;
                const val = values[idx];
                const isActive = draftSettings.chargingFrequency === val;
                return (
                  <button
                    key={val}
                    onClick={() => !stationDisabled && updateDraft({ chargingFrequency: val })}
                    disabled={stationDisabled}
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

          {/* İstasyon Şarj Tercihleri */}
          <div className="flex flex-col gap-3">
            <span className="text-white font-semibold text-[15px]">{language === 'tr' ? 'İstasyon Şarj Tercihleri' : 'Charge Preferences'}</span>
            <div className="flex gap-2.5">
              {(['HPC', 'DC', 'AC'] as const).map(tip => (
                <button
                  key={tip}
                  onClick={() => !stationDisabled && updateDraft({ chargerSpeedPref: tip })}
                  disabled={stationDisabled}
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

          {/* İstasyon Lokasyon Tercihleri */}
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
                    disabled={stationDisabled}
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

        {/* ============================== */}
        {/* MANUEL ÜZERINE YAZMA — sadece Smart Planner OFF iken görünür */}
        {/* Varış SOC Smart Planner kartında durur; burada istasyon SOC değerleri kalır. */}
        {/* Sliderlar dokunulmadıkça null kalır → backend kendisi hesaplar. */}
        {/* ============================== */}
        {!draftSettings.smartPlanner && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full my-1"></div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <BatteryMedium size={16} className="text-cyan-400/80" />
                <h3 className="text-[13px] font-bold text-white/40 tracking-widest uppercase">
                  {language === 'tr' ? 'Manuel Üzerine Yazma' : 'Manual Override'}
                </h3>
              </div>
              <p className="text-white/50 text-[12px] leading-snug -mt-2">
                {language === 'tr'
                  ? 'Manuel modda istasyon SOC değerlerini siz belirlersiniz. Boş bırakırsanız backend otomatik hesaplar.'
                  : 'In manual mode you can set these values. Leave them empty to let the backend calculate.'}
              </p>

              <div className="flex flex-col gap-5 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-inner">
                <OverrideSlider
                  label={language === 'tr' ? 'İstasyona Varış (Min)' : 'Station Arrival (Min)'}
                  value={draftSettings.stationArrivalSoc}
                  defaultDisplay={10}
                  min={ROUTE_SOC_BOUNDS.stationArrivalSoc.min}
                  max={ROUTE_SOC_BOUNDS.stationArrivalSoc.max}
                  onChange={setStationArrivalSoc}
                  language={language}
                />
                <OverrideSlider
                  label={language === 'tr' ? 'İstasyondan Ayrılış (Hedef)' : 'Station Departure (Target)'}
                  value={draftSettings.stationDepartureSoc}
                  defaultDisplay={80}
                  min={ROUTE_SOC_BOUNDS.stationDepartureSoc.min}
                  max={ROUTE_SOC_BOUNDS.stationDepartureSoc.max}
                  onChange={setStationDepartureSoc}
                  language={language}
                />
              </div>
            </div>
          </>
        )}

      </div>

      <div className="px-6 py-5 shrink-0 bg-transparent border-t border-white/10 z-50">
        <button
          onClick={() => {
            const nextSettings: RouteSettings = normalizeRouteSettingsSoc({
              ...draftSettings,
              arrivalSoc: draftSettings.smartPlanner ? null : draftSettings.arrivalSoc,
              stationArrivalSoc: draftSettings.smartPlanner ? null : draftSettings.stationArrivalSoc,
              stationDepartureSoc: draftSettings.smartPlanner ? null : draftSettings.stationDepartureSoc,
              stationBrands: [...stationBrands],
              locationPrefs: [...selectedLokasyonlar],
            });
            commitSettings(nextSettings);
            onBack();
          }}
          className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-[0_0_15px_rgba(34,211,238,0.3)]"
        >
          {language === 'tr' ? 'Ayarları Uygula' : 'Apply Settings'}
        </button>
      </div>
    </div>
  );
}
