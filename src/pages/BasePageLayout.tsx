import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, Moon, Sun, Globe, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import GlobalFooterLight from "../components/layout/GlobalFooterLight";
import CookieConsent from "../components/layout/CookieConsent";
import { useSettings } from "../contexts/SettingsContext";

interface MarketingContextType {
  language: 'tr' | 'en';
  theme: 'light' | 'dark';
  toggleLanguage: () => void;
  toggleTheme: () => void;
}

export const MarketingContext = createContext<MarketingContextType>({
  language: 'tr',
  theme: 'light',
  toggleLanguage: () => {},
  toggleTheme: () => {}
});

export function useMarketing() {
  return useContext(MarketingContext);
}

export function MarketingProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'tr' | 'en'>(() => {
    return (localStorage.getItem('iyontree_language') as 'tr' | 'en') || 'tr';
  });

  const theme = 'light';

  useEffect(() => {
    localStorage.setItem('iyontree_language', language);
  }, [language]);

  useEffect(() => {
    // Ensure dark class is never present on these pages
    document.documentElement.classList.remove('dark');
  }, []);

  const toggleLanguage = () => setLanguage(l => l === 'tr' ? 'en' : 'tr');
  const toggleTheme = () => {}; // Keeping as no-op for compatibility with context if used elsewhere

  return (
    <MarketingContext.Provider value={{ language, theme, toggleLanguage, toggleTheme }}>
      {children}
    </MarketingContext.Provider>
  );
}

export default function BasePageLayout({ 
  children,
  title,
  subtitle
}: { 
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const location = useLocation();
  const isHome = location.pathname === '/home' || location.pathname === '/home/';
  
  const { language, toggleLanguage } = useMarketing();
  const { setShowCookieModal } = useSettings();

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col relative overflow-hidden text-slate-900 font-sans transition-colors duration-300`}>
        {/* Abstract Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-200/50 dark:bg-cyan-900/30 rounded-full blur-[120px] opacity-70 pointer-events-none transition-colors duration-500" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-emerald-200/40 dark:bg-emerald-900/20 rounded-full blur-[150px] opacity-60 pointer-events-none transition-colors duration-500" />
        <div className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] bg-blue-100/60 dark:bg-blue-900/20 rounded-full blur-[100px] opacity-50 pointer-events-none transition-colors duration-500" />

        {/* Header */}
        <header className="sticky top-0 z-50 w-full h-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 md:px-6 flex items-center justify-between shadow-sm transition-colors duration-300">
          <div className="flex items-center w-1/3">
            {!isHome ? (
              <Link 
                to="/home"
                className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors group outline-none"
              >
                <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:border-cyan-400 dark:group-hover:border-cyan-500 group-hover:bg-cyan-50 dark:group-hover:bg-slate-700 transition-all">
                  <ChevronLeft size={20} className="group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                </div>
                <span className="font-bold tracking-wide hidden sm:block">
                  {language === 'tr' ? 'Ana Sayfa' : 'Home'}
                </span>
              </Link>
            ) : (
                <Link to="/home" className="text-xl md:text-2xl font-black tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-emerald-500 dark:from-cyan-400 dark:to-emerald-400 uppercase">
                  IYONTREE
                </Link>
            )}
          </div>
          
          <div className="flex items-center justify-center w-1/3">
            {!isHome && (
              <Link to="/home" className="text-xl md:text-2xl font-black tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-emerald-500 dark:from-cyan-400 dark:to-emerald-400 uppercase hidden sm:block">
                IYONTREE
              </Link>
            )}
          </div>
          
          <div className="flex items-center justify-end gap-2 md:gap-4 w-1/3">
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleLanguage}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all outline-none"
                title={language === 'tr' ? 'Switch to English' : 'Türkçe\'ye Geç'}
              >
                <Globe size={18} />
                <span className="text-[9px] font-bold absolute mt-6">{language.toUpperCase()}</span>
              </button>
            </div>
            
            {isHome && (
              <Link 
                to="/"
                className="hidden sm:flex h-10 px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-full font-bold shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 outline-none items-center gap-2 transition-all hover:-translate-y-0.5 whitespace-nowrap"
              >
                <span>{language === 'tr' ? 'Uygulamaya Git' : 'Go to App'}</span>
                <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className={`flex-1 w-full max-w-7xl mx-auto px-6 ${isHome ? 'py-20' : 'py-16'} relative z-10 flex flex-col gap-12`}>
          {/* Title Section for Subpages */}
          {(title || subtitle) && (
            <div className="flex flex-col gap-4 items-center text-center">
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase leading-tight transition-colors">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl font-medium uppercase tracking-[0.1em] transition-colors">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Dynamic Children Content */}
          {children}
        </main>

        <GlobalFooterLight />

        <CookieConsent 
          onOpenPrivacy={() => { 
            if (location.pathname === '/home/gizlilik') {
              setShowCookieModal(false);
            } else {
              window.open('/home/gizlilik', '_blank');
              setShowCookieModal(false); 
            }
          }}
        />
      </div>
  );
}
