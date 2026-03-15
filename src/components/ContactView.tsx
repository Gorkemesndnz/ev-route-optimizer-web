import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Mail, Instagram, Linkedin, Github, Twitter, CheckCircle, Send, MapPin, Phone } from "lucide-react";
import { translations } from "../lib/translations";
import { cn } from "@/lib/utils";
import GlobalFooter from "./GlobalFooter";

export default function ContactView({ 
  language, 
  currentUser,
  onBack,
  onNavigate
}: { 
  language: 'tr' | 'en';
  currentUser?: { firstName: string; lastName: string; email: string } | null;
  onBack: () => void;
  onNavigate: (page: any) => void;
}) {
  const t = translations[language];
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Form States
  const [name, setName] = useState(currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [subject, setSubject] = useState('select');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const isFormValid = 
    name.trim() !== '' && 
    email.trim() !== '' && 
    subject !== 'select' && 
    message.trim() !== '' && 
    emailError === '';

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentUser) return;
    const val = e.target.value;
    const regex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/;
    if (regex.test(val)) {
      setName(val);
    }
  };

  const validateEmail = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() !== '' && !regex.test(email)) {
      setEmailError(t.validation.invalidEmail);
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[150] bg-zinc-950 flex flex-col overflow-y-auto custom-scrollbar"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 w-full h-20 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group outline-none"
        >
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 group-hover:border-cyan-400/50 transition-all">
            <ChevronLeft size={24} className="group-hover:text-cyan-400" />
          </div>
          <span className="font-bold tracking-wide">{t.back}</span>
        </button>
        <span className="text-xl font-black tracking-[0.2em] text-cyan-400 uppercase">IYONTREE</span>
        <div className="w-24" /> {/* Spacer */}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center py-20 gap-8"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-emerald-500/30">
                <CheckCircle size={56} />
              </div>
              <div className="max-w-md">
                <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{t.requestReceived}</h2>
                <p className="text-white/50 text-lg leading-relaxed">
                  {language === 'tr' 
                    ? "Mesajınız sistemimize başarıyla iletildi. Uzman ekibimiz talebinizi inceleyip en kısa sürede sizinle iletişime geçecektir." 
                    : "Your message has been successfully delivered. Our expert team will review your request and get back to you shortly."}
                </p>
              </div>
              <button 
                onClick={onBack}
                className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all active:scale-95 shadow-xl"
              >
                {t.goBack}
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="form-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24"
            >
              {/* Left Side: Form */}
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">{t.contactUs}</h1>
                  <p className="text-white/40 text-lg">{language === 'tr' ? "Geleceğin menzil çözümleri için bize mesaj gönderin." : "Message us for future range solutions."}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-white/30 uppercase tracking-widest px-1">{t.fullname}</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={handleNameChange}
                      readOnly={!!currentUser}
                      placeholder={t.fullname}
                      className={cn(
                        "w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all",
                        currentUser && "opacity-60 cursor-not-allowed bg-black/20"
                      )} 
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-white/30 uppercase tracking-widest px-1">{t.email}</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => !currentUser && setEmail(e.target.value)}
                      onBlur={validateEmail}
                      readOnly={!!currentUser}
                      placeholder={t.email}
                      className={cn(
                        "w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none transition-all",
                        emailError ? "border-red-500/50 focus:border-red-500" : "focus:border-cyan-400/50",
                        currentUser && "opacity-60 cursor-not-allowed bg-black/20"
                      )} 
                    />
                    {emailError && <p className="text-red-400 text-xs px-1 font-medium">{emailError}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-white/30 uppercase tracking-widest px-1">{t.subject}</label>
                    <div className="relative">
                      <select 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-cyan-400/50 appearance-none cursor-pointer outline-none transition-all"
                      >
                        <option value="select" disabled>{t.contactSubjects.select}</option>
                        <option value="investment">{t.contactSubjects.investment}</option>
                        <option value="partnership">{t.contactSubjects.partnership}</option>
                        <option value="branding">{t.contactSubjects.branding}</option>
                        <option value="systemic">{t.contactSubjects.systemic}</option>
                        <option value="other">{t.contactSubjects.other}</option>
                      </select>
                      <ChevronLeft size={20} className="absolute right-6 top-1/2 -translate-y-1/2 -rotate-90 text-white/30 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-white/30 uppercase tracking-widest px-1">{t.message}</label>
                    <textarea 
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.messagePlaceholder}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all resize-none outline-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={!isFormValid}
                    className={cn(
                      "w-full py-5 font-black text-lg rounded-2xl transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3 shadow-2xl uppercase tracking-widest",
                      isFormValid ? "bg-cyan-400 hover:bg-cyan-300 text-zinc-950 shadow-cyan-500/20" : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                    )}
                  >
                    <Send size={20} />
                    {t.send}
                  </button>
                </form>
              </div>

              {/* Right Side: Info */}
              <div className="flex flex-col gap-12 lg:pt-24 font-bold">
                <div className="flex flex-col gap-6">
                  <h3 className="text-white/30 uppercase tracking-[0.2em] text-xs px-1">{language === 'tr' ? "İletişim Kanalları" : "Contact Channels"}</h3>
                  
                  <div className="flex flex-col gap-4">
                    <a href="mailto:contact@iyontree.com" className="group flex items-center gap-5 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all outline-none">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-zinc-950 transition-all">
                        <Mail size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white/40 text-xs uppercase tracking-tighter">{language === 'tr' ? "E-posta Adresi" : "Email Address"}</span>
                        <span className="text-white text-lg">contact@iyontree.com</span>
                      </div>
                    </a>

                    <div className="group flex items-center gap-5 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all outline-none">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 transition-all">
                        <MapPin size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white/40 text-xs uppercase tracking-tighter">{language === 'tr' ? "Merkez Yerleşke" : "HQ Location"}</span>
                        <span className="text-white text-lg">Düzce University • Teknopark</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <h3 className="text-white/30 uppercase tracking-[0.2em] text-xs px-1">{language === 'tr' ? "Bizi Takip Edin" : "Follow Us"}</h3>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { icon: <Instagram />, label: "Instagram", href: "https://instagram.com/iyontree" },
                      { icon: <Linkedin />, label: "LinkedIn", href: "https://linkedin.com/company/iyontree" },
                      { icon: <Twitter />, label: "X", href: "https://x.com/iyontree" },
                      { icon: <Github />, label: "GitHub", href: "https://github.com/iyontree" }
                    ].map((social, idx) => (
                      <a 
                        key={idx}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-white/10 text-white/60 hover:text-white transition-all outline-none"
                      >
                        {social.icon}
                        <span className="text-sm">{social.label}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Academic Context Card */}
                <div className="p-8 rounded-[40px] bg-gradient-to-br from-cyan-400/10 to-transparent border border-cyan-400/20 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 blur-[60px] group-hover:bg-cyan-400/10 transition-colors" />
                  <p className="text-cyan-400 text-sm italic leading-relaxed relative z-10">
                    {language === 'tr' 
                      ? "BU BİR DÜZCE ÜNİVERSİTESİ BİLGİSAYAR MÜHENDİSLİĞİ BİTİRME TEZİ PROJESİDİR." 
                      : "THIS IS A DÜZCE UNIVERSITY COMPUTER ENGINEERING GRADUATION PROJECT."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <GlobalFooter language={language} onNavigate={onNavigate} />
    </motion.div>
  );
}
