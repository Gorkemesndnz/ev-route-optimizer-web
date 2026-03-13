import { useState, useRef, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Dialog, DialogContent } from "./ui/dialog";
import { Navigation, Clock, Search, MapPin, X, Loader2 } from "lucide-react";

export function LocationSearchModal({ 
  isOpen, 
  onClose, 
  item,
  onSelectLocation
}) {
  const [searchValue, setSearchValue] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  
  const placesLib = useMapsLibrary("places");
  const geocodingLib = useMapsLibrary("geocoding");
  
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const geocoder = useRef(null);

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
          onSelectLocation(item.id, place.formatted_address, {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
       }
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum servisini desteklemiyor.");
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
               onSelectLocation(item.id, results[0].formatted_address, { lat: latitude, lng: longitude });
            } else {
               alert("Konum adresi bulunamadı.");
            }
          });
        } else {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        console.error("Geolocation error:", error);
        alert("Konum alınamadı. Lütfen izinleri kontrol edin.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const mockRecentSearches = [
    { id: 1, address: "Ankara, Çankaya" },
    { id: 2, address: "İstanbul, Kadıköy" },
    { id: 3, address: "İzmir, Alsancak" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-zinc-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="p-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white/90">Nereye?</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} className="text-white/40" />
            </button>
          </div>
          
          <div className="relative group">
            <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors" />
            <input 
              autoFocus
              type="text" 
              value={searchValue}
              onChange={handleSearch}
              placeholder="Adres, şehir veya mekan ara..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all font-medium text-lg shadow-2xl" 
            />
          </div>

          <button 
           onClick={handleCurrentLocation}
           disabled={isLocating}
           className="flex items-center gap-4 w-full p-4.5 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-semibold transition-all border border-blue-500/20 group active:scale-[0.98] disabled:opacity-50"
          >
             <div className="w-11 h-11 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
               {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Navigation size={22} />}
             </div>
             <div className="flex flex-col items-start text-left">
               <span className="text-base">Mevcut konumu kullan</span>
               <span className="text-xs text-blue-400/50 font-normal">Sizin için en yakın adresi bulalım</span>
             </div>
          </button>

          <div className="flex flex-col min-h-[240px]">
            {predictions.length > 0 ? (
              <div className="flex flex-col gap-1 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                 <h4 className="text-white/20 text-xs font-bold uppercase tracking-widest mb-3 px-2">Arama Sonuçları</h4>
                 {predictions.map(pred => (
                   <button 
                     key={pred.place_id} 
                     onClick={() => handleSelectPrediction(pred.place_id, pred.description)}
                     className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-left transition-all group"
                    >
                     <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shrink-0">
                       <MapPin size={22} className="text-white/30 group-hover:text-blue-400 transition-colors" />
                     </div>
                     <div className="flex flex-col overflow-hidden">
                       <span className="text-white/90 font-semibold truncate text-[15px]">{pred.structured_formatting?.main_text || pred.description}</span>
                       <span className="text-white/40 text-[13px] truncate font-normal">{pred.structured_formatting?.secondary_text || 'Türkiye'}</span>
                     </div>
                   </button>
                 ))}
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                 <h4 className="text-white/20 text-xs font-bold uppercase tracking-widest mb-4 px-2">Son Aramalar</h4>
                 <div className="flex flex-col gap-1">
                   {mockRecentSearches.map(search => (
                     <button 
                       key={search.id}
                       className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-left transition-all group"
                     >
                       <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                         <Clock size={20} className="text-white/20" />
                       </div>
                       <span className="text-white/70 font-medium text-[15px]">{search.address}</span>
                     </button>
                   ))}
                 </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
