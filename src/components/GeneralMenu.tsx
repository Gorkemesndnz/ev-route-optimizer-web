import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Globe, 
  Scale, 
  HelpCircle, 
  Sparkles, 
  MessageSquare, 
  Bug, 
  FileText, 
  ShieldCheck, 
  Cookie, 
  ChevronRight 
} from "lucide-react";

export default function GeneralMenu({ 
  isOpen, 
  onClose,
  onOpenCookieConsent,
  onOpenPrivacy
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onOpenCookieConsent: () => void;
  onOpenPrivacy: () => void;
}) {
  const menuSections = [
    {
      title: "Tercihler",
      items: [
        { icon: <Globe size={18} />, label: "Dil ve Bölge", value: "Türkçe / English" },
        { icon: <Scale size={18} />, label: "Birim Sistemi", value: "Metrik / Emperyal" }
      ]
    },
    {
      title: "Keşfet",
      items: [
        { icon: <HelpCircle size={18} />, label: "Nasıl Çalışır?" },
        { icon: <Sparkles size={18} />, label: "Neler Yeni?" },
        { icon: <MessageSquare size={18} />, label: "Sıkça Sorulan Sorular" }
      ]
    },
    {
      title: "İletişim & Destek",
      items: [
        { icon: <Bug size={18} />, label: "Hata Bildir" },
        { icon: <MessageSquare size={18} />, label: "Bize Ulaşın" }
      ]
    },
    {
      title: "Yasal",
      items: [
        { icon: <FileText size={18} />, label: "Kullanım Koşulları" },
        { icon: <ShieldCheck size={18} />, label: "Gizlilik Politikası", onClick: onOpenPrivacy },
        { icon: <Cookie size={18} />, label: "Çerez Tercihlerini Yönet", onClick: onOpenCookieConsent }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="general-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] pointer-events-auto cursor-pointer"
          />

          {/* Right Menu Panel */}
          <motion.div
            key="general-menu-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="fixed top-0 right-0 h-[100svh] w-full sm:w-[380px] bg-zinc-950/90 backdrop-blur-2xl border-l border-white/10 z-[90] flex flex-col pointer-events-auto shadow-[-20px_0_40px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <span className="text-xl font-black tracking-widest text-emerald-500 uppercase">IYONTREE</span>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Blocks */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">
              {menuSections.map((section, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest pl-1">{section.title}</h4>
                  <div className="flex flex-col gap-1">
                    {section.items.map((item, itemIdx) => (
                      <button 
                        key={itemIdx}
                        onClick={() => {
                          if (item.onClick) {
                            item.onClick();
                          }
                        }}
                        className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group text-left outline-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-white/40 group-hover:text-cyan-400 transition-colors">
                            {item.icon}
                          </div>
                          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.value && (
                            <span className="text-xs font-medium text-white/30 group-hover:text-white/50">{item.value}</span>
                          )}
                          <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 shrink-0 flex justify-center">
              <span className="text-[11px] font-semibold tracking-widest text-white/30 uppercase">IYONTREE v1.0.0 Beta</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
