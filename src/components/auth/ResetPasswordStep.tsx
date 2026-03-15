import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { useSettings } from "../../contexts/SettingsContext";

interface ResetPasswordStepProps {
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  isPasswordsMatch: boolean;
  handleClose: () => void;
}

export default function ResetPasswordStep({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isPasswordsMatch,
  handleClose,
}: ResetPasswordStepProps) {
  const { language } = useSettings();
  return (
    <motion.div
      key="reset_password"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col gap-1.5 mt-8 mb-2">
        <h2 className="text-2xl font-bold text-white tracking-wide">{language === 'tr' ? 'Yeni Şifre' : 'New Password'}</h2>
        <p className="text-sm text-white/50">
          {language === 'tr' ? 'Hesabınız için yeni bir şifre belirleyin.' : 'Set a new password for your account.'}
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">{language === 'tr' ? 'Yeni Şifre' : 'New Password'}</label>
          <input 
            type="password" 
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/30 shadow-inner" 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">{language === 'tr' ? 'Şifreyi Tekrar Girin' : 'Retype Password'}</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && password && isPasswordsMatch) {
                alert("Yeni Parola Kaydedildi. Oturum Açılıyor...");
                handleClose();
              }
            }}
            placeholder="••••••••"
            className={cn(
              "w-full bg-white/5 border rounded-xl py-3 px-4 text-white focus:outline-none transition-all font-medium placeholder:text-white/30 shadow-inner",
              (!isPasswordsMatch && confirmPassword) ? "border-red-500/50 focus:border-red-500/50 focus:bg-red-500/5" : "border-white/10 focus:border-cyan-400/50 focus:bg-white/10"
            )} 
          />
          <AnimatePresence>
            {(!isPasswordsMatch && confirmPassword) && (
              <motion.span 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="text-red-400 text-sm font-medium mt-0.5"
              >
                Şifreler uyuşmuyor.
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => {
            handleClose();
          }}
          disabled={!password || !isPasswordsMatch}
          className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-400 text-black font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] mt-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          {language === 'tr' ? 'Şifreyi Yenile (Mock)' : 'Reset Password (Mock)'}
        </button>
      </div>
    </motion.div>
  );
}
