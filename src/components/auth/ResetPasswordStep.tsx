import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { useSettings } from "../../contexts/SettingsContext";

interface ResetPasswordStepProps {
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  isPasswordsMatch: boolean;
  onSubmit: () => Promise<boolean>;
  authError?: string;
  isLoading: boolean;
}

export default function ResetPasswordStep({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isPasswordsMatch,
  onSubmit,
  authError,
  isLoading
}: ResetPasswordStepProps) {
  const { language } = useSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        <div className="flex flex-col gap-2 relative">
          <label className="text-sm font-medium text-white/70">{language === 'tr' ? 'Yeni Şifre' : 'New Password'}</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-11 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/30 shadow-inner" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 relative">
          <label className="text-sm font-medium text-white/70">{language === 'tr' ? 'Şifreyi Tekrar Girin' : 'Retype Password'}</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && password && isPasswordsMatch) {
                  await onSubmit();
                }
              }}
              placeholder="••••••••"
              className={cn(
                "w-full bg-white/5 border rounded-xl py-3 px-4 pr-11 text-white focus:outline-none transition-all font-medium placeholder:text-white/30 shadow-inner",
                (!isPasswordsMatch && confirmPassword) ? "border-red-500/50 focus:border-red-500/50 focus:bg-red-500/5" : "border-white/10 focus:border-cyan-400/50 focus:bg-white/10"
              )} 
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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

        <AnimatePresence>
          {authError && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="text-red-400 text-sm bg-red-500/10 py-2 px-3 rounded-lg mt-2 text-center"
             >
               {authError}
             </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={onSubmit}
          disabled={!password || !isPasswordsMatch || isLoading}
          className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-400 text-black font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] mt-4 shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2"
        >
          {isLoading ? (language === 'tr' ? 'Şifre güncelleniyor...' : 'Updating password...') : (language === 'tr' ? 'Şifreyi Yenile' : 'Reset Password')}
        </button>
      </div>
    </motion.div>
  );
}
