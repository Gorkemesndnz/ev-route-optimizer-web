import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_USER = {
  email: 'admin@iyontree.com',
  password: '1234',
  firstName: 'admin',
  lastName: 'admin',
  phone: '(111) 111-11-11'
};

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [authStep, setAuthStep] = useState<'email' | 'password' | 'register' | 'verify_email' | 'reset_password'>('email');
  
  // Registration / Login Info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Errors & Validations
  const [authError, setAuthError] = useState('');
  
  // OTP States
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [otpError, setOtpError] = useState('');

  // Refs for Keyboard Navigation
  const lastNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // Email Validation Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 120-Second Countdown Timer Logic
  useEffect(() => {
    if (authStep !== 'verify_email' || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [authStep, timeLeft]);

  // Format mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- Handlers & Formatters --- //

  const handleClose = () => {
    // Tüm state'leri ve adımı kapatıldığında orijinal haline resetler
    setAuthStep('email');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setOtp('');
    setTimeLeft(120);
    setOtpError('');
    setAuthError('');
    onClose();
  };

  const handleEmailSubmit = () => {
    setAuthError('');
    if (!email) return;

    if (!emailRegex.test(email)) {
      setAuthError('Lütfen geçerli bir e-posta girin.');
      return;
    }

    if (email.toLowerCase() === MOCK_USER.email) {
      setAuthStep('password');
    } else {
      setAuthStep('register');
    }
  };

  const handlePasswordSubmit = () => {
    if (password === MOCK_USER.password) {
      setAuthError('');
      alert("Başarılı Giriş Yapıldı: " + email);
      handleClose(); // Şimdilik giriş yapıldığında pencereyi kapatıyoruz
    } else {
      setAuthError("Girdiğiniz şifre hatalı."); // Yalnızca şifre yanlışlığında hata uyarısı veriyoruz
    }
  };

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, ""); // Sadece rakamları al
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    if (phoneNumberLength < 9) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 8)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 8)}-${phoneNumber.slice(8, 10)}`;
  };

  const nameRegexObj = /[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g;

  // --- OTP Handlers --- //

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 6) {
      setOtp(val);
      setOtpError('');

      // Auto-Submit Logic
      if (val.length === 6) {
        if (val === '111111') {
          setOtpError('');
          setAuthStep('reset_password'); // Doğruysa şifre sıfırlama ekranına geç
        } else {
          setOtpError('Hatalı doğrulama kodu.');
        }
      }
    }
  };

  const handleResend = () => {
    setTimeLeft(120);
    setOtp('');
    setOtpError('');
  };

  const handleGoToVerify = () => {
    setAuthStep('verify_email');
    setTimeLeft(120);
    setOtp('');
    setOtpError('');
    setAuthError('');
  };

  // Check if passwords matching (for Register and Reset Password)
  const isPasswordsMatch = password === confirmPassword;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="glass-panel w-full sm:w-[420px] p-6 relative flex flex-col gap-6"
          >
            {/* Global Static Buttons */}
            {authStep !== 'email' && (
              <button 
                onClick={() => {
                  if (authStep === 'register') { setAuthStep('email'); setPassword(''); setConfirmPassword(''); setAuthError(''); }
                  else if (authStep === 'password') { setAuthStep('email'); setAuthError(''); setPassword(''); }
                  else if (authStep === 'verify_email') { setAuthStep('password'); setAuthError(''); }
                  else if (authStep === 'reset_password') { setAuthStep('password'); setAuthError(''); }
                }}
                className="absolute top-6 left-6 h-8 flex items-center justify-center gap-1 text-white/50 hover:text-white transition-all transform hover:scale-105 active:scale-95 bg-transparent text-sm font-medium z-10"
              >
                <ChevronLeft size={16} /> Geri
              </button>
            )}

            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all transform hover:scale-110 active:scale-95 bg-transparent z-10"
            >
              <X size={18} />
            </button>
            
            {/* Adım 1: Email */}
            {authStep === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col items-center gap-2 mt-6 mb-4">
                  <span className="text-2xl font-black tracking-widest text-emerald-500 uppercase">IYONTREE</span>
                  <h2 className="text-xl font-bold text-white tracking-wide">Giriş Yap veya Kayıt Ol</h2>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-medium text-white/70">E-posta Adresi</label>
                    <input 
                      type="text" 
                      autoFocus
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setAuthError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                      placeholder="ornek@iyontree.com"
                      className={cn(
                        "w-full bg-white/5 border rounded-xl py-3 px-4 text-white focus:outline-none transition-all font-medium placeholder:text-white/30 shadow-inner",
                        authError && authStep === 'email' ? "border-red-500/50 focus:border-red-500/50 focus:bg-red-500/5" : "border-white/10 focus:border-cyan-400/50 focus:bg-white/10"
                      )} 
                    />
                    <AnimatePresence>
                      {authError && authStep === 'email' && (
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
                    Devam Et
                  </button>
                </div>

                <div className="flex items-center gap-4 my-2 opacity-50">
                  <div className="h-px bg-white/20 flex-1"></div>
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">Veya</span>
                  <div className="h-px bg-white/20 flex-1"></div>
                </div>

                <div className="flex flex-col gap-3">
                  <button className="w-full bg-white/5 hover:bg-white/15 border border-white/10 py-3 rounded-xl font-medium text-white transition-all active:scale-[0.98] shadow-sm">
                    Google ile Devam Et
                  </button>
                  <button className="w-full bg-white/5 hover:bg-white/15 border border-white/10 py-3 rounded-xl font-medium text-white transition-all active:scale-[0.98] shadow-sm">
                    Apple ile Devam Et
                  </button>
                </div>
              </motion.div>
            )}

            {/* Adım 2: Password */}
            {authStep === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col gap-2 mt-8 mb-2">
                  <h2 className="text-2xl font-bold text-white tracking-wide">Tekrar Hoş Geldin</h2>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm text-cyan-400 font-medium break-all">{email}</span>
                    <button onClick={() => { setAuthStep('email'); setAuthError(''); setPassword(''); }} className="text-xs shrink-0 text-white/50 hover:text-white underline decoration-white/30 underline-offset-2 transition-colors">Değiştir</button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-medium text-white/70">Şifre</label>
                    <input 
                      type="password" 
                      autoFocus
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                      placeholder="••••••••"
                      className={cn(
                        "w-full bg-white/5 border rounded-xl py-3 px-4 text-white focus:outline-none transition-all font-medium placeholder:text-white/30 shadow-inner",
                        authError && authStep === 'password' ? "border-red-500/50 focus:border-red-500/50 focus:bg-red-500/5" : "border-white/10 focus:border-cyan-400/50 focus:bg-white/10"
                      )} 
                    />
                    <AnimatePresence>
                      {authError && authStep === 'password' && (
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
                    Giriş Yap
                  </button>
                </div>

                <div className="flex justify-center mt-2">
                  <button onClick={handleGoToVerify} className="text-sm text-white/50 hover:text-white transition-colors">
                    Şifremi Unuttum
                  </button>
                </div>
              </motion.div>
            )}

            {/* Adım 3: Register */}
            {authStep === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col gap-1.5 mt-8 mb-2">
                  <h2 className="text-2xl font-bold text-white tracking-wide">Aramıza Katıl</h2>
                  <p className="text-sm text-white/50 leading-relaxed">
                    <span className="text-cyan-400 font-medium break-all">{email}</span> ile hesap oluştur.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-white/70">Ad</label>
                      <input 
                        type="text" 
                        autoFocus
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value.replace(nameRegexObj, ''))}
                        onKeyDown={(e) => e.key === 'Enter' && lastNameRef.current?.focus()}
                        placeholder="Ad"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/30 shadow-inner" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-white/70">Soyad</label>
                      <input 
                        type="text" 
                        ref={lastNameRef}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value.replace(nameRegexObj, ''))}
                        onKeyDown={(e) => e.key === 'Enter' && phoneRef.current?.focus()}
                        placeholder="Soyad"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/30 shadow-inner" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/70">Telefon Numarası</label>
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
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-white/70">Şifre Belirle</label>
                    <input 
                      type="password" 
                      ref={passwordRef}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && confirmPasswordRef.current?.focus()}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/30 shadow-inner" 
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-white/70">Şifre Tekrar</label>
                    <input 
                      type="password"
                      ref={confirmPasswordRef} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && password && isPasswordsMatch && firstName && phone && phone.length >= 14) {
                           alert("Yeni Kayıt İşlemi: Mock Tarafından Kaydedildi");
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
                       alert("Yeni Kayıt İşlemi: Mock Tarafından Kaydedildi");
                       handleClose();
                    }}
                    disabled={!password || !isPasswordsMatch || !firstName || !phone || phone.length < 14}
                    className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-400 text-black font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] mt-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  >
                    Kayıt Ol ve Doğrula
                  </button>
                </div>
                
              </motion.div>
            )}

            {/* Adım 4: Doğrulama (OTP) */}
            {authStep === 'verify_email' && (
              <motion.div
                key="verify_email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col gap-1.5 mt-8 mb-4 items-center text-center">
                  <h2 className="text-2xl font-bold text-white tracking-wide">Doğrulama Kodu</h2>
                  <p className="text-sm text-white/50 leading-relaxed">
                    <span className="text-cyan-400 font-medium break-all">{email}</span> adresine gönderdiğimiz 6 haneli kodu aşağıya giriniz.
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-col gap-2 items-center">
                    <input 
                      type="text" 
                      autoFocus
                      maxLength={6}
                      value={otp}
                      disabled={timeLeft === 0}
                      onChange={handleOtpChange}
                      placeholder="••••••"
                      className={cn(
                        "w-full max-w-[200px] text-center text-3xl tracking-[0.5em] bg-white/5 border rounded-xl py-3 px-4 text-white focus:outline-none transition-all font-black placeholder:text-white/10 shadow-inner",
                        otpError ? "border-red-500/50 focus:border-red-500/50 focus:bg-red-500/5" : "border-white/10 focus:border-cyan-400/50 focus:bg-white/10 disabled:opacity-50"
                      )} 
                    />
                    {/* Hata Mesajı */}
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

                  {/* Sayaç ve Tekrar Gönder */}
                  <div className="flex justify-center mt-2">
                    {timeLeft > 0 ? (
                      <span className="text-sm font-medium text-white/50 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                        Kalan süre: <span className="text-white">{formatTime(timeLeft)}</span>
                      </span>
                    ) : (
                      <button 
                        onClick={handleResend}
                        className="text-sm text-cyan-400 hover:text-cyan-300 font-medium underline decoration-cyan-400/30 underline-offset-4 transition-all"
                      >
                        Kodu Tekrar Gönder
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Adım 5: Şifre Sıfırlama */}
            {authStep === 'reset_password' && (
              <motion.div
                key="reset_password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col gap-1.5 mt-8 mb-2">
                  <h2 className="text-2xl font-bold text-white tracking-wide">Yeni Şifre</h2>
                  <p className="text-sm text-white/50">
                    Hesabınız için yeni bir şifre belirleyin.
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white/70">Yeni Şifre</label>
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
                    <label className="text-sm font-medium text-white/70">Şifreyi Tekrar Girin</label>
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
                      alert("Yeni Parola Kaydedildi. Oturum Açılıyor...");
                      handleClose();
                    }}
                    disabled={!password || !isPasswordsMatch}
                    className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:hover:bg-cyan-400 text-black font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] mt-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  >
                    Şifreyi Yenile (Mock)
                  </button>
                </div>
              </motion.div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
