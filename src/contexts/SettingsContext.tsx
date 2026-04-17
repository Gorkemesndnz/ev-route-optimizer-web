import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { lightMapStyle, darkMapStyle } from "../lib/mapStyles";

interface SettingsContextType {
  language: 'tr' | 'en';
  setLanguage: (lang: 'tr' | 'en') => void;
  mapStyleKey: 'dark' | 'satellite';
  setMapStyleKey: (key: 'dark' | 'satellite') => void;
  getMapStyle: () => any[];
  showTraffic: boolean;
  setShowTraffic: (show: boolean) => void;
  showCookieBanner: boolean;
  setShowCookieBanner: (show: boolean) => void;
  showCookieModal: boolean;
  setShowCookieModal: (show: boolean) => void;
  handleSaveCookies: (prefs: any) => void;
  stationFilters: string[];
  setStationFilters: (filters: string[]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'tr' | 'en'>(() => {
    const saved = localStorage.getItem('iyontree_language');
    return (saved === 'en' || saved === 'tr') ? saved : 'tr';
  });
  
  const [mapStyleKey, setMapStyleKey] = useState<'dark' | 'satellite'>(() => {
    const saved = localStorage.getItem('iyontree_map_style');
    const valid = ['dark', 'satellite'];
    return (saved && valid.includes(saved)) ? (saved as any) : 'dark';
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
  
  // Varsayılan olarak hiçbir şey seçili değilse TÜMÜ gösterilir
  const [stationFilters, setStationFilters] = useState<string[]>([]);

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
    switch (mapStyleKey) {
      case 'satellite':
        return []; // Satellite modunda özel stil yok
      case 'dark':
      default:
        return darkMapStyle;
    }
  };

  return (
    <SettingsContext.Provider value={{
      language, setLanguage,
      mapStyleKey, setMapStyleKey,
      getMapStyle,
      showTraffic, setShowTraffic,
      showCookieBanner, setShowCookieBanner,
      showCookieModal, setShowCookieModal,
      handleSaveCookies,
      stationFilters, setStationFilters
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
