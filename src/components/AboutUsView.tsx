import { ChevronLeft, Zap, Shield, Users, Target } from "lucide-react";
import { motion } from "framer-motion";
import { translations } from "../lib/translations";

export default function AboutUsView({ 
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
        
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-zinc-900 leading-tight">{t.aboutUsTitle}</h1>
        <p className="text-xl text-zinc-600 mb-12 leading-relaxed">
          {t.aboutUsSub}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-zinc-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">{t.smartPlanning}</h3>
            <p className="text-zinc-600 leading-relaxed">{t.smartPlanningDesc}</p>
          </div>
          
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-zinc-100">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">{t.reliableNetwork}</h3>
            <p className="text-zinc-600 leading-relaxed">{t.reliableNetworkDesc}</p>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Target className="text-emerald-600" size={24} /> {t.ourMission}
            </h2>
            <p className="text-zinc-700 leading-relaxed text-lg">
              {t.ourMissionDesc}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Users className="text-cyan-600" size={24} /> {t.ourTeam}
            </h2>
            <p className="text-zinc-700 leading-relaxed text-lg">
              {t.ourTeamDesc}
            </p>
          </section>
        </div>

        <div className="mt-20 pt-10 border-t border-zinc-200 text-center">
          <p className="text-zinc-400 font-medium tracking-widest uppercase text-sm">© 2026 IYONTREE YAZILIM A.Ş.</p>
        </div>
      </div>
    </motion.div>
  );
}
