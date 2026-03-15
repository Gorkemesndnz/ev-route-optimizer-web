import { useEffect, useState } from "react";
import BasePageLayout, { useMarketing } from "./BasePageLayout";
import { translations } from "../lib/translations";
import { Cpu, Globe, Rocket, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Hakkimizda() {
  const { language: lang } = useMarketing();
  const t = translations[lang];

  return (
    <BasePageLayout 
      title={lang === 'tr' ? "Yenilikçi Enerji Vizyonu" : "Innovative Energy Vision"} 
      subtitle={lang === 'tr' ? "Hakkımızda" : "About Us"}
    >
      <div className="flex flex-col gap-8">
        {/* Main Glass Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 md:p-14 rounded-[40px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 shadow-xl shadow-cyan-900/5 transition-all text-slate-800 dark:text-slate-100"
        >
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="w-20 h-20 shrink-0 rounded-3xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center border border-cyan-200 dark:border-cyan-800 shadow-sm text-cyan-600 dark:text-cyan-400 transition-colors">
              <Cpu size={40} />
            </div>
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight transition-colors">
                {t.aboutUsTitle}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap font-medium transition-colors">
                {t.aboutText}
              </p>
              <p className="text-xl font-semibold text-cyan-700 dark:text-cyan-400 mt-4 italic border-l-4 border-cyan-400 pl-4 py-2 transition-colors">
                "{t.aboutUsSub}"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-[30px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 shadow-lg shadow-cyan-900/5 group hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all"
          >
            <Globe className="text-cyan-600 dark:text-cyan-400 mb-6 transition-colors" size={32} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 transition-colors">{t.smartPlanning}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">{t.smartPlanningDesc}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-[30px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 shadow-lg shadow-emerald-900/5 group hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all"
          >
            <ShieldCheck className="text-emerald-600 dark:text-emerald-400 mb-6 transition-colors" size={32} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 transition-colors">{t.reliableNetwork}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">{t.reliableNetworkDesc}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-[30px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 shadow-lg shadow-blue-900/5 group hover:border-blue-300 dark:hover:border-blue-500/30 transition-all md:col-span-2 lg:col-span-1"
          >
            <Rocket className="text-blue-600 dark:text-blue-400 mb-6 transition-colors" size={32} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 transition-colors">{t.ourMission}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">{t.ourMissionDesc}</p>
          </motion.div>
        </div>
      </div>
    </BasePageLayout>
  );
}
