import { ArrowLeft, Search, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { Vehicle } from "../../types/vehicle";
import { translations } from "../../lib/translations";

interface BrandModel {
  model: string;
  variant: string;
  year: number;
  batteryCapacityKwh: number;
}

interface Brand {
  id: string;
  name: string;
  models: BrandModel[];
}

import { useSettings } from "../../contexts/SettingsContext";
import { useVehicle } from "../../contexts/VehicleContext";
import { useEffect, useState as useReactState } from "react";

export default function AddVehicleView({ 
  onBack, 
  onVehicleAdded,
}: {
  onBack: () => void;
  onVehicleAdded: () => void;
}) {
  const { language } = useSettings();
  const { addVehicle } = useVehicle();
  const [searchTerm, setSearchTerm] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const t = translations[language];

  useEffect(() => {
    import("../../lib/apiClient").then(({ apiClient }) => {
      apiClient("/EvCatalog/brands")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBrands(data.data);
        }
      })
      .catch(console.error);
    });
  }, []);

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSearching = searchTerm.trim().length > 0;
  
  const allVehicles = brands.flatMap(b => 
    b.models.map(m => ({ brand: b, model: m }))
  );

  const searchResults = isSearching 
    ? allVehicles.filter(v => 
        `${v.brand.name} ${v.model.model} ${v.model.variant} ${v.model.year}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleModelSelect = async (brand: Brand, m: BrandModel) => {
    const newVehicle: Vehicle = {
      id: crypto.randomUUID(),
      brand: brand.name,
      model: m.model,
      variant: m.variant,
      batteryCapacityKwh: m.batteryCapacityKwh,
      customName: `${brand.name} ${m.model} ${m.variant}`.trim(),
      soc: 80, // Default to 80% charge
      isActive: true,
      year: m.year
    };
    try {
      await addVehicle(newVehicle);
      onVehicleAdded();
    } catch (err: any) {
      alert(err.message || "Araç eklenirken bir hata oluştu.");
    }
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
              placeholder={t.searchVehicle}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-[14px] text-white placeholder-white/50 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
            />
          </div>

          {isSearching ? (
            /* Search Results Grid */
            <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2">
              <div className="flex flex-col gap-2 pb-4">
                {searchResults.map((item, idx) => (
                  <button
                    key={`${item.brand.id}-${item.model.model}-${idx}`}
                    onClick={() => handleModelSelect(item.brand, item.model)}
                    className="w-full text-left bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98]"
                  >
                    <div>
                      <div className="text-white/50 text-xs mb-1">{item.brand.name}</div>
                      <div className="text-white font-medium text-lg leading-tight">
                        {item.model.model}
                        {item.model.variant && <span className="block text-sm text-cyan-400 font-normal mt-0.5">{item.model.variant}</span>}
                      </div>
                      {item.model.year > 0 && (
                        <div className="text-white/50 text-[11px] mt-1.5 font-medium">
                          {t.modelYear} {item.model.year}
                        </div>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-cyan-500/20 text-transparent group-hover:text-cyan-400 flex items-center justify-center transition-all">
                      <CheckCircle2 size={18} />
                    </div>
                  </button>
                ))}
                
                {searchResults.length === 0 && (
                  <div className="py-8 text-center text-white/50 text-sm">
                    {t.noResults}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Brand Grid */
            <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2">
              <div className="grid grid-cols-2 gap-3 pb-4">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand)}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-2 aspect-[4/3] active:scale-95"
                  >
                    <span className="text-white/90 font-medium">{brand.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Model List */
        <div className="overflow-y-auto custom-scrollbar flex-1 -mr-2 pr-2">
          <div className="flex flex-col gap-2 pb-4">
            {selectedBrand.models.map((m: BrandModel, idx: number) => (
              <button
                key={`${m.model}-${m.variant}-${idx}`}
                onClick={() => handleModelSelect(selectedBrand, m)}
                className="w-full text-left bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98]"
              >
                <div>
                  <div className="text-white/50 text-xs mb-1">{selectedBrand.name}</div>
                  <div className="text-white font-medium text-lg leading-tight">
                    {m.model}
                    {m.variant && <span className="block text-sm text-cyan-400 font-normal mt-0.5">{m.variant}</span>}
                  </div>
                  {m.year > 0 && (
                    <div className="text-white/50 text-[11px] mt-1.5 font-medium">
                      {t.modelYear} {m.year}
                    </div>
                  )}
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
