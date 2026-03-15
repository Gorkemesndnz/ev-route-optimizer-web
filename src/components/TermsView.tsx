import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { translations } from "../lib/translations";
import GlobalFooter from "./GlobalFooter";

export default function TermsView({ 
  onBack,
  language = 'tr'
}: { 
  onBack: () => void,
  language?: 'tr' | 'en'
}) {
  const t = translations[language];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[120] bg-zinc-50 overflow-y-auto pointer-events-auto text-zinc-900 custom-scrollbar"
    >
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20 flex flex-col min-h-full">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-10 font-medium transition-colors outline-none self-start"
        >
          <ChevronLeft size={20} />
          {t.back}
        </button>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-10 text-zinc-900 leading-tight">{t.terms}</h1>
        
        <div className="flex-1 flex flex-col gap-8 text-base leading-relaxed text-zinc-700">
          <p className="text-lg font-medium text-zinc-800">
            {language === 'tr' ? "İYONTREE Kullanım Koşulları ve Hizmet Şartları" : "IYONTREE Terms of Service and Usage Conditions"}
          </p>
          
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
             <p>{t.termsText}</p>
          </div>

          <section className="flex flex-col gap-4 mt-4">
            <h2 className="text-xl font-bold text-zinc-900">{language === 'tr' ? "Hizmet Kapsamı" : "Service Scope"}</h2>
            <p>
              {language === 'tr' 
                ? "Platformumuz, elektrikli araç sahiplerine en uygun rota ve şarj istasyonu çözümlerini sunmayı amaçlar. Verilen bilgiler simülasyon ve anlık verilere dayanmakta olup, yol koşullarına göre değişiklik gösterebilir."
                : "Our platform aims to provide the most suitable route and charging station solutions for electric vehicle owners. The information provided is based on simulation and instantaneous data and may vary according to road conditions."}
            </p>
          </section>
        </div>

        <GlobalFooter language={language} />
      </div>
    </motion.div>
  );
}
