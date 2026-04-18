import { motion } from "framer-motion";
import { ChevronLeft, Info, Sparkles, Target, Users } from "lucide-react";
import { translations } from "../../lib/translations";
import GlobalFooter from "../layout/GlobalFooter";

export default function AboutUsView({ 
  language, 
  onBack,
  onNavigate
}: { 
  language: 'tr' | 'en';
  onBack: () => void;
  onNavigate: (page: any) => void;
}) {
  const t = translations[language];

  const features = [
    { 
      icon: <Sparkles className="text-cyan-400" />, 
      title: t.smartPlanning, 
      desc: t.smartPlanningDesc 
    },
    { 
      icon: <Target className="text-cyan-400" />, 
      title: t.ourMission, 
      desc: t.ourMissionDesc 
    },
    { 
      icon: <Users className="text-cyan-400" />, 
      title: t.ourTeam, 
      desc: t.ourTeamDesc 
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[150] bg-zinc-950 flex flex-col overflow-y-auto custom-scrollbar"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 w-full h-20 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group outline-none"
        >
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 group-hover:border-cyan-400/50 transition-all">
            <ChevronLeft size={24} className="group-hover:text-cyan-400" />
          </div>
          <span className="font-bold tracking-wide">{t.back}</span>
        </button>
        <span className="text-xl font-black tracking-[0.2em] text-cyan-400 uppercase">IYONTREE</span>
        <div className="w-24" /> {/* Spacer */}
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-20">
        <div className="flex flex-col gap-16">
          {/* Hero Section */}
          <div className="flex flex-col gap-6 items-center text-center">
            <div className="w-20 h-20 rounded-[30px] bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-4 shadow-2xl shadow-cyan-400/5 border border-cyan-400/20">
              <Info size={40} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase max-w-3xl leading-[0.9]">
              {t.aboutUsTitle}
            </h1>
            <p className="text-xl text-white/40 max-w-2xl font-medium leading-relaxed">
              {t.aboutUsSub}
            </p>
          </div>

          {/* Main Content Card */}
          <section className="bg-white/5 border border-white/10 rounded-[50px] p-8 md:p-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/5 blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4 group-hover:bg-cyan-400/10 transition-colors duration-1000" />
            
            <div className="relative z-10 flex flex-col gap-10">
              <div className="flex items-center gap-4">
                <div className="h-1px flex-1 bg-gradient-to-r from-cyan-400/50 to-transparent" />
                <span className="text-cyan-400 font-black tracking-[0.3em] uppercase text-xs">Akademik Vizyon</span>
                <div className="h-1px flex-1 bg-gradient-to-l from-cyan-400/50 to-transparent" />
              </div>

              <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed text-center md:text-left">
                {t.aboutText}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                {features.map((f, i) => (
                  <div key={i} className="flex flex-col gap-4 p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-cyan-400/30 transition-all hover:bg-white/[0.07] group/card">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center group-hover/card:bg-cyan-400 group-hover/card:text-zinc-950 transition-all">
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{f.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed font-medium">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Academic Footer */}
          <div className="flex flex-col items-center gap-4 py-10 opacity-50">
            <div className="flex items-center gap-6">
              <div className="h-px w-12 bg-white/20" />
              <span className="text-[11px] font-black tracking-[0.4em] text-white uppercase">Düzce University 2026</span>
              <div className="h-px w-12 bg-white/20" />
            </div>
          </div>
        </div>
      </main>

      <GlobalFooter language={language} onNavigate={onNavigate} />
    </motion.div>
  );
}
