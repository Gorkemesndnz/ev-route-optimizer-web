import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CookieConsent({
  showBanner,
  showModal,
  onOpenPrivacy,
  onOpenSettings,
  onSave
}: {
  showBanner: boolean;
  showModal: boolean;
  onOpenPrivacy: () => void;
  onOpenSettings: () => void;
  onSave: (prefs: any) => void;
}) {
  const [analytical, setAnalytical] = useState(true);
  const [crashReports, setCrashReports] = useState(true);

  // When modal mounts or is opened, sync local states
  useEffect(() => {
    if (showModal) {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('iyontree_cookies');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setAnalytical(Boolean(parsed.analytical ?? true));
            setCrashReports(Boolean(parsed.crashReports ?? true));
          } catch {
            setAnalytical(true);
            setCrashReports(true);
          }
        }
      }
    }
  }, [showModal]);

  const handleAcceptAll = () => {
    onSave({
      analytical: true,
      crashReports: true,
      necessary: true,
      allAccepted: true,
      timestamp: Date.now()
    });
  };

  const handleAcceptRequired = () => {
    onSave({
      analytical: false,
      crashReports: false,
      necessary: true,
      allAccepted: false,
      timestamp: Date.now()
    });
  };

  const handleSaveSettings = () => {
    onSave({
      analytical,
      crashReports,
      necessary: true,
      allAccepted: analytical && crashReports,
      timestamp: Date.now()
    });
  };

  return (
    <>
      <AnimatePresence>
        {/* === FLOATING BANNER === */}
        {showBanner && !showModal && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 lg:left-6 lg:right-auto z-[90] w-[calc(100%-2rem)] sm:w-[500px]"
          >
            <div className="glass-panel p-5 sm:p-6 flex flex-col gap-4 border border-white/10 shadow-2xl">
              <p className="text-[13px] sm:text-sm text-white/70 leading-relaxed font-medium">
                İYONTREE web sitesi, gezinme deneyiminizi iyileştirmek, site trafiğini analiz etmek ve elektrikli araç rota planlama algoritmamızı optimize etmek için çerezler kullanır. 'Tümünü Kabul Et' seçeneğiyle analitik ve performans çerezlerine izin vermiş olursunuz. 'Özelleştir' kısmından tercihlerinizi yönetebilirsiniz.
                <br /><br />
                <button onClick={onOpenPrivacy} className="text-white hover:text-emerald-400 font-medium underline decoration-white/30 hover:decoration-emerald-400/50 underline-offset-4 transition-all outline-none">
                  Gizlilik Bildirimimizden daha fazla bilgi edinin
                </button>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:justify-end">
                <button 
                  onClick={handleAcceptRequired}
                  className="py-2.5 px-4 rounded-xl border border-white/20 text-white/90 hover:text-white font-medium text-sm hover:bg-white/5 transition-all outline-none active:scale-[0.98]"
                >
                  Zorunlu Olanları Kabul Et
                </button>
                <button 
                  onClick={onOpenSettings}
                  className="py-2.5 px-4 rounded-xl border border-white/20 text-white/90 hover:text-white font-medium text-sm hover:bg-white/5 transition-all outline-none active:scale-[0.98]"
                >
                  Özelleştir
                </button>
                <button 
                  onClick={handleAcceptAll}
                  className="py-2.5 px-6 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-400 transition-all outline-none active:scale-[0.98] shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  Tümünü Kabul Et
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* === CUSTOMIZE MODAL === */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" 
              onClick={() => {}} // Usually don't want to close on backdrop click for legal settings
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="glass-panel w-full sm:w-[500px] flex flex-col relative z-10 max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                <h2 className="text-xl font-bold text-white tracking-wide">Gizlilik Ayarları</h2>
                <button 
                  onClick={() => onSave({
                    analytical,
                    crashReports,
                    necessary: true,
                    allAccepted: analytical && crashReports,
                    timestamp: Date.now()
                  })}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
                
                {/* 1. Gerekli (Necessary) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">Gerekli</h3>
                    <div className="w-12 h-6 bg-zinc-700/50 rounded-full relative cursor-not-allowed">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-emerald-500/50 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed font-medium pr-4">
                    Uygulamanın temel işlevleri için gereklidir (ör. oturum açma, dil tercihleri, güvenlik öğeleri). Devredışı bırakılamazlar çünkü hizmetin sunulması doğrudan bu çerezlere bağlıdır.
                  </p>
                </div>

                <div className="w-full h-px bg-white/5"></div>

                {/* 2. Analitik */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">Analitik</h3>
                    <button 
                      onClick={() => setAnalytical(!analytical)}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-colors duration-300 outline-none flex items-center px-1",
                        analytical ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-zinc-800 border border-white/10"
                      )}
                    >
                      <motion.div 
                        layout 
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={cn(
                          "w-4 h-4 rounded-full shadow-sm",
                          analytical ? "bg-emerald-500" : "bg-white/50"
                        )}
                        style={{ marginLeft: analytical ? 'auto' : '0' }}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed font-medium pr-4">
                    Kullanıcıların siteyle nasıl etkileşime girdiğini anlamamıza yardımcı olur. Bu veriler tamamen anonimleştirilir ve deneyiminizi iyileştirmek için kullanılır.
                  </p>
                </div>

                <div className="w-full h-px bg-white/5"></div>

                {/* 3. Çökme Raporları */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">Çökme Raporları & Performans</h3>
                    <button 
                      onClick={() => setCrashReports(!crashReports)}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-colors duration-300 outline-none flex items-center px-1",
                        crashReports ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-zinc-800 border border-white/10"
                      )}
                    >
                      <motion.div 
                        layout 
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={cn(
                          "w-4 h-4 rounded-full shadow-sm",
                          crashReports ? "bg-emerald-500" : "bg-white/50"
                        )}
                        style={{ marginLeft: crashReports ? 'auto' : '0' }}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed font-medium pr-4">
                    Hataları tespit edip düzeltmek ve rota hesaplama algoritmamızdaki performans darboğazlarını incelemek için teknik raporları paylaşır.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 shrink-0 flex flex-col gap-4">
                <button 
                  onClick={onOpenPrivacy}
                  className="text-[13px] text-white/40 hover:text-white/70 transition-colors text-left font-medium underline decoration-white/20 hover:decoration-white/50 underline-offset-2 outline-none"
                >
                  Kullandığımız çerezler hakkında daha fazla bilgiyi Gizlilik Bildiriminde bulabilirsiniz.
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-400 transition-all outline-none active:scale-[0.98] shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  Seçimi Kaydet
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
