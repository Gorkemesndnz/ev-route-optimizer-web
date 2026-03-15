import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { lightMapStyle, darkMapStyle } from "../lib/mapStyles";

interface SettingsContextType {
  language: 'tr' | 'en';
  setLanguage: (lang: 'tr' | 'en') => void;
  mapStyleKey: 'default' | 'light' | 'dark' | 'satellite' | 'system';
  setMapStyleKey: (key: 'default' | 'light' | 'dark' | 'satellite' | 'system') => void;
  getMapStyle: () => any[];
  showTraffic: boolean;
  setShowTraffic: (show: boolean) => void;
  showCookieBanner: boolean;
  setShowCookieBanner: (show: boolean) => void;
  showCookieModal: boolean;
  setShowCookieModal: (show: boolean) => void;
  handleSaveCookies: (prefs: any) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'tr' | 'en'>(() => {
    const saved = localStorage.getItem('iyontree_language');
    return (saved === 'en' || saved === 'tr') ? saved : 'tr';
  });
  
  const [mapStyleKey, setMapStyleKey] = useState<'default' | 'light' | 'dark' | 'satellite' | 'system'>(() => {
    const saved = localStorage.getItem('iyontree_map_style');
    const valid = ['default', 'light', 'dark', 'satellite', 'system'];
    return (saved && valid.includes(saved)) ? (saved as any) : 'system';
  });

  const [showTraffic, setShowTraffic] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('iyontree_cookies');
    if (!saved) return true;
    try {
      const parsed = JSON.parse(saved);
      const is30DaysOld = (Date.now() - parsed.timestamp) > 30 * 24 * 60 * 60 * 1000;
      return !parsed.allAccepted && is30DaysOld;
    } catch (error) {
      return true;
    }
  });
  const [showCookieModal, setShowCookieModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('iyontree_language', language);
    document.documentElement.lang = language;
    document.documentElement.className = "notranslate";
  }, [language]);

  useEffect(() => {
    localStorage.setItem('iyontree_map_style', mapStyleKey);
  }, [mapStyleKey]);

  const handleSaveCookies = (prefs: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('iyontree_cookies', JSON.stringify(prefs));
    }
    setShowCookieBanner(false);
    setShowCookieModal(false);
  };

  const getMapStyle = () => {
    let effective: 'light' | 'dark' | 'default' | 'satellite' = 'light';
    
    if (mapStyleKey === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effective = isDark ? 'dark' : 'light';
    } else {
      effective = mapStyleKey as any;
    }
    
    if (effective === 'light') return lightMapStyle;
    if (effective === 'dark') return darkMapStyle;
    return [];
  };

  return (
    <SettingsContext.Provider value={{
      language, setLanguage,
      mapStyleKey, setMapStyleKey,
      getMapStyle,
      showTraffic, setShowTraffic,
      showCookieBanner, setShowCookieBanner,
      showCookieModal, setShowCookieModal,
      handleSaveCookies
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
