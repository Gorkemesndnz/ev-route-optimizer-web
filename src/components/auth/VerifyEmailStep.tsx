import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { useSettings } from "../../contexts/SettingsContext";

interface VerifyEmailStepProps {
  email: string;
  otp: string;
  handleOtpChange: (val: string) => void;
  otpError: string;
  timeLeft: number;
  handleResend: () => void;
  handleVerifySubmit: () => void;
  isLoading: boolean;
}

export default function VerifyEmailStep({
  email,
  otp,
  handleOtpChange,
  otpError,
  timeLeft,
  handleResend,
  handleVerifySubmit,
  isLoading,
}: VerifyEmailStepProps) {
  const { language } = useSettings();
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <motion.div
      key="verify_email"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col gap-1.5 mt-8 mb-4 items-center text-center">
        <h2 className="text-2xl font-bold text-white tracking-wide">{language === 'tr' ? 'Doğrulama Kodu' : 'Verification Code'}</h2>
        <p className="text-sm text-white/50 leading-relaxed">
          {language === 'tr' ? 'adresine gönderdiğimiz 6 haneli kodu aşağıya giriniz.' : 'Please enter the 6-digit code we sent to'} <span className="text-cyan-400 font-medium break-all">{email}</span>.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-2 items-center">
          <input 
            type="text" 
            autoFocus
            maxLength={6}
            value={otp}
            disabled={timeLeft === 0 || isLoading}
            onChange={(e) => handleOtpChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && handleVerifySubmit()}
            placeholder="••••••"
            className={cn(
              "w-full max-w-[240px] text-center text-2xl tracking-[0.3em] font-bold bg-white/5 border rounded-xl py-3 px-4 text-white focus:outline-none transition-all placeholder:text-white/10 shadow-inner",
              otpError ? "border-red-500/50 focus:border-red-500/50 focus:bg-red-500/5" : "border-white/10 focus:border-cyan-400/50 focus:bg-white/10 disabled:opacity-50"
            )}
          />
          <AnimatePresence>
            {otpError && (
              <motion.span 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="text-red-400 text-sm font-medium mt-1"
              >
                {otpError}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={handleVerifySubmit}
          disabled={otp.length !== 6 || timeLeft === 0 || isLoading}
          className="w-full max-w-[200px] mx-auto py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-xl transition-all shadow-lg shadow-cyan-400/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading ? (language === 'tr' ? 'Doğrulanıyor...' : 'Verifying...') : (language === 'tr' ? 'Doğrula' : 'Verify')}
        </button>

        <div className="flex justify-center mt-2">
          {timeLeft > 0 ? (
            <span className="text-sm font-medium text-white/50 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              {language === 'tr' ? 'Kalan süre:' : 'Time left:'} <span className="text-white">{formatTime(timeLeft)}</span>
            </span>
          ) : (
            <button 
              onClick={handleResend}
              className="text-sm text-cyan-400 hover:text-cyan-300 font-medium underline decoration-cyan-400/30 underline-offset-4 transition-all"
            >
              {language === 'tr' ? 'Kodu Tekrar Gönder' : 'Resend Code'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
