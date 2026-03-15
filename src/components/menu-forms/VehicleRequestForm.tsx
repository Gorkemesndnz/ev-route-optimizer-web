import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { translations } from "../../lib/translations";
import { useSettings } from "../../contexts/SettingsContext";
import { useAuth } from "../../contexts/AuthContext";
import { vehicleRequestSchema } from "../../lib/validation";
import type { VehicleRequestFormData } from "../../lib/validation";
import { z } from "zod";
import CustomSelect from "../ui/CustomSelect";

interface VehicleRequestFormProps {
  onSuccess: () => void;
}

const BRANDS = [
  "Tesla", "BMW", "Mercedes-Benz", "Audi", "Hyundai", "Kia", "Renault", "MG", 
  "Skywell", "Togg", "Porsche", "Volvo", "Volkswagen", "Ford", "Fiat", "Diğer"
];

export const VehicleRequestForm: React.FC<VehicleRequestFormProps> = ({ onSuccess }) => {
  const { language } = useSettings();
  const { currentUser } = useAuth();
  const t = translations[language];

  const [formData, setFormData] = useState<VehicleRequestFormData>({
    name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
    email: currentUser?.email || '',
    brand: '',
    customBrand: '',
    model: '',
    details: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateField = (field: keyof VehicleRequestFormData, value: string, currentData: VehicleRequestFormData) => {
    try {
      // For cross-field validation like brand/customBrand, we use safeParse on a slice or full
      const result = vehicleRequestSchema.safeParse({ ...currentData, [field]: value });
      
      setErrors(prev => {
        const newErrors = { ...prev };
        // Clear error for the field being edited
        delete newErrors[field];
        // If it's brand/customBrand, we might need to clear customBrand specifically
        if (field === 'brand' && value !== 'Diğer') delete newErrors.customBrand;
        
        if (!result.success) {
          result.error.issues.forEach(err => {
            if (err.path[0] === field) newErrors[field] = err.message;
            // Also handle the refined path for customBrand
            if (field === 'brand' && value === 'Diğer' && err.path[0] === 'customBrand') {
              newErrors.customBrand = err.message;
            }
          });
        }
        return newErrors;
      });
    } catch {
      // Fallback
    }
  };

  const handleInputChange = (field: keyof VehicleRequestFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    validateField(field, value, newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = vehicleRequestSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: { [key: string]: string } = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  if (isSubmitted) {
    return (
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
      </motion.div>
    );
  }

  return (
    <motion.form 
      key="form" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 h-full overflow-y-auto custom-scrollbar pr-1 pb-4"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-white/50 px-1">{t.fullname}</label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          readOnly={!!currentUser}
          placeholder={t.fullname}
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none transition-all",
            errors.name ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400/50",
            currentUser && "opacity-60 cursor-not-allowed bg-black/20"
          )} 
        />
        {errors.name && <p className="text-red-400 text-xs px-1">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-white/50 px-1">{t.email}</label>
        <input 
          type="email" 
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          readOnly={!!currentUser}
          placeholder={t.email}
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none transition-all",
            errors.email ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400/50",
            currentUser && "opacity-60 cursor-not-allowed bg-black/20"
          )} 
        />
        {errors.email && <p className="text-red-400 text-xs px-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/50 px-1">{t.vehicleBrand}</label>
          <CustomSelect 
            options={BRANDS.map(brand => ({ value: brand, label: brand }))}
            value={formData.brand}
            onChange={(val) => handleInputChange('brand', val)}
            placeholder={t.subjects.select}
            error={!!errors.brand}
          />
          {errors.brand && <p className="text-red-400 text-xs px-1">{errors.brand}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/50 px-1">{t.vehicleModel}</label>
          <input 
            type="text" 
            value={formData.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            placeholder={t.vehicleModelPlaceholder}
            className={cn(
              "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none transition-all outline-none",
              errors.model ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400/50"
            )} 
          />
          {errors.model && <p className="text-red-400 text-xs px-1">{errors.model}</p>}
        </div>
      </div>

      <AnimatePresence>
        {formData.brand === 'Diğer' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-1.5 overflow-hidden"
          >
            <label className="text-sm font-medium text-white/50 px-1">{t.customBrandLabel}</label>
            <input 
              type="text" 
              value={formData.customBrand}
              onChange={(e) => handleInputChange('customBrand', e.target.value)}
              placeholder={t.customBrandPlaceholder}
              className={cn(
                "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none transition-all outline-none",
                errors.customBrand ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400/50"
              )} 
            />
            {errors.customBrand && <p className="text-red-400 text-xs px-1">{errors.customBrand}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-white/50 px-1">{t.vehicleDetails}</label>
        <textarea 
          rows={3} 
          value={formData.details}
          onChange={(e) => handleInputChange('details', e.target.value)}
          placeholder={t.vehicleDetailsPlaceholder}
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:bg-white/10 transition-all resize-none outline-none",
            "focus:border-cyan-400/50"
          )} 
        />
      </div>

      <button 
        type="submit" 
        className={cn(
          "w-full py-3.5 font-bold rounded-xl transition-all active:scale-95 mt-1 shadow-[0_0_20px_rgba(34,211,238,0.2)]",
          Object.keys(errors).length === 0 && formData.brand !== '' && formData.model !== '' && formData.name !== '' && formData.email !== ''
            ? "bg-cyan-400 hover:bg-cyan-300 text-zinc-950" 
            : "bg-white/5 text-white/20 cursor-not-allowed shadow-none border border-white/5"
        )}
      >
        {t.send}
      </button>
    </motion.form>
  );
};
