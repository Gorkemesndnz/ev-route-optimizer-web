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
  Info,
  ChevronLeft,
  ChevronDown
} from "lucide-react";
import { translations } from "../../lib/translations";
import { cn } from "@/lib/utils";

import { useSettings } from "../../contexts/SettingsContext";
import { BugReportForm } from "../menu-forms/BugReportForm";
import { SuggestionForm } from "../menu-forms/SuggestionForm";
import { VehicleRequestForm } from "../menu-forms/VehicleRequestForm";

type MenuID = 'main'|'language'|'units'|'energy'|'appearance'|'suggestions'|'add_vehicle'|'contact'|'how_it_works'|'whats_new'|'faq'|'about'|'terms'|'privacy';

export default function GeneralMenu({ 
  isOpen, 
  onClose,
  onOpenCookieConsent,
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onOpenCookieConsent: () => void;
}) {
  const { language, setLanguage, mapStyleKey, setMapStyleKey } = useSettings();
  const [activeMenu, setActiveMenu] = useState<MenuID>('main');
  const t = translations[language];

  // Internal states
  const [units, setUnits] = useState(t.metric);
  const [energyCons, setEnergyCons] = useState(t.energyPerDist);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleClose = () => {
    onClose();
  };

  const handleMenuClick = (id: MenuID) => {
    setActiveMenu(id);
  };

  interface MenuItem {
    id: MenuID | 'cookie_consent' | 'aboutUs' | 'contactUs';
    icon: React.ReactNode;
    label: string;
    value?: string;
    onClick?: () => void;
    href?: string;
  }

  interface MenuSection {
    title: string;
    items: MenuItem[];
  }

  const menuSections: MenuSection[] = [
    {
      title: t.preferences,
      items: [
        { id: 'appearance', icon: <Moon size={18} />, label: t.appearance, value: mapStyleKey === 'dark' ? t.dark : t.satellite, onClick: () => handleMenuClick('appearance') },
        { id: 'language', icon: <Globe size={18} />, label: t.language, value: language === 'tr' ? 'Türkçe' : 'English', onClick: () => handleMenuClick('language') },
        { id: 'units', icon: <Ruler size={18} />, label: t.units, value: units, onClick: () => handleMenuClick('units') },
        { id: 'energy', icon: <Zap size={18} />, label: t.energyConsumption, value: energyCons, onClick: () => handleMenuClick('energy') }
      ]
    },
    {
      title: t.explore,
      items: [
        { id: 'how_it_works', icon: <Cpu size={18} />, label: t.howItWorks, onClick: () => handleMenuClick('how_it_works') },
        { id: 'whats_new', icon: <Sparkles size={18} />, label: t.whatsNew, onClick: () => handleMenuClick('whats_new') },
        { id: 'faq', icon: <HelpCircle size={18} />, label: t.faq, onClick: () => handleMenuClick('faq') },
        { id: 'about', icon: <Info size={18} />, label: t.aboutUs, href: '/home/hakkimizda' }
      ]
    },
    {
      title: t.supportFeedback,
      items: [
        { id: 'contact', icon: <AlertTriangle size={18} />, label: t.reportBug, onClick: () => handleMenuClick('contact') },
        { id: 'suggestions', icon: <Lightbulb size={18} />, label: t.suggestions, onClick: () => handleMenuClick('suggestions') },
        { id: 'add_vehicle', icon: <PlusCircle size={18} />, label: t.addVehicle, onClick: () => handleMenuClick('add_vehicle') },
        { id: 'contactUs', icon: <MessageSquare size={18} />, label: t.contactUs, href: '/home/iletisim' }
      ]
    },
    {
      title: t.legal,
      items: [
        { id: 'terms', icon: <FileText size={18} />, label: t.terms, href: '/home/kullanim-kosullari' },
        { id: 'privacy', icon: <Shield size={18} />, label: t.privacy, href: '/home/gizlilik' },
        { id: 'cookie_consent', icon: <Cookie size={18} />, label: t.manageCookies, onClick: onOpenCookieConsent }
      ]
    }
  ];

  const InfoSubMenu = ({ type }: { type: 'how_it_works' | 'whats_new' }) => {
    const titles = { 'how_it_works': t.howItWorks, 'whats_new': t.whatsNew };
    const contents = { 'how_it_works': t.howItWorksText, 'whats_new': t.whatsNewText };

    return (
      <div className="flex-1 flex flex-col w-full h-full p-6">
        <div className="flex items-center mb-8">
          <button onClick={() => setActiveMenu('main')} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-white flex-1 text-center mr-6">{titles[type]}</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-white/80 leading-relaxed whitespace-pre-wrap">
            {contents[type]}
          </div>
        </div>
      </div>
    );
  };

  const FAQSubMenu = () => (
    <div className="flex-1 flex flex-col w-full h-full">
      <div className="flex items-center p-6 mb-2">
        <button onClick={() => setActiveMenu('main')} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors outline-none">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-white flex-1 text-center mr-6">{t.faq}</h2>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
        <div className="flex flex-col border border-white/10 rounded-3xl overflow-hidden bg-white/5">
          {t.faqList.map((faq: { q: string, a: string }, index: number) => {
            const isFaqOpen = openFaqIndex === index;
            return (
              <div key={index} className={cn("border-b border-white/10 last:border-0", isFaqOpen && "bg-white/[0.03]")}>
                <button 
                  onClick={() => setOpenFaqIndex(isFaqOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left outline-none transition-colors hover:bg-white/5"
                >
                  <span className={cn("text-sm font-semibold transition-colors pr-4", isFaqOpen ? "text-cyan-400" : "text-white/80")}>
                    {faq.q}
                  </span>
                  <ChevronDown size={18} className={cn("text-white/30 shrink-0 transition-transform duration-300", isFaqOpen && "rotate-180 text-cyan-400")} />
                </button>
                <AnimatePresence>
                  {isFaqOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs leading-relaxed text-white/60">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const FormSubMenu = ({ type }: { type: 'add_vehicle' | 'suggestions' | 'contact' }) => {
    const config = {
      add_vehicle: { title: t.vehicleRequestTitle, Form: VehicleRequestForm },
      suggestions: { title: t.suggestionTitle, Form: SuggestionForm },
      contact: { title: t.bugReportTitle, Form: BugReportForm }
    };
    const { title, Form } = config[type];

    return (
      <div className="flex-1 flex flex-col w-full h-full p-6 relative">
        <div className="flex items-center mb-8">
          <button onClick={() => setActiveMenu('main')} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors outline-none cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-white flex-1 text-center mr-6">{title}</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <Form onSuccess={handleClose} />
        </div>
      </div>
    );
  };

  const SelectionSubMenu = () => {
    let title = "";
    let options: { id: string, label: string, sub: string }[] = [];
    let currentState = "";
    let setFn = (_val: any) => { };

    if (activeMenu === 'appearance') {
      title = t.appearance;
      options = [
        { id: "dark", label: t.dark, sub: "" },
        { id: "satellite", label: t.satellite, sub: "" }
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
            <ChevronLeft size={24} strokeWidth={2.5} />
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
                className={`w-full text-left p-[18px] rounded-xl border flex items-center justify-between transition-all outline-none ${isSelected
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
                  <div className={`w-[22px] h-[22px] rounded-full border-[2px] flex flex-shrink-0 items-center justify-center transition-colors ${isSelected ? 'border-white' : 'border-white/30'
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

  const renderSubMenuContent = () => {
    switch (activeMenu) {
      case 'how_it_works':
      case 'whats_new':
        return <InfoSubMenu type={activeMenu} />;
      case 'faq':
        return <FAQSubMenu />;
      case 'add_vehicle':
      case 'suggestions':
      case 'contact':
        return <FormSubMenu type={activeMenu} />;
      case 'appearance':
      case 'language':
      case 'units':
      case 'energy':
        return <SelectionSubMenu />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence onExitComplete={() => {
      setActiveMenu('main');
      setOpenFaqIndex(null);
    }}>
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
                          {section.items.map((item, itemIdx: number) => {
                            const content = (
                              <>
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
                              </>
                            );

                            if (item.href) {
                              return (
                                <a
                                  key={itemIdx}
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group text-left outline-none"
                                >
                                  {content}
                                </a>
                              );
                            }

                            return (
                              <button 
                                key={itemIdx}
                                onClick={() => {
                                  if (item.onClick) item.onClick();
                                }}
                                className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group text-left outline-none"
                              >
                                {content}
                              </button>
                            );
                          })}
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

