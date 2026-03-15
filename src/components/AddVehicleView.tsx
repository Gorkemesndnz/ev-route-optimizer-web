import { ArrowLeft, Search, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { translations } from "../lib/translations";

const MOCK_BRANDS = [
  { id: "tesla", name: "Tesla", models: ["Model 3", "Model Y", "Model S", "Model X"] },
  { id: "togg", name: "Togg", models: ["T10X V1", "T10X V2 Long Range"] },
  { id: "bmw", name: "BMW", models: ["i4 eDrive40", "iX xDrive50", "iX3"] },
  { id: "porsche", name: "Porsche", models: ["Taycan 4S", "Taycan Turbo"] },
  { id: "mercedes", name: "Mercedes-Benz", models: ["EQE 350", "EQS 450+"] },
  { id: "hyundai", name: "Hyundai", models: ["Ioniq 5", "Ioniq 6", "Kona Electric"] },
  { id: "kia", name: "Kia", models: ["EV6", "Niro EV"] },
];

import { useSettings } from "../contexts/SettingsContext";
import { useVehicle } from "../contexts/VehicleContext";

export default function AddVehicleView({ 
  onBack, 
  onVehicleAdded,
}: {
  onBack: () => void;
  onVehicleAdded: () => void;
}) {
  const { language } = useSettings();
  const { setVehicles, setSelectedVehicleId } = useVehicle();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const t = translations[language];

  const filteredBrands = MOCK_BRANDS.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModelSelect = (brand: any, model: string) => {
    const newVehicle = {
      id: crypto.randomUUID(),
      brand: brand.name,
      model: model,
      customName: `${brand.name} ${model}`,
      soc: 80 // Default to 80% charge
    };
    setVehicles(prev => [...prev, newVehicle]);
    setSelectedVehicleId(newVehicle.id);
    onVehicleAdded();
  };

  return (
    <div className="glass-panel w-full sm:w-[420px] px-4 py-5 pointer-events-auto flex flex-col gap-4 relative h-[calc(100svh-4rem)] sm:h-[600px] overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            if (selectedBrand) setSelectedBrand(null);
            else onBack();
          }}
          className="p-2 -ml-2 text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/5 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-white/90">
          {selectedBrand ? t.selectModel : t.addVehicleTitle}
        </h2>
      </div>

      {!selectedBrand ? (
        <>
          {/* Search */}
          <div className="relative shrink-0">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={t.searchBrand}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-[14px] text-white placeholder-white/50 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
            />
          </div>

          {/* Brand Grid */}
          <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2">
            <div className="grid grid-cols-2 gap-3 pb-4">
              {filteredBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-[4/3] active:scale-95"
                >
                  <span className="text-white/90 font-medium">{brand.name}</span>
                </button>
              ))}
              
              {filteredBrands.length === 0 && (
                <div className="col-span-2 py-8 text-center text-white/50 text-sm">
                  {t.noResults}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Model List */
        <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2">
          <div className="flex flex-col gap-2 pb-4">
            {selectedBrand.models.map((model: string) => (
              <button
                key={model}
                onClick={() => handleModelSelect(selectedBrand, model)}
                className="w-full text-left bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98]"
              >
                <div>
                  <div className="text-white/50 text-xs mb-1">{selectedBrand.name}</div>
                  <div className="text-white font-medium text-lg">{model}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-cyan-500/20 text-transparent group-hover:text-cyan-400 flex items-center justify-center transition-all">
                  <CheckCircle2 size={18} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
