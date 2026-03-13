import { useState, useRef, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Dialog, DialogContent } from "./ui/dialog";
import { Navigation, Clock, Search, MapPin, X, Loader2, Target } from "lucide-react";

export function LocationSearchModal({ 
  isOpen, 
  onClose, 
  item,
  onSelectLocation
}) {
  const [searchValue, setSearchValue] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  
  const placesLib = useMapsLibrary("places");
  const geocodingLib = useMapsLibrary("geocoding");
  
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const geocoder = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("iyontree_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
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

  useEffect(() => {
    if (!placesLib || !geocodingLib) return;
    
    if (!autocompleteService.current) {
      autocompleteService.current = new placesLib.AutocompleteService();
    }
    if (!geocoder.current) {
      geocoder.current = new geocodingLib.Geocoder();
    }
    if (!placesService.current) {
      const dummyDiv = document.createElement('div');
      placesService.current = new placesLib.PlacesService(dummyDiv);
    }
  }, [placesLib, geocodingLib]);

  useEffect(() => {
    if (isOpen) {
      setSearchValue(item?.value || "");
      setPredictions([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, item]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchValue(val);

    if (val.length > 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions({ 
        input: val, 
        componentRestrictions: { country: "TR" } 
      }, (res, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && res) {
          setPredictions(res);
        } else {
          setPredictions([]);
        }
      });
    } else {
      setPredictions([]);
    }
  };

  const handleSelectPrediction = (placeId, description) => {
    if (!placesService.current) return;
    placesService.current.getDetails({ 
      placeId, 
      fields: ['geometry', 'formatted_address'] 
    }, (place, status) => {
       if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address;
          onSelectLocation(item.id, address, { lat, lng });
          saveRecentSearch(address, lat, lng);
          setSearchValue("");
          onClose();
       }
    });
  };

  const handleLocateClick = async () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Konum servisi desteklenmiyor.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (geocoder.current) {
          geocoder.current.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            setIsLocating(false);
            if (status === 'OK' && results[0]) {
               const address = results[0].formatted_address;
               onSelectLocation(item.id, address, { lat: latitude, lng: longitude });
               saveRecentSearch(address, latitude, longitude);
               setSearchValue("");
               onClose();
            } else {
               setLocationError("Konum adresi bulunamadı.");
            }
          });
        } else {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Konum izni reddedildi.");
        } else {
          setLocationError("Konum alınamadı.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  let title = "Durak Seçimi";
  let placeholder = "Durak eklenecek adresi arayın...";

  if (item?.currentIndex === 0) {
    title = "Başlangıç Konumu";
    placeholder = "Başlangıç konumunuzu giriniz...";
  } else if (item?.totalCount && item?.currentIndex === (item?.totalCount - 1)) {
    title = "Varış Noktası";
    placeholder = "Nereye gitmek istiyorsunuz?";
  } else if (item?.totalCount > 3 && item?.currentIndex > 0) {
    title = `${item.currentIndex}. Durak Seçimi`;
    placeholder = `${item.currentIndex}. durak adresini giriniz...`;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[500px] p-0 overflow-hidden bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
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
                      onClick={() => setSearchValue("")}
                      className="p-1.5 text-white/50 hover:text-white transition-colors"
                      title="Temizle"
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
                  title="Mevcut Konumu Kullan"
                >
                  {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Target size={22} />}
                </button>
              </div>
            </div>
            {locationError && (
              <span className="text-red-400 text-sm pl-2">{locationError}</span>
            )}
          </div>

          <div className="flex flex-col min-h-[240px]">
            {predictions.length > 0 ? (
              <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto pr-2 overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                 <h4 className="text-white/20 text-xs font-bold uppercase tracking-widest mb-3 px-2">Arama Sonuçları</h4>
                 {predictions.map(pred => (
                   <button 
                     key={pred.place_id} 
                     onClick={() => handleSelectPrediction(pred.place_id, pred.description)}
                     className="w-full max-w-full overflow-hidden flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-left transition-all group"
                    >
                     <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                       <MapPin size={22} className="text-white/30 group-hover:text-blue-400 transition-colors" />
                     </div>
                     <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                       <span className="block truncate w-full text-white/90 font-semibold text-[15px]">{pred.structured_formatting?.main_text || pred.description}</span>
                       <span className="block truncate w-full text-white/40 text-[13px] font-normal">{pred.structured_formatting?.secondary_text || 'Türkiye'}</span>
                     </div>
                   </button>
                 ))}
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                 <div className="flex items-center justify-between mb-4 px-2">
                   <h4 className="text-white/20 text-xs font-bold uppercase tracking-widest">Son Aramalar</h4>
                   {recentSearches.length > 0 && (
                     <button onClick={clearRecentSearches} className="text-white/40 hover:text-white text-xs transition-colors">Temizle</button>
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
                     <div className="px-2 py-4 text-white/30 text-sm">Henüz arama geçmişi yok.</div>
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
