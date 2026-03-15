import { Link } from "react-router-dom";
import { Cpu, MapPin, Car, ArrowRight, ArrowDown } from "lucide-react";
import BasePageLayout, { useMarketing } from "./BasePageLayout";
import { motion } from "framer-motion";

export default function Home() {
  const { language } = useMarketing();
  
  const content = {
    tr: {
      headlinePart1: "Elektrikli Araçlar İçin",
      headlinePart2: "Yeni Nesil Rota Zekası",
      subhead: "Sadece mesafeyi değil; yol eğimini, hava durumunu ve aracınızın fiziğini hesaplayan gelişmiş tüketim motoruyla menzil endişesini geride bırakın.",
      btnPrimary: "Rotanızı Planlayın",
      btnSecondary: "Nasıl Çalışır?",
      featuresTitle: "Akıllı Özellikler",
      featuresSubtitle: "Elektrikli sürüş deneyiminizi üst seviyeye taşıyan yenilikçi teknolojiler.",
      f1Title: "Fizik Tabanlı Hesaplama",
      f1Desc: "Rakım değişiklikleri, hava sıcaklığı ve aerodinamik sürtünme gibi gerçek dünya değişkenlerini anlık işler.",
      f2Title: "Akıllı Şarj Planlaması",
      f2Desc: "Aracınıza ve batarya kapasitenize en uygun AC/DC istasyonlarını saniyeler içinde güzergahınıza ekler.",
      f3Title: "Kişiselleştirilmiş Deneyim",
      f3Desc: "Kendi araç modelinizi, başlangıç şarjınızı (SoC) ve sürüş tercihlerinizi kaydederek size özel rotalar oluşturun."
    },
    en: {
      headlinePart1: "Next Generation Routing Intelligence",
      headlinePart2: "For Electric Vehicles",
      subhead: "Leave range anxiety behind with an advanced consumption engine that calculates not just distance, but road elevation, weather, and vehicle physics.",
      btnPrimary: "Plan Your Route",
      btnSecondary: "How It Works?",
      featuresTitle: "Smart Features",
      featuresSubtitle: "Innovative technologies elevating your electric driving experience to the next level.",
      f1Title: "Physics-Based Calculation",
      f1Desc: "Processes real-world variables such as elevation changes, weather temperature, and aerodynamic drag in real-time.",
      f2Title: "Smart Charge Planning",
      f2Desc: "Adds the most suitable AC/DC stations for your vehicle and battery capacity to your route in seconds.",
      f3Title: "Personalized Experience",
      f3Desc: "Create custom routes by saving your own vehicle model, initial state of charge (SoC), and driving preferences."
    }
  };

  const t = content[language];

  return (
    <BasePageLayout>
      <section className="flex flex-col items-center text-center mt-10 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 items-center max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-[1.1] transition-colors">
            {t.headlinePart1} <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 dark:from-cyan-400 dark:to-emerald-400">
              {t.headlinePart2}
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium transition-colors">
            {t.subhead}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Link 
              to="/"
              className="h-14 px-8 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-full font-bold shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 outline-none flex items-center justify-center gap-2 transition-all hover:-translate-y-1 text-lg w-full sm:w-auto"
            >
              <span>{t.btnPrimary}</span>
              <ArrowRight size={20} />
            </Link>
            <a 
              href="#ozellikler"
              className="h-14 px-8 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-bold hover:border-cyan-300 dark:hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-700 outline-none flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
            >
              <span>{t.btnSecondary}</span>
              <ArrowDown size={20} />
            </a>
          </div>
        </motion.div>

        {/* Hero Image/Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-5xl mt-12"
        >
          <div className="aspect-[16/9] md:aspect-[21/9] bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 rounded-[40px] shadow-2xl p-4 flex flex-col overflow-hidden relative group transition-colors">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/30 to-emerald-50/30 dark:from-cyan-900/20 dark:to-emerald-900/10 group-hover:opacity-50 transition-opacity" />
            
            {/* Mockup Header */}
            <div className="h-8 w-full border-b border-slate-200/50 dark:border-slate-700/50 flex items-center px-4 gap-2 shrink-0 relative z-10 transition-colors">
              <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500" />
            </div>

            {/* Mockup Content */}
            <div className="flex-1 relative w-full h-full flex items-center justify-center p-8 z-10">
               <div className="w-3/4 h-32 relative flex items-center justify-center">
                  <div className="absolute inset-x-0 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors">
                    <div className="w-2/3 h-full bg-gradient-to-r from-cyan-400 to-emerald-400 relative">
                      <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/50 animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="absolute left-[66%] -translate-x-1/2 -translate-y-4 w-16 h-10 bg-white dark:bg-slate-800 shadow-lg shadow-cyan-900/10 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center text-cyan-500 dark:text-cyan-400 transition-colors">
                    <Car size={24} />
                  </div>

                  <div className="absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full border-4 border-cyan-500 bg-white dark:bg-slate-800 transition-colors" />
                  <div className="absolute right-0 translate-x-1/2 w-6 h-6 rounded-full border-4 border-emerald-500 bg-white dark:bg-slate-800 transition-colors" />
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="ozellikler" className="flex flex-col gap-12 scroll-mt-24 mt-10">
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
            {t.featuresTitle}
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto transition-colors">
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[30px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 shadow-xl shadow-cyan-900/5 flex flex-col gap-6 hover:-translate-y-1 hover:shadow-cyan-900/10 dark:hover:border-cyan-500/30 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 transition-colors">
              <Cpu size={32} />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">{t.f1Title}</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed transition-colors">{t.f1Desc}</p>
            </div>
          </div>

          <div className="p-8 rounded-[30px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 shadow-xl shadow-cyan-900/5 flex flex-col gap-6 hover:-translate-y-1 hover:shadow-emerald-900/10 dark:hover:border-emerald-500/30 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-colors">
              <MapPin size={32} />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">{t.f2Title}</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed transition-colors">{t.f2Desc}</p>
            </div>
          </div>

          <div className="p-8 rounded-[30px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 shadow-xl shadow-cyan-900/5 flex flex-col gap-6 hover:-translate-y-1 hover:shadow-blue-900/10 dark:hover:border-blue-500/30 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-colors">
              <Car size={32} />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors">{t.f3Title}</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed transition-colors">{t.f3Desc}</p>
            </div>
          </div>
        </div>
      </section>
    </BasePageLayout>
  );
}
