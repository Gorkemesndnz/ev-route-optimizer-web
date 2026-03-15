import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { translations } from "../../lib/translations";

interface PasswordStepProps {
  email: string;
  password: string;
  setPassword: (val: string) => void;
  authError: string;
  setAuthError: (val: string) => void;
  handlePasswordSubmit: () => void;
  handleGoToVerify: () => void;
  setAuthStep: (step: any) => void;
  language: 'tr' | 'en';
}

export default function PasswordStep({
  email,
  password,
  setPassword,
  authError,
  setAuthError,
  handlePasswordSubmit,
  handleGoToVerify,
  setAuthStep,
  language
}: PasswordStepProps) {
  const t = translations[language];

  return (
    <motion.div
      key="password"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col gap-2 mt-8 mb-2">
        <h2 className="text-2xl font-bold text-white tracking-wide">{t.welcomeBack}</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm text-cyan-400 font-medium break-all">{email}</span>
          <button 
            onClick={() => { setAuthStep('email'); setAuthError(''); setPassword(''); }} 
            className="text-xs shrink-0 text-white/50 hover:text-white underline decoration-white/30 underline-offset-2 transition-colors"
          >
            {language === 'tr' ? 'Değiştir' : 'Change'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-2 relative">
          <label className="text-sm font-medium text-white/70">{t.password}</label>
          <input 
            type="password" 
            autoFocus
            value={password}
            onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            placeholder="••••••••"
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
          onClick={handlePasswordSubmit}
          disabled={!password}
          className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-400 text-black font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] mt-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          {t.login}
        </button>
      </div>

      <div className="flex justify-center mt-2">
        <button onClick={handleGoToVerify} className="text-sm text-white/50 hover:text-white transition-colors">
          {language === 'tr' ? 'Şifremi Unuttum' : 'Forgot Password'}
        </button>
      </div>
    </motion.div>
  );
}
