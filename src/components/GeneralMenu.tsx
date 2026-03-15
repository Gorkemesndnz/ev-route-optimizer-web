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
  CheckCircle,
  ChevronLeft,
  ChevronDown
} from "lucide-react";
import { translations } from "../lib/translations";
import { cn } from "@/lib/utils";

import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";

const evBrands = ["Tesla", "Togg", "BMW", "Mercedes-Benz", "Audi", "Porsche", "Hyundai", "Kia", "BYD", "MG", "Ford", "Volvo", "Renault", "Peugeot", "Diğer"];

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
  const { currentUser } = useAuth();
  const [activeMenu, setActiveMenu] = useState<'main'|'language'|'units'|'energy'|'appearance'|'suggestions'|'add_vehicle'|'contact'|'how_it_works'|'whats_new'|'faq'|'about'|'terms'|'privacy'>('main');
  const t = translations[language];

  // ... (keeping existing form states)
  const [isVehicleSubmitted, setIsVehicleSubmitted] = useState(false);
  const [isSuggestionSubmitted, setIsSuggestionSubmitted] = useState(false);
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);

  // Bug Report Form States
  const [bugName, setBugName] = useState(currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '');
  const [bugEmail, setBugEmail] = useState(currentUser?.email || '');
  const [bugSubject, setBugSubject] = useState('');
  const [bugMessage, setBugMessage] = useState('');
  const [bugEmailError, setBugEmailError] = useState('');

  // Suggestion Form States
  const [sugName, setSugName] = useState(currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '');
  const [sugEmail, setSugEmail] = useState(currentUser?.email || '');
  const [sugSubject, setSugSubject] = useState('');
  const [sugMessage, setSugMessage] = useState('');
  const [sugEmailError, setSugEmailError] = useState('');

  // Vehicle Form States
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [vModel, setVModel] = useState('');
  const [vMessage, setVMessage] = useState('');
  const [vName, setVName] = useState(currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '');
  const [vEmail, setVEmail] = useState(currentUser?.email || '');
  const [vEmailError, setVEmailError] = useState('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  // Internal states
  const [units, setUnits] = useState('Metrik');
  const [energyCons, setEnergyCons] = useState('Wh/km');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setActiveMenu('main');
      setIsVehicleSubmitted(false);
      setIsSuggestionSubmitted(false);
      setIsContactSubmitted(false);
      setOpenFaqIndex(null);
      // Reset bug form only if guest, or keep synced with user
      if (!currentUser) {
        setBugName('');
        setBugEmail('');
      } else {
        setBugName(`${currentUser.firstName} ${currentUser.lastName}`);
        setBugEmail(currentUser.email);
      }
      setBugSubject('');
      setBugMessage('');
      setBugEmailError('');

      // Reset suggestion form
      if (!currentUser) {
        setSugName('');
        setSugEmail('');
      } else {
        setSugName(`${currentUser.firstName} ${currentUser.lastName}`);
        setSugEmail(currentUser.email);
      }
      setSugSubject('');
      setSugMessage('');
      setSugEmailError('');

      // Reset vehicle form
      setBrandSearchQuery('');
      setSelectedBrand('');
      setCustomBrand('');
      setVModel('');
      setVMessage('');
      if (!currentUser) {
        setVName('');
        setVEmail('');
      } else {
        setVName(`${currentUser.firstName} ${currentUser.lastName}`);
        setVEmail(currentUser.email);
      }
      setVEmailError('');
      setIsBrandDropdownOpen(false);
    }, 300);
  };

  const handleMenuClick = (id: string) => {
    setActiveMenu(id as any);
  };

  const menuSections = [
    {
      title: t.preferences,
      items: [
        { id: 'appearance', icon: <Moon size={18} />, label: t.appearance, value: mapStyleKey === 'dark' ? t.dark : (mapStyleKey === 'light' ? t.light : t.system), onClick: () => handleMenuClick('appearance') },
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

  const renderSubMenuContent = () => {
    if (activeMenu === 'how_it_works' || activeMenu === 'whats_new') {
       const titles = {
         'how_it_works': t.howItWorks,
         'whats_new': t.whatsNew
       };
       const contents = {
         'how_it_works': t.howItWorksText,
         'whats_new': t.whatsNewText
       };

       return (
         <div className="flex-1 flex flex-col w-full h-full p-6">
           <div className="flex items-center mb-8">
             <button onClick={() => setActiveMenu('main')} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors">
               <ChevronLeft size={24} />
             </button>
             <h2 className="text-xl font-bold text-white flex-1 text-center mr-6">{titles[activeMenu]}</h2>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-white/80 leading-relaxed whitespace-pre-wrap">
               {contents[activeMenu]}
             </div>
           </div>
         </div>
       );
    }

    if (activeMenu === 'faq') {
      return (
        <div className="flex-1 flex flex-col w-full h-full">
          <div className="flex items-center p-6 mb-2">
            <button onClick={() => setActiveMenu('main')} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors outline-none">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-white flex-1 text-center mr-6">{t.faq}</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
            <div className="flex flex-col border border-white/10 rounded-3xl overflow-hidden bg-white/5">
              {(t.faqList as any[]).map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className={cn("border-b border-white/10 last:border-0", isOpen && "bg-white/[0.03]")}>
                    <button 
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left outline-none transition-colors hover:bg-white/5"
                    >
                      <span className={cn("text-sm font-semibold transition-colors pr-4", isOpen ? "text-cyan-400" : "text-white/80")}>
                        {faq.q}
                      </span>
                      <ChevronDown size={18} className={cn("text-white/30 shrink-0 transition-transform duration-300", isOpen && "rotate-180 text-cyan-400")} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
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
    }
    if (activeMenu === 'add_vehicle') {
      const filteredBrands = evBrands.filter(b => 
        b.toLowerCase().includes(brandSearchQuery.toLowerCase())
      );

      const isVehicleFormValid = 
        vName.trim() !== '' && 
        vEmail.trim() !== '' && 
        vEmailError === '' && 
        vModel.trim() !== '' && 
        ((selectedBrand && selectedBrand !== 'Diğer') || (selectedBrand === 'Diğer' && customBrand.trim() !== ''));

      const handleBrandSelect = (brand: string) => {
        setSelectedBrand(brand);
        setBrandSearchQuery(brand === 'Diğer' ? '' : brand);
        setIsBrandDropdownOpen(false);
      };

      const handleVNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (currentUser) return;
        const val = e.target.value;
        const regex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/;
        if (regex.test(val)) {
          setVName(val);
        }
      };

      const validateVEmail = () => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (vEmail.trim() !== '' && !regex.test(vEmail)) {
          setVEmailError(t.validation.invalidEmail);
        } else {
          setVEmailError('');
        }
      };

      return (
        <div className="flex-1 flex flex-col w-full h-full p-6 relative">
          <div className="flex items-center mb-8">
            <button onClick={() => setActiveMenu('main')} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors outline-none cursor-pointer">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-white flex-1 text-center mr-6">{t.vehicleRequestTitle}</h2>
          </div>

          <AnimatePresence mode="wait">
            {isVehicleSubmitted ? (
               // ... (success state)
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center gap-6"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t.requestReceived}</h3>
                  <p className="text-white/60 leading-relaxed">{t.requestSuccess}</p>
                </div>
                <button 
                  onClick={() => { setIsVehicleSubmitted(false); setActiveMenu('main'); }}
                  className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-all active:scale-95"
                >
                  {t.goBack}
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-1 pb-4">
                {/* User Info */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/50 px-1">{t.fullname}</label>
                  <input 
                    type="text" 
                    value={vName}
                    onChange={handleVNameChange}
                    readOnly={!!currentUser}
                    placeholder={t.fullname}
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all",
                      currentUser && "opacity-60 cursor-not-allowed bg-black/20"
                    )} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/50 px-1">{t.email}</label>
                  <input 
                    type="email" 
                    value={vEmail}
                    onChange={(e) => !currentUser && setVEmail(e.target.value)}
                    onBlur={validateVEmail}
                    readOnly={!!currentUser}
                    placeholder={t.email}
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none transition-all",
                      vEmailError ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400/50",
                      currentUser && "opacity-60 cursor-not-allowed bg-black/20"
                    )} 
                  />
                  {vEmailError && <p className="text-red-400 text-xs px-1">{vEmailError}</p>}
                </div>

                {/* Brand Selector (Combobox) */}
                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-medium text-white/50 px-1">{t.vehicleBrand}</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={isBrandDropdownOpen ? brandSearchQuery : (selectedBrand || brandSearchQuery)}
                      onChange={(e) => {
                        setBrandSearchQuery(e.target.value);
                        if (!isBrandDropdownOpen) setIsBrandDropdownOpen(true);
                        if (selectedBrand) setSelectedBrand('');
                      }}
                      onClick={() => setIsBrandDropdownOpen(true)}
                      placeholder={t.vehicleBrandPlaceholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all outline-none"
                    />
                    <ChevronDown size={18} className={cn("absolute right-4 top-1/2 -translate-y-1/2 text-white/30 transition-transform duration-300 pointer-events-none", isBrandDropdownOpen && "rotate-180")} />
                  </div>

                  {/* Dropdown List */}
                  <AnimatePresence>
                    {isBrandDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden max-h-[240px] overflow-y-auto custom-scrollbar"
                      >
                        {filteredBrands.length > 0 ? (
                          filteredBrands.map((brand) => (
                            <button
                              key={brand}
                              onClick={() => handleBrandSelect(brand)}
                              className="w-full text-left px-5 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 outline-none"
                            >
                              {brand}
                            </button>
                          ))
                        ) : (
                          <div className="px-5 py-4 text-sm text-white/30 italic">Sonuç bulunamadı</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Conditional Custom Brand Input */}
                <AnimatePresence>
                  {selectedBrand === 'Diğer' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-col gap-2 overflow-hidden"
                    >
                      <label className="text-sm font-medium text-white/50 px-1">{t.customBrandLabel}</label>
                      <input 
                        type="text" 
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        placeholder={t.customBrandPlaceholder}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all outline-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/50 px-1">{t.vehicleModel}</label>
                  <input 
                    type="text" 
                    value={vModel}
                    onChange={(e) => setVModel(e.target.value)}
                    placeholder={t.vehicleModelPlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/50 px-1">{t.vehicleDetails}</label>
                  <textarea 
                    rows={4}
                    value={vMessage}
                    onChange={(e) => setVMessage(e.target.value)}
                    placeholder={t.vehicleDetailsPlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all resize-none outline-none"
                  />
                </div>
                <button 
                  onClick={() => setIsVehicleSubmitted(true)}
                  disabled={!isVehicleFormValid}
                  className={cn(
                    "w-full py-4 font-bold rounded-xl transition-all active:scale-95 mt-2 shadow-[0_0_20px_rgba(34,211,238,0.2)]",
                    isVehicleFormValid ? "bg-cyan-400 hover:bg-cyan-300 text-zinc-950" : "bg-white/5 text-white/20 cursor-not-allowed shadow-none border border-white/5"
                  )}
                >
                  {t.send}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close dropdown on outside click handling - simplistic overlay */}
          {isBrandDropdownOpen && (
            <div 
              className="fixed inset-0 z-[95]" 
              onClick={() => setIsBrandDropdownOpen(false)}
            />
          )}
        </div>
      );
    }

    if (activeMenu === 'suggestions') {
      const isSugFormValid = 
        sugName.trim() !== '' && 
        sugEmail.trim() !== '' && 
        sugSubject !== '' && 
        sugSubject !== 'select' && 
        sugMessage.trim() !== '' && 
        sugEmailError === '';

      const handleSugNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (currentUser) return;
        const val = e.target.value;
        const regex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/;
        if (regex.test(val)) {
          setSugName(val);
        }
      };

      const validateSugEmail = () => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (sugEmail.trim() !== '' && !regex.test(sugEmail)) {
          setSugEmailError(t.validation.invalidEmail);
        } else {
          setSugEmailError('');
        }
      };

      return (
        <div className="flex-1 flex flex-col w-full h-full p-6">
          <div className="flex items-center mb-8">
            <button onClick={() => setActiveMenu('main')} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors outline-none cursor-pointer">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-white flex-1 text-center mr-6">{t.suggestionTitle}</h2>
          </div>

          <AnimatePresence mode="wait">
            {isSuggestionSubmitted ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center gap-6"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t.suggestionReceived}</h3>
                  <p className="text-white/60 leading-relaxed">{t.suggestionSuccess}</p>
                </div>
                <button 
                  onClick={() => { setIsSuggestionSubmitted(false); setActiveMenu('main'); }}
                  className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-all active:scale-95"
                >
                  {t.goBack}
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-1 pb-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/50 px-1">{t.fullname}</label>
                  <input 
                    type="text" 
                    value={sugName}
                    onChange={handleSugNameChange}
                    readOnly={!!currentUser}
                    placeholder={t.fullname}
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all",
                      currentUser && "opacity-60 cursor-not-allowed bg-black/20"
                    )} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/50 px-1">{t.email}</label>
                  <input 
                    type="email" 
                    value={sugEmail}
                    onChange={(e) => !currentUser && setSugEmail(e.target.value)}
                    onBlur={validateSugEmail}
                    readOnly={!!currentUser}
                    placeholder={t.email}
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none transition-all",
                      sugEmailError ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400/50",
                      currentUser && "opacity-60 cursor-not-allowed bg-black/20"
                    )} 
                  />
                  {sugEmailError && <p className="text-red-400 text-xs px-1">{sugEmailError}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/50 px-1">{t.subject}</label>
                  <div className="relative">
                    <select 
                      value={sugSubject}
                      onChange={(e) => setSugSubject(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all appearance-none cursor-pointer outline-none"
                    >
                      <option value="select" disabled>{t.subjects.select}</option>
                      <option value="route">{t.subjects.route}</option>
                      <option value="ui">{t.subjects.ui}</option>
                      <option value="vehicle">{t.subjects.vehicle}</option>
                      <option value="station">{t.subjects.station}</option>
                      <option value="feedback">{t.subjects.feedback}</option>
                      <option value="location">{t.subjects.location}</option>
                      <option value="other">{t.subjects.other}</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/50 px-1">{t.message}</label>
                  <textarea 
                    rows={6}
                    value={sugMessage}
                    onChange={(e) => setSugMessage(e.target.value)}
                    placeholder={t.messagePlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all resize-none outline-none"
                  />
                </div>
                <button 
                  onClick={() => setIsSuggestionSubmitted(true)}
                  disabled={!isSugFormValid}
                  className={cn(
                    "w-full py-4 font-bold rounded-xl transition-all active:scale-95 mt-2 shadow-[0_0_20px_rgba(34,211,238,0.2)]",
                    isSugFormValid ? "bg-cyan-400 hover:bg-cyan-300 text-zinc-950" : "bg-white/5 text-white/20 cursor-not-allowed shadow-none border border-white/5"
                  )}
                >
                  {t.send}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    if (activeMenu === 'contact') {
      const isBugFormValid = 
        bugName.trim() !== '' && 
        bugEmail.trim() !== '' && 
        bugSubject !== '' && 
        bugSubject !== 'select' && 
        bugMessage.trim() !== '' && 
        bugEmailError === '';

      const handleBugNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (currentUser) return;
        const val = e.target.value;
        // Only allow alphabetical characters (including Turkish) and spaces
        const regex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/;
        if (regex.test(val)) {
          setBugName(val);
        }
      };

      const validateEmail = () => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (bugEmail.trim() !== '' && !regex.test(bugEmail)) {
          setBugEmailError(t.validation.invalidEmail);
        } else {
          setBugEmailError('');
        }
      };

      return (
        <div className="flex-1 flex flex-col w-full h-full p-6">
          <div className="flex items-center mb-8">
            <button onClick={() => setActiveMenu('main')} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors outline-none cursor-pointer">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-white flex-1 text-center mr-6">{t.bugReportTitle}</h2>
          </div>
          <AnimatePresence mode="wait">
            {isContactSubmitted ? (
               <motion.div 
               key="success"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex-1 flex flex-col items-center justify-center text-center gap-6"
             >
               <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                 <CheckCircle size={48} />
               </div>
               <div>
                 <h3 className="text-2xl font-bold text-white mb-2">{t.bugReportReceived}</h3>
                 <p className="text-white/60 leading-relaxed">{t.bugReportSuccess}</p>
               </div>
               <button 
                 onClick={() => { setIsContactSubmitted(false); setActiveMenu('main'); }}
                 className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-all active:scale-95"
               >
                 {t.goBack}
               </button>
             </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-1 pb-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/50 px-1">{t.fullname}</label>
                  <input 
                    type="text" 
                    value={bugName}
                    onChange={handleBugNameChange}
                    readOnly={!!currentUser}
                    placeholder={t.fullname}
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all",
                      currentUser && "opacity-60 cursor-not-allowed bg-black/20"
                    )} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/50 px-1">{t.email}</label>
                  <input 
                    type="email" 
                    value={bugEmail}
                    onChange={(e) => !currentUser && setBugEmail(e.target.value)}
                    onBlur={validateEmail}
                    readOnly={!!currentUser}
                    placeholder={t.email}
                    className={cn(
                      "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none transition-all",
                      bugEmailError ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400/50",
                      currentUser && "opacity-60 cursor-not-allowed bg-black/20"
                    )} 
                  />
                  {bugEmailError && <p className="text-red-400 text-xs px-1">{bugEmailError}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/50 px-1">{t.subject}</label>
                  <div className="relative">
                    <select 
                      value={bugSubject}
                      onChange={(e) => setBugSubject(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all appearance-none cursor-pointer outline-none"
                    >
                      <option value="select" disabled>{t.bugSubjects.select}</option>
                      <option value="vehicle">{t.bugSubjects.vehicle}</option>
                      <option value="map">{t.bugSubjects.map}</option>
                      <option value="station">{t.bugSubjects.station}</option>
                      <option value="route">{t.bugSubjects.route}</option>
                      <option value="profile">{t.bugSubjects.profile}</option>
                      <option value="other">{t.bugSubjects.other}</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white/50 px-1">{t.message}</label>
                  <textarea 
                    rows={5} 
                    value={bugMessage}
                    onChange={(e) => setBugMessage(e.target.value)}
                    placeholder={t.bugMessagePlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all resize-none outline-none" 
                  />
                </div>
                <button 
                  onClick={() => setIsContactSubmitted(true)} 
                  disabled={!isBugFormValid}
                  className={cn(
                    "w-full py-4 font-bold rounded-xl transition-all active:scale-95 mt-2 shadow-[0_0_20px_rgba(34,211,238,0.2)]",
                    isBugFormValid ? "bg-cyan-400 hover:bg-cyan-300 text-zinc-950" : "bg-white/5 text-white/20 cursor-not-allowed shadow-none border border-white/5"
                  )}
                >
                  {t.send}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Default Submenus (Language, Units, etc)
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
                          {section.items.map((item: any, itemIdx: number) => {
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

