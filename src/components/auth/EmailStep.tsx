import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettings } from "../../contexts/SettingsContext";
import { translations } from "../../lib/translations";

interface EmailStepProps {
  email: string;
  setEmail: (val: string) => void;
  authError: string;
  setAuthError: (val: string) => void;
  handleEmailSubmit: () => void;
  customMessage?: string;
}

export default function EmailStep({
  email,
  setEmail,
  authError,
  setAuthError,
  handleEmailSubmit,
  customMessage,
}: EmailStepProps) {
  const { language } = useSettings();
  const t = translations[language];

  return (
    <motion.div
      key="email"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center gap-2 mt-6 mb-4">
        <span className="text-2xl font-black tracking-widest text-emerald-500 uppercase">{t.appTitle}</span>
        <h2 className="text-xl font-bold text-white tracking-wide text-center whitespace-pre-line">
          {customMessage || (language === 'tr' ? "Giriş Yap veya Kayıt Ol" : "Login or Register")}
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 relative">
          <label className="text-sm font-medium text-white/70">{t.emailAddress}</label>
          <input 
            type="text" 
            autoFocus
            value={email}
            onChange={(e) => { setEmail(e.target.value); setAuthError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
            placeholder="ornek@iyontree.com"
            className={cn(
              "w-full bg-white/5 border rounded-xl py-3 px-4 text-white focus:outline-none transition-all font-medium placeholder:text-white/30 shadow-inner",
              authError ? "border-red-500/50 focus:border-red-500/50 focus:bg-red-500/5" : "border-white/10 focus:border-cyan-400/50 focus:bg-white/10"
            )} 
          />
          <AnimatePresence>
            {authError && (
              <motion.span 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="text-red-400 text-sm font-medium mt-0.5"
              >
                {authError}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={handleEmailSubmit}
          disabled={!email}
          className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-400 text-black font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] mt-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          {language === 'tr' ? 'Devam Et' : 'Continue'}
        </button>
      </div>

      <div className="flex items-center gap-4 my-2 opacity-50">
        <div className="h-px bg-white/20 flex-1"></div>
        <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">{language === 'tr' ? 'Veya' : 'Or'}</span>
        <div className="h-px bg-white/20 flex-1"></div>
      </div>

      <div className="flex flex-col gap-3">
        <button className="w-full bg-white/5 hover:bg-white/15 border border-white/10 py-3 rounded-xl font-medium text-white transition-all active:scale-[0.98] shadow-sm">
          {language === 'tr' ? 'Google ile Devam Et' : 'Continue with Google'}
        </button>
        <button className="w-full bg-white/5 hover:bg-white/15 border border-white/10 py-3 rounded-xl font-medium text-white transition-all active:scale-[0.98] shadow-sm">
          {language === 'tr' ? 'Apple ile Devam Et' : 'Continue with Apple'}
        </button>
      </div>
    </motion.div>
  );
}
