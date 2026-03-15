import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettings } from "../../contexts/SettingsContext";
import { translations } from "../../lib/translations";

interface RegisterStepProps {
  email: string;
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  isPasswordsMatch: boolean;
  fieldErrors: { [key: string]: string };
  handleRegisterSubmit: () => void;
}

const nameRegexObj = /[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g;

export default function RegisterStep({
  email,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  isPasswordsMatch,
  fieldErrors,
  handleRegisterSubmit
}: RegisterStepProps) {
  const { language } = useSettings();
  const t = translations[language];
  const lastNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const len = phoneNumber.length;
    if (len < 4) return phoneNumber;
    if (len < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    if (len < 9) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 8)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 8)}-${phoneNumber.slice(8, 10)}`;
  };

  return (
    <motion.div
      key="register"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col gap-1.5 mt-8 mb-2">
        <h2 className="text-2xl font-bold text-white tracking-wide">{t.registerNow}</h2>
        <p className="text-sm text-white/50 leading-relaxed">
          {language === 'tr' ? 'ile hesap oluştur.' : 'Create an account with'} <span className="text-cyan-400 font-medium break-all">{email}</span>.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">{t.firstName}</label>
            <input 
              type="text" 
              autoFocus
              value={firstName}
              onChange={(e) => setFirstName(e.target.value.replace(nameRegexObj, ''))}
              onKeyDown={(e) => e.key === 'Enter' && lastNameRef.current?.focus()}
              placeholder={t.firstName}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/30 shadow-inner" 
            />
            {fieldErrors.firstName && <span className="text-red-400 text-[10px] px-1 font-medium">{fieldErrors.firstName}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">{t.lastName}</label>
            <input 
              type="text" 
              ref={lastNameRef}
              value={lastName}
              onChange={(e) => setLastName(e.target.value.replace(nameRegexObj, ''))}
              onKeyDown={(e) => e.key === 'Enter' && phoneRef.current?.focus()}
              placeholder={t.lastName}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/30 shadow-inner" 
            />
            {fieldErrors.lastName && <span className="text-red-400 text-[10px] px-1 font-medium">{fieldErrors.lastName}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/70">{language === 'tr' ? 'Telefon Numarası' : 'Phone Number'}</label>
          <input 
            type="tel" 
            ref={phoneRef}
            value={phone}
            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && passwordRef.current?.focus()}
            placeholder="(555) 000-00-00"
            maxLength={15}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/30 shadow-inner font-mono tracking-wide" 
          />
          {fieldErrors.phone && <span className="text-red-400 text-[10px] px-1 font-medium">{fieldErrors.phone}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/70">{language === 'tr' ? 'Şifre Belirle' : 'Set Password'}</label>
          <input 
            type="password" 
            ref={passwordRef}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmPasswordRef.current?.focus()}
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/30 shadow-inner" 
          />
          {fieldErrors.password && <span className="text-red-400 text-[10px] px-1 font-medium">{fieldErrors.password}</span>}
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/70">{language === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}</label>
          <input 
            type="password"
            ref={confirmPasswordRef} 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                 handleRegisterSubmit();
              }
            }}
            placeholder="••••••••"
            className={cn(
              "w-full bg-white/5 border rounded-xl py-3 px-4 text-white focus:outline-none transition-all font-medium placeholder:text-white/30 shadow-inner",
              (!isPasswordsMatch && confirmPassword) ? "border-red-500/50 focus:border-red-500/50 focus:bg-red-500/5" : "border-white/10 focus:border-cyan-400/50 focus:bg-white/10"
            )} 
          />
          {fieldErrors.confirmPassword && (
            <span className="text-red-400 text-[10px] px-1 font-medium mt-0.5">
              {fieldErrors.confirmPassword}
            </span>
          )}
        </div>

         <button 
          onClick={handleRegisterSubmit}
          className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] mt-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          {language === 'tr' ? 'Kayıt Ol ve Doğrula' : 'Register and Verify'}
        </button>
      </div>
    </motion.div>
  );
}
