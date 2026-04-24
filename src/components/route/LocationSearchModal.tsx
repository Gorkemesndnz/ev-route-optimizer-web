import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Clock, Search, MapPin, X, Loader2, Target } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { translations } from "../../lib/translations";
import { useDebounce } from "../../hooks/useDebounce";
import { apiClient } from "../../lib/apiClient";
import { ENDPOINTS } from "../../lib/endpoints";

export function LocationSearchModal({ 
  isOpen, 
  onClose, 
  item,
  onSelectLocation
}: {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSelectLocation: (id: string, address: string, coords: { lat: number, lng: number }) => void;
}) {
  const { language } = useSettings();
  const t = translations[language];

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 300);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  
  // Session token for Google Maps billing optimization
  const [sessionToken, setSessionToken] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("iyontree_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        // Silently ignore parsing errors
      }
    }
  }, []);

  const saveRecentSearch = (name: string, lat: number, lng: number) => {
    setRecentSearches(prev => {
      const newItem = { name, lat, lng };
      const filtered = prev.filter(p => p.name !== name);
      const updated = [newItem, ...filtered].slice(0, 5);
      localStorage.setItem("iyontree_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("iyontree_recent_searches");
  };

  // Generate a new session token each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchValue(item?.value || "");
      setPredictions([]);
      setSessionToken(crypto.randomUUID());
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, item]);

  // Autocomplete call via .NET Proxy
  useEffect(() => {
    if (debouncedSearchValue.length > 2) {
      const fetchPredictions = async () => {
        try {
          // Send request to proxy
          const res = await apiClient(`${ENDPOINTS.MAPS_AUTOCOMPLETE}?input=${encodeURIComponent(debouncedSearchValue)}&sessionToken=${sessionToken}&language=${language}`);
          const data = await res.json();
          if (data.success && data.data && data.data.predictions) {
            setPredictions(data.data.predictions);
          } else {
            setPredictions([]);
          }
        } catch (error) {
          console.error("Autocomplete failed:", error);
          setPredictions([]);
        }
      };
      
      fetchPredictions();
    } else {
      setPredictions([]);
    }
  }, [debouncedSearchValue, sessionToken, language]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Get place details via .NET Proxy
  const handleSelectPrediction = async (placeId: string) => {
    try {
      const res = await apiClient(`${ENDPOINTS.mapsPlaceDetails(placeId)}?sessionToken=${sessionToken}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        const place = data.data;
        const lat = place.latitude;
        const lng = place.longitude;
        const address = place.formattedAddress;
        
        if (lat != null && lng != null && address) {
          onSelectLocation(item.id, address, { lat, lng });
          saveRecentSearch(address, lat, lng);
          setSearchValue("");
          onClose();
        } else {
          console.error("Place details missing coordinates or address", place);
        }
      } else {
        console.error("Place details API returned unsuccessful", data);
      }
    } catch (error) {
      console.error("Place Details failed:", error);
    }
  };

  // Reverse Geocode (Get address from current location) via .NET Proxy
  const handleLocateClick = async () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError(t.searchModal.locationNotSupported);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await apiClient(`${ENDPOINTS.MAPS_REVERSE_GEOCODE}?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();
          setIsLocating(false);

          if (data.success && data.data) {
             const address = "Konumum";
             onSelectLocation(item.id, address, { lat: latitude, lng: longitude });
             saveRecentSearch(address, latitude, longitude);
             setSearchValue("");
             onClose();
          } else {
             setLocationError(t.searchModal.addressNotFound);
          }
        } catch (error) {
          setIsLocating(false);
          setLocationError(t.searchModal.addressNotFound);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(t.searchModal.permissionDenied);
        } else {
          setLocationError(t.searchModal.locateFailed);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  let title = t.searchModal.title;
  let placeholder = t.searchModal.placeholder;

  if (item?.currentIndex === 0) {
    title = t.searchModal.startTitle;
    placeholder = t.searchModal.startPlaceholder;
  } else if (item?.totalCount && item?.currentIndex === (item?.totalCount - 1)) {
    title = t.searchModal.destTitle;
    placeholder = t.searchModal.destPlaceholder;
  } else if (item?.totalCount > 3 && item?.currentIndex > 0) {
    title = item.currentIndex + ". " + t.searchModal.waypointTitle;
    placeholder = item.currentIndex + ". " + t.searchModal.waypointPlaceholder;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[500px] p-0 overflow-hidden bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh] flex flex-col">
        <div className="p-7 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-white/90">{title}</h3>
          
          <div className="flex flex-col gap-2">
            <div className="relative group flex items-center">
              <Search size={22} className="absolute left-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
              <input 
                ref={inputRef}
                autoFocus
                type="text" 
                value={searchValue}
                onChange={handleSearch}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-12 pr-24 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all font-medium text-lg shadow-2xl" 
              />
              <div className="absolute right-4 flex items-center">
                {searchValue && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchValue("");
                        setPredictions([]);
                        setTimeout(() => inputRef.current?.focus(), 0);
                      }}
                      className="p-1.5 text-white/50 hover:text-white transition-colors"
                      title={t.searchModal.clear}
                    >
                      <X size={18} />
                    </button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                  </>
                )}
                <button
                  type="button"
                  onClick={handleLocateClick}
                  disabled={isLocating}
                  className="p-1.5 text-white/50 hover:text-white transition-colors disabled:opacity-50"
                  title={t.searchModal.useCurrentLocation}
                >
                  {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Target size={22} />}
                </button>
              </div>
            </div>
            {locationError && (
              <span className="text-red-400 text-sm pl-2">{locationError}</span>
            )}
          </div>

          <div className="flex flex-col min-h-[200px] max-h-[40vh] overflow-y-auto custom-scrollbar">
             {predictions.length > 0 ? (
              <div className="flex flex-col gap-1">
                 <h4 className="text-white/20 text-xs font-bold uppercase tracking-widest mb-3 px-2">{t.searchModal.searchResults}</h4>
                 {predictions.map(pred => (
                   <button 
                     key={pred.placeId || pred.place_id} 
                     onClick={() => handleSelectPrediction(pred.placeId || pred.place_id)}
                     className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-left transition-all group overflow-hidden"
                    >
                     <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                       <MapPin size={22} className="text-white/30 group-hover:text-blue-400 transition-colors" />
                     </div>
                     <div className="flex flex-col min-w-0 flex-1">
                       <span className="block truncate text-white/90 font-semibold text-[15px]">{pred.structuredFormatting?.mainText || pred.structured_formatting?.main_text || pred.description}</span>
                       <span className="block truncate text-white/40 text-[13px] font-normal">{pred.structuredFormatting?.secondaryText || pred.structured_formatting?.secondary_text || 'Türkiye'}</span>
                     </div>
                   </button>
                 ))}
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                 <div className="flex items-center justify-between mb-4 px-2">
                   <h4 className="text-white/20 text-xs font-bold uppercase tracking-widest">{t.searchModal.recentSearches}</h4>
                   {recentSearches.length > 0 && (
                     <button onClick={clearRecentSearches} className="text-white/40 hover:text-white text-xs transition-colors">{t.searchModal.clear}</button>
                   )}
                 </div>
                 
                 <div className="flex flex-col gap-1">
                   {recentSearches.length > 0 ? recentSearches.map((search, idx) => (
                     <button 
                       key={idx}
                       onClick={() => {
                         onSelectLocation(item.id, search.name, { lat: search.lat, lng: search.lng });
                         saveRecentSearch(search.name, search.lat, search.lng);
                         setSearchValue("");
                         onClose();
                       }}
                       className="w-full max-w-full overflow-hidden flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-left transition-all group"
                     >
                       <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                         <Clock size={20} className="text-white/20 group-hover:text-blue-400 transition-colors" />
                       </div>
                       <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                         <span className="block truncate w-full text-white/70 font-medium text-[15px]">{search.name}</span>
                       </div>
                     </button>
                   )) : (
                      <div className="px-2 py-4 text-white/30 text-sm">{t.searchModal.noRecentSearches}</div>
                   )}
                 </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
