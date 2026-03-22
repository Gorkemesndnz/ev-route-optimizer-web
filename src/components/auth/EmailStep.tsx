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
  isLoading: boolean;
  customMessage?: string;
}

export default function EmailStep({
  email,
  setEmail,
  authError,
  setAuthError,
  handleEmailSubmit,
  isLoading,
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
          disabled={!email || isLoading}
          className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-400 text-black font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] mt-2 shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2"
        >
          {isLoading ? (language === 'tr' ? 'Kontrol ediliyor...' : 'Checking...') : t.continue}
        </button>
      </div>

      <div className="flex items-center gap-4 my-2 opacity-50">
        <div className="h-px bg-white/20 flex-1"></div>
        <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">{t.or}</span>
        <div className="h-px bg-white/20 flex-1"></div>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={() => console.log('Google login clicked')}
          className="w-full bg-white/5 hover:bg-white/15 border border-white/10 py-3 rounded-xl font-medium text-white transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-3 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {t.continueWithGoogle}
        </button>
        <button 
          onClick={() => console.log('Apple login clicked')}
          className="w-full bg-white/5 hover:bg-white/15 border border-white/10 py-3 rounded-xl font-medium text-white transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-3 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform mb-1" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05 1.78-3.19 1.76-1.14-.02-1.55-.71-2.91-.71-1.36 0-1.83.69-2.91.73-1.08.04-2.14-.8-3.14-1.78-2.03-1.98-3.58-5.59-1.53-9.14 1.01-1.76 2.83-2.87 4.81-2.9 1.5-.02 2.92 1.01 3.84 1.01.92 0 2.67-1.24 4.51-1.06.77.03 2.93.31 4.31 2.33-1.07.66-2.02 2.37-2.02 4.14 0 2.21 1.93 2.98 1.96 3-.04.14-.3.99-.98 1.62zM12.03 7.25c-.23-1.93 1.34-3.77 3-4.14.28 2.09-1.59 4.14-3 4.14z" />
          </svg>
          {t.continueWithApple}
        </button>
      </div>
    </motion.div>
  );
}
