import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { translations } from "../../lib/translations";
import { Edit2, Check, X, Loader2 } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { ENDPOINTS } from "../../lib/endpoints";
import { useSettings } from "../../contexts/SettingsContext";

type TranslationType = typeof translations.tr;

interface AccountProfileTabProps {
  t: TranslationType;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
}

export default function AccountProfileTab({ t, user }: AccountProfileTabProps) {
  const { language } = useSettings();
  const { setCurrentUser } = useAuth();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phoneNumber || "");
  const [email, setEmail] = useState(user.email);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [isPhoneEditable, setIsPhoneEditable] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isEmailVerifiedLocally, setIsEmailVerifiedLocally] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async () => {
    if (isVerifyingEmail) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient(ENDPOINTS.AUTH_PROFILE, {
        method: 'PUT',
        body: { firstName, lastName, email, phoneNumber: phone }
      });
      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.data);
        localStorage.setItem('iyontree_user', JSON.stringify(data.data));
        setIsEmailEditable(false);
        setIsPhoneEditable(false);
        setIsEmailVerifiedLocally(false);
        alert(t.profileUpdated);
      } else {
        alert(data.error || "Güncelleme sırasında bir hata oluştu.");
      }
    } catch (error) {
      alert("Sunucu hatası.");
    } finally {
      setIsLoading(false);
    }
  };

  const startEmailVerification = async (newEmail: string) => {
    if (newEmail === user.email) {
      setIsEmailEditable(false);
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await apiClient(ENDPOINTS.AUTH_PROFILE_SEND_CODE, {
        method: 'POST',
        body: { newEmail }
      });
      const data = await response.json();
      if (data.success) {
        setIsVerifyingEmail(true);
      } else {
        alert(data.error);
        setEmail(user.email);
        setIsEmailEditable(false);
      }
    } catch (error) {
      alert("Kod gönderilemedi.");
      setEmail(user.email);
      setIsEmailEditable(false);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (emailOtp.length !== 6) return;
    setIsLoading(true);
    try {
      const response = await apiClient(ENDPOINTS.AUTH_PROFILE_VERIFY_CODE, {
        method: 'POST',
        body: { newEmail: email, code: emailOtp }
      });
      const data = await response.json();
      if (data.success) {
        setIsVerifyingEmail(false);
        setIsEmailEditable(false);
        setIsEmailVerifiedLocally(true);
        setEmailOtp("");
        setOtpError("");
      } else {
        setOtpError(data.error || "Hatalı kod.");
      }
    } catch (error) {
      setOtpError("Doğrulama hatası.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="col-start-1 row-start-1 max-w-2xl mx-auto flex flex-col gap-6 w-full"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">{t.firstNameLabel}</label>
          <input 
            type="text" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium" 
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">{t.lastNameLabel}</label>
          <input 
            type="text" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium" 
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">{t.emailLabel}</label>
        <div className="relative group">
          <input 
            type="email" 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setIsEmailVerifiedLocally(false);
            }}
            disabled={!isEmailEditable || isVerifyingEmail}
            autoFocus={isEmailEditable}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                startEmailVerification(email);
              } else if (e.key === 'Escape') {
                setEmail(user.email);
                setIsEmailEditable(false);
              }
            }}
            onBlur={() => {
              if (!isVerifyingEmail && email === user.email) {
                setIsEmailEditable(false);
              }
            }}
            className={cn(
               "w-full border rounded-xl py-3 px-4 text-white font-medium transition-all outline-none pr-12",
               isEmailEditable ? "bg-white/10 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]" : "bg-black/20 border-white/5 text-white/50 cursor-not-allowed",
               isEmailVerifiedLocally && !isEmailEditable && "border-emerald-500/50"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isSendingOtp ? (
              <Loader2 size={18} className="text-cyan-400 animate-spin" />
            ) : isEmailVerifiedLocally && !isEmailEditable ? (
              <Check size={18} className="text-emerald-400" />
            ) : !isEmailEditable ? (
              <button 
                onClick={() => setIsEmailEditable(true)}
                className="text-white/30 hover:text-cyan-400 transition-colors p-1"
                title={t.edit}
              >
                <Edit2 size={18} />
              </button>
            ) : !isVerifyingEmail && (
              <button 
                onClick={() => startEmailVerification(email)}
                className="text-cyan-400 hover:text-cyan-300 p-1"
              >
                <Check size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Email Verification OTP Input */}
        <AnimatePresence>
          {isVerifyingEmail && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-xl flex flex-col gap-3">
                <p className="text-xs font-medium text-cyan-400/80">
                  {language === 'tr' ? 'Yeni e-postanıza gönderilen 6 haneli kodu girin:' : 'Enter 6-digit code sent to your new email:'}
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    maxLength={6}
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white font-mono tracking-[0.5em] text-center focus:border-cyan-400/50 outline-none"
                  />
                  <button 
                    onClick={verifyEmailOtp}
                    disabled={emailOtp.length !== 6 || isLoading}
                    className="bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg transition-all"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : (language === 'tr' ? 'Doğrula' : 'Verify')}
                  </button>
                  <button 
                    onClick={() => {
                        setIsVerifyingEmail(false);
                        setIsEmailEditable(false);
                        setEmail(user.email);
                        setEmailOtp("");
                    }}
                    className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
                {otpError && <span className="text-red-400 text-xs font-medium">{otpError}</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">{t.phoneLabel}</label>
        <div className="relative group">
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            disabled={!isPhoneEditable}
            autoFocus={isPhoneEditable}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsPhoneEditable(false);
              else if (e.key === 'Escape') {
                setPhone(user.phoneNumber || "");
                setIsPhoneEditable(false);
              }
            }}
            onBlur={() => setIsPhoneEditable(false)}
            className={cn(
               "w-full border rounded-xl py-3 px-4 text-white font-medium transition-all outline-none font-mono pr-12",
               isPhoneEditable ? "bg-white/10 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]" : "bg-black/20 border-white/5 text-white/50 cursor-not-allowed"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {!isPhoneEditable ? (
              <button 
                onClick={() => setIsPhoneEditable(true)}
                className="text-white/30 hover:text-cyan-400 transition-colors p-1"
                title={t.edit}
              >
                <Edit2 size={18} />
              </button>
            ) : (
              <button 
                onClick={() => setIsPhoneEditable(false)}
                className="text-cyan-400 hover:text-cyan-300 p-1"
              >
                <Check size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <h4 className="text-lg font-bold text-white mt-4 border-t border-white/10 pt-6">{t.changePass}</h4>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">{t.currentPass}</label>
        <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/70">{t.newPass}</label>
        <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium" />
      </div>

      <div className="flex justify-end mt-4">
        <button 
          onClick={handleSaveChanges}
          disabled={isLoading || isVerifyingEmail}
          className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-zinc-950 font-bold rounded-xl transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center gap-2"
        >
          {isLoading && <Loader2 size={18} className="animate-spin" />}
          {t.saveChanges}
        </button>
      </div>
    </motion.div>
  );
}
