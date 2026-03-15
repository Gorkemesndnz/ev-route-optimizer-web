import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck, FileText, Scale, Copyright, Lock, AlertTriangle, Zap, Cpu } from "lucide-react";
import { translations } from "../lib/translations";
import GlobalFooter from "./GlobalFooter";

export default function TermsView({ 
  language, 
  onBack,
  onNavigate
}: { 
  language: 'tr' | 'en';
  onBack: () => void;
  onNavigate: (page: any) => void;
}) {
  const t = translations[language];

  const termsParagraphs = t.termsText.split('\n\n');

  const sectionIcons = [
    <FileText key="1" className="text-cyan-400" size={24} />,
    <AlertTriangle key="2" className="text-cyan-400" size={24} />,
    <Zap key="3" className="text-cyan-400" size={24} />,
    <ShieldCheck key="4" className="text-cyan-400" size={24} />,
    <Copyright key="5" className="text-cyan-400" size={24} />,
    <Cpu key="6" className="text-cyan-400" size={24} />,
    <Scale key="7" className="text-cyan-400" size={24} />
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

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-20">
        <div className="flex flex-col gap-12">
          {/* Hero Section */}
          <div className="flex flex-col gap-6 items-center text-center">
            <div className="w-20 h-20 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-2 shadow-2xl border border-cyan-400/20">
              <FileText size={40} />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.9]">
              {t.terms}
            </h1>
            <p className="text-lg text-white/30 max-w-xl font-medium uppercase tracking-[0.2em]">
              {language === 'tr' ? "YASAL ŞARTLAR VE YÜKÜMLÜLÜKLER" : "LEGAL TERMS AND OBLIGATIONS"}
            </p>
          </div>

          {/* Policy List */}
          <div className="flex flex-col gap-8">
            {termsParagraphs.map((paragraph, idx) => {
              const lines = paragraph.split('\n');
              const title = lines[0];
              const content = lines.slice(1).join('\n');

              return (
                <motion.section 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group p-8 md:p-12 rounded-[40px] bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all hover:bg-white/[0.07]"
                >
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-16 h-16 shrink-0 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-cyan-400 group-hover:text-zinc-950 transition-all duration-300">
                      {sectionIcons[idx] || <FileText className="text-cyan-400" size={24} />}
                    </div>
                    <div className="flex flex-col gap-4">
                      <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                        {title}
                      </h2>
                      <p className="text-lg text-white/50 leading-relaxed font-medium whitespace-pre-wrap">
                        {content || paragraph}
                      </p>
                    </div>
                  </div>
                </motion.section>
              );
            })}
          </div>

          {/* Privacy Note */}
          <div className="p-8 rounded-[30px] border border-dashed border-white/10 bg-white/[0.02] flex items-center gap-6 group hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-cyan-400 transition-colors">
              <Lock size={20} />
            </div>
            <p className="text-sm text-white/30 flex-1 leading-relaxed italic">
              {language === 'tr' 
                ? "Gizlilik Politikamız uyarınca verileriniz uçtan uca şifrelenir ve asla üçüncü taraf reklam ağlarıyla paylaşılmaz." 
                : "Your data is end-to-end encrypted in accordance with our Privacy Policy and is never shared with third-party advertising networks."}
            </p>
          </div>
        </div>
      </main>

      <GlobalFooter language={language} onNavigate={onNavigate} />
    </motion.div>
  );
}
