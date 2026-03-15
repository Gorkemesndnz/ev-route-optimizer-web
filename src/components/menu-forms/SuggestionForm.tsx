import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { translations } from "../../lib/translations";
import { useSettings } from "../../contexts/SettingsContext";
import { useAuth } from "../../contexts/AuthContext";
import { suggestionSchema } from "../../lib/validation";
import type { SuggestionFormData } from "../../lib/validation";
import { z } from "zod";
import CustomSelect from "../ui/CustomSelect";

interface SuggestionFormProps {
  onSuccess: () => void;
}

export const SuggestionForm: React.FC<SuggestionFormProps> = ({ onSuccess }) => {
  const { language } = useSettings();
  const { currentUser } = useAuth();
  const t = translations[language];

  const [formData, setFormData] = useState<SuggestionFormData>({
    name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
    email: currentUser?.email || '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateField = (field: keyof SuggestionFormData, value: string) => {
    try {
      const fieldSchema = z.object({ [field]: (suggestionSchema.shape as any)[field] });
      fieldSchema.parse({ [field]: value });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: err.issues[0].message }));
      }
    }
  };

  const handleInputChange = (field: keyof SuggestionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = suggestionSchema.safeParse(formData);
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
          <h3 className="text-2xl font-bold text-white mb-2">{t.suggestionReceived}</h3>
          <p className="text-white/60 leading-relaxed">{t.suggestionSuccess}</p>
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
      className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-1 pb-4"
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/50 px-1">{t.fullname}</label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          readOnly={!!currentUser}
          placeholder={t.fullname}
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none transition-all",
            errors.name ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400/50",
            currentUser && "opacity-60 cursor-not-allowed bg-black/20"
          )} 
        />
        {errors.name && <p className="text-red-400 text-xs px-1">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/50 px-1">{t.email}</label>
        <input 
          type="email" 
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          readOnly={!!currentUser}
          placeholder={t.email}
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none transition-all",
            errors.email ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400/50",
            currentUser && "opacity-60 cursor-not-allowed bg-black/20"
          )} 
        />
        {errors.email && <p className="text-red-400 text-xs px-1">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/50 px-1">{t.subject}</label>
        <CustomSelect 
          options={[
            { value: "route", label: t.subjects.route },
            { value: "ui", label: t.subjects.ui },
            { value: "vehicle", label: t.subjects.vehicle },
            { value: "station", label: t.subjects.station },
            { value: "feedback", label: t.subjects.feedback },
            { value: "location", label: t.subjects.location },
            { value: "other", label: t.subjects.other },
          ]}
          value={formData.subject}
          onChange={(val) => handleInputChange('subject', val)}
          placeholder={t.subjects.select}
          error={!!errors.subject}
        />
        {errors.subject && <p className="text-red-400 text-xs px-1">{errors.subject}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/50 px-1">{t.message}</label>
        <textarea 
          rows={6} 
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          placeholder={t.messagePlaceholder}
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:bg-white/10 transition-all resize-none outline-none",
            errors.message ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400/50"
          )} 
        />
        {errors.message && <p className="text-red-400 text-xs px-1">{errors.message}</p>}
      </div>

      <button 
        type="submit" 
        className={cn(
          "w-full py-4 font-bold rounded-xl transition-all active:scale-95 mt-2 shadow-[0_0_20px_rgba(34,211,238,0.2)]",
          Object.keys(errors).length === 0 && formData.subject !== '' && formData.message !== '' && formData.name !== '' && formData.email !== ''
            ? "bg-cyan-400 hover:bg-cyan-300 text-zinc-950" 
            : "bg-white/5 text-white/20 cursor-not-allowed shadow-none border border-white/5"
        )}
      >
        {t.send}
      </button>
    </motion.form>
  );
};
