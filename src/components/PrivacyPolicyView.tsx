import { ChevronLeft, Shield, Lock, Eye, Database, Share2, Info, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { translations } from "../lib/translations";
import GlobalFooter from "./GlobalFooter";

export default function PrivacyPolicyView({ 
  language = 'tr',
  onBack,
  onNavigate
}: { 
  language?: 'tr' | 'en';
  onBack: () => void;
  onNavigate: (page: any) => void;
}) {
  const t = translations[language];

  // Parse privacy text by newlines to match structural points
  const privacyParagraphs = (t as any).privacyText.split('\n\n');

  const sectionIcons = [
    <Info key="1" className="text-cyan-400" />,
    <Database key="2" className="text-cyan-400" />,
    <Eye key="3" className="text-cyan-400" />,
    <Share2 key="4" className="text-cyan-400" />,
    <Lock key="5" className="text-cyan-400" />,
    <Scale key="6" className="text-cyan-400" />
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[150] bg-zinc-950 flex flex-col overflow-y-auto custom-scrollbar"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 w-full h-20 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between text-white">
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
        <div className="w-24" />
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-20">
        <div className="flex flex-col gap-12">
          {/* Hero Section */}
          <div className="flex flex-col gap-6 items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-2 shadow-2xl border border-cyan-400/20">
              <Shield size={40} />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.9]">
              {t.privacyTitle}
            </h1>
            <p className="text-lg text-white/30 max-w-xl font-medium uppercase tracking-[0.2em]">
              {language === 'tr' ? "VERİ GÜVENLİĞİ VE GİZLİLİK" : "DATA SECURITY AND PRIVACY"}
            </p>
          </div>

          {/* Privacy Sections */}
          <div className="grid grid-cols-1 gap-6">
            {privacyParagraphs.map((paragraph: string, idx: number) => {
              const lines = paragraph.split('\n');
              const title = lines[0];
              const desc = lines.slice(1).join('\n');

              return (
                <motion.section 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-[35px] bg-white/[0.03] border border-white/5 hover:border-cyan-400/20 transition-all group"
                >
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-cyan-400 group-hover:text-zinc-950 transition-all">
                      {sectionIcons[idx] || <Database className="text-cyan-400" />}
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                      <p className="text-white/40 leading-relaxed whitespace-pre-wrap">{desc || paragraph}</p>
                    </div>
                  </div>
                </motion.section>
              );
            })}
          </div>
        </div>
      </main>

      <GlobalFooter language={language} onNavigate={onNavigate} />
    </motion.div>
  );
}
