import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Navigation, Clock, Search, MapPin } from "lucide-react";

export function LocationSearchModal({ 
  isOpen, 
  onClose, 
  item,
  onSelectLocation
}) {
  const [searchValue, setSearchValue] = useState(item?.value || "");
  const [predictions, setPredictions] = useState([]);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const geocoder = useRef(null);

  useEffect(() => {
    if (!window.google) return;
    if (!autocompleteService.current) autocompleteService.current = new window.google.maps.places.AutocompleteService();
    if (!geocoder.current) geocoder.current = new window.google.maps.Geocoder();
    // We need a dummy div for PlacesService
    const dummyDiv = document.createElement('div');
    if (!placesService.current) placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
  }, []);

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
      autocompleteService.current.getPlacePredictions({ input: val, componentRestrictions: { country: "TR" } }, (res, status) => {
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
    placesService.current.getDetails({ placeId, fields: ['geometry', 'formatted_address'] }, (place, status) => {
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (geocoder.current) {
          geocoder.current.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === 'OK' && results[0]) {
               onSelectLocation(item.id, results[0].formatted_address, { lat: latitude, lng: longitude });
            } else {
               alert("Konum adresi bulunamadı.");
            }
          });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Konum alınamadı. Lütfen izinleri kontrol edin.");
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] glass-panel border-white/20 p-0 overflow-hidden bg-black/60 shadow-2xl top-[30vh]">
        <div className="p-4 flex flex-col gap-4">
          
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              autoFocus
              type="text" 
              value={searchValue}
              onChange={handleSearch}
              placeholder={`${item?.label || 'Konum'} Ara...`}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-medium" 
            />
          </div>

          <button 
           onClick={handleCurrentLocation}
           className="flex items-center gap-3 w-full p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium transition-colors border border-blue-500/20 mt-1"
          >
             <Navigation size={18} />
             <span>Konum erişimine izin ver (Mevcut konum)</span>
          </button>

          {predictions.length > 0 ? (
            <div className="flex flex-col mt-2 max-h-[40vh] overflow-y-auto pr-2 gap-1 custom-scrollbar">
               {predictions.map(pred => (
                 <button 
                   key={pred.place_id} 
                   onClick={() => handleSelectPrediction(pred.place_id, pred.description)}
                   className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-left transition-colors border-b border-white/5 last:border-0"
                  >
                   <MapPin size={18} className="text-white/40 shrink-0" />
                   <span className="text-white/80 text-sm">{pred.description}</span>
                 </button>
               ))}
            </div>
          ) : (
            <div className="mt-4">
               <h3 className="text-white/40 text-xs font-semibold mb-3 uppercase tracking-wider px-2">Son Aramalar</h3>
               <div className="flex flex-col gap-1">
                 {/* Mock Data */}
                 <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-left transition-colors">
                   <Clock size={16} className="text-white/30" />
                   <span className="text-white/70 text-sm">Ankara, Çankaya</span>
                 </button>
                 <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-left transition-colors">
                   <Clock size={16} className="text-white/30" />
                   <span className="text-white/70 text-sm">İstanbul, Kadıköy</span>
                 </button>
               </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
