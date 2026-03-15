import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { translations } from "../lib/translations";

export default function PrivacyPolicyView({ 
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
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20 flex flex-col">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-10 font-medium transition-colors outline-none self-start"
        >
          <ChevronLeft size={20} />
          {t.back}
        </button>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-10 text-zinc-900">{t.privacyTitle}</h1>
        <div className="flex flex-col gap-8 text-base leading-relaxed text-zinc-700">
          <p className="text-lg">
            {t.privacyIntro}
          </p>
          
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-zinc-900">{t.privacySec1Title}</h2>
            <p>{t.privacySec1Desc}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-zinc-900">{t.privacySec2Title}</h2>
            <p>{t.privacySec2Desc}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-zinc-900">{t.privacySec3Title}</h2>
            <p>{t.privacySec3Desc}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-zinc-900">{t.privacySec4Title}</h2>
            <p>{t.privacySec4Desc}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-zinc-900">{t.privacySec5Title}</h2>
            <p>{t.privacySec5Desc}</p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
