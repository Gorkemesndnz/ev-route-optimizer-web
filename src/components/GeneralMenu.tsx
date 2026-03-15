import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Globe, 
  Ruler, 
  HelpCircle, 
  Sparkles, 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  Shield, 
  Cookie, 
  ChevronRight,
  Cpu,
  Moon,
  Zap,
  Lightbulb,
  PlusCircle,
  Info
} from "lucide-react";
import { translations } from "../lib/translations";

export default function GeneralMenu({ 
  isOpen, 
  onClose,
  onOpenCookieConsent,
  onOpenPrivacy,
  onOpenAbout,
  language,
  setLanguage,
  mapStyleKey,
  setMapStyleKey
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onOpenCookieConsent: () => void;
  onOpenPrivacy: () => void;
  onOpenAbout: () => void;
  language: 'tr' | 'en';
  setLanguage: (lang: 'tr' | 'en') => void;
  mapStyleKey: string;
  setMapStyleKey: (key: any) => void;
}) {
  const [activeMenu, setActiveMenu] = useState<'main'|'language'|'units'|'energy'|'appearance'>('main');
  const t = translations[language];

  // Internal states for things that aren't global yet or just display values
  const [units, setUnits] = useState('Metrik');
  const [energyCons, setEnergyCons] = useState('Wh/km');

  const handleClose = () => {
    onClose();
    setTimeout(() => setActiveMenu('main'), 300);
  };

  const menuSections = [
    {
      title: t.preferences,
      items: [
        { icon: <Moon size={18} />, label: t.appearance, value: mapStyleKey === 'dark' ? t.dark : (mapStyleKey === 'light' ? t.light : t.system), onClick: () => setActiveMenu('appearance') },
        { icon: <Globe size={18} />, label: t.language, value: language === 'tr' ? 'Türkçe' : 'English', onClick: () => setActiveMenu('language') },
        { icon: <Ruler size={18} />, label: t.units, value: units, onClick: () => setActiveMenu('units') },
        { icon: <Zap size={18} />, label: t.energyConsumption, value: energyCons, onClick: () => setActiveMenu('energy') }
      ]
    },
    {
      title: t.explore,
      items: [
        { icon: <Cpu size={18} />, label: t.howItWorks },
        { icon: <Sparkles size={18} />, label: t.whatsNew },
        { icon: <HelpCircle size={18} />, label: t.faq },
        { icon: <Info size={18} />, label: t.aboutUs, onClick: onOpenAbout }
      ]
    },
    {
      title: t.supportFeedback,
      items: [
        { icon: <AlertTriangle size={18} />, label: t.reportBug },
        { icon: <Lightbulb size={18} />, label: t.suggestions },
        { icon: <PlusCircle size={18} />, label: t.addVehicle },
        { icon: <MessageSquare size={18} />, label: t.contactUs }
      ]
    },
    {
      title: t.legal,
      items: [
        { icon: <FileText size={18} />, label: t.terms },
        { icon: <Shield size={18} />, label: t.privacy, onClick: onOpenPrivacy },
        { icon: <Cookie size={18} />, label: t.manageCookies, onClick: onOpenCookieConsent }
      ]
    }
  ];

  const renderSubMenuContent = () => {
    let title = "";
    let options: {id: any, label: string, sub: string}[] = [];
    let currentState = "";
    let setFn = (val: any) => {};

    if (activeMenu === 'appearance') {
      title = t.appearance;
      options = [
        { id: "system", label: t.system, sub: "" },
        { id: "dark", label: t.dark, sub: "" },
        { id: "light", label: t.light, sub: "" }
      ];
      currentState = mapStyleKey;
      setFn = (val) => setMapStyleKey(val);
    } else if (activeMenu === 'language') {
      title = t.language;
      options = [
        { id: "tr", label: "Türkçe", sub: "" },
        { id: "en", label: "English", sub: "" }
      ];
      currentState = language;
      setFn = setLanguage;
    } else if (activeMenu === 'units') {
      title = t.units;
      options = [
        { id: "Metrik", label: t.metric, sub: "km, Wh/km, °C" },
        { id: "US", label: t.us, sub: "mi, mi/Wh, °F" },
        { id: "UK", label: t.uk, sub: "mi, mi/Wh, °C" }
      ];
      currentState = units;
      setFn = setUnits;
    } else if (activeMenu === 'energy') {
      title = t.energyConsumption;
      options = [
        { id: "Wh/km", label: t.energyPerDist, sub: "Wh/km" },
        { id: "km/Wh", label: t.distPerEnergy, sub: "km/Wh" }
      ];
      currentState = energyCons;
      setFn = setEnergyCons;
    }

    return (
      <div className="flex-1 flex flex-col w-full h-full relative">
        <div className="flex items-center p-6 shrink-0 relative">
          <button 
            onClick={() => setActiveMenu('main')}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors outline-none z-10"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
          <div className="absolute inset-x-0 text-center pointer-events-none">
            <span className="text-[17px] font-bold text-white tracking-wide">{title}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0 flex flex-col gap-3">
          {options.map((opt) => {
            const isSelected = currentState === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setFn(opt.id)}
                className={`w-full text-left p-[18px] rounded-xl border flex items-center justify-between transition-all outline-none ${
                  isSelected 
                    ? 'border-white bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.03)]' 
                    : 'border-white/10 hover:border-white/30 hover:bg-white/[0.02]'
                }`}
              >
                <span className={`text-[15px] font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                  {opt.label}
                </span>
                <div className="flex items-center gap-4">
                  {opt.sub && (
                    <span className={`text-[13px] tracking-wide font-medium ${isSelected ? 'text-white/50' : 'text-white/30'}`}>
                      {opt.sub}
                    </span>
                  )}
                  <div className={`w-[22px] h-[22px] rounded-full border-[2px] flex flex-shrink-0 items-center justify-center transition-colors ${
                    isSelected ? 'border-white' : 'border-white/30'
                  }`}>
                    {isSelected && <div className="w-[10px] h-[10px] rounded-full bg-white transition-all scale-100" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="general-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] pointer-events-auto cursor-pointer"
          />

          <motion.div
            key="general-menu-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="fixed top-0 right-0 h-[100svh] w-full sm:w-[420px] glass-panel !rounded-none z-[90] flex flex-col pointer-events-auto border-y-0 border-r-0 border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {activeMenu === 'main' ? (
                <motion.div
                  key="main"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col w-full h-full"
                >
                  <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                    <span className="text-xl font-black tracking-widest text-emerald-500 uppercase">IYONTREE</span>
                    <button 
                      onClick={handleClose}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white glass-panel border border-white/10 shadow-none transition-all hover:bg-white/10 outline-none"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">
                    {menuSections.map((section, idx) => (
                      <div key={idx} className="flex flex-col gap-3">
                        <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-widest pl-1">{section.title}</h4>
                        <div className="flex flex-col gap-1">
                          {section.items.map((item, itemIdx) => (
                            <button 
                              key={itemIdx}
                              onClick={() => {
                                if (item.onClick) {
                                  item.onClick();
                                }
                              }}
                              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group text-left outline-none"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-white/40 group-hover:text-cyan-400 transition-colors">
                                  {item.icon}
                                </div>
                                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                                  {item.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.value && (
                                  <span className="text-xs font-semibold text-white/40 group-hover:text-white/60">{item.value}</span>
                                )}
                                <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 border-t border-white/10 shrink-0 flex justify-center">
                    <span className="text-[11px] font-semibold tracking-widest text-white/30 uppercase">IYONTREE v1.0.0 Beta</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="submenu"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col w-full h-full"
                >
                  {renderSubMenuContent()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

