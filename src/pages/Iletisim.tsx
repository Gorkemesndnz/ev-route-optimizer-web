import { useEffect, useState } from "react";
import BasePageLayout from "./BasePageLayout";
import { translations } from "../lib/translations";
import { Mail, MapPin, Send, Instagram, Linkedin, Twitter, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Iletisim() {
  const [lang, setLang] = useState<'tr' | 'en'>('tr');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('iyontree_language');
    if (saved === 'en' || saved === 'tr') {
      setLang(saved);
    }
    
    // Check local storage for user profile logic
    const userStr = localStorage.getItem('iyontree_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setName(`${user.firstName} ${user.lastName}`);
        setEmail(user.email);
      } catch (e) {}
    }
  }, []);

  const t = translations[lang];

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validateName = (n: string) => /^[A-Za-zÇŞĞÜÖİçşğüöı\s]+$/.test(n);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    let valid = true;

    if (!currentUser) {
      if (!validateName(name)) {
        setNameError(lang === 'tr' ? 'Lütfen geçerli bir ad soyad girin (sadece harf).' : 'Invalid name (letters only).');
        valid = false;
      } else {
        setNameError('');
      }

      if (!validateEmail(email)) {
        setEmailError(lang === 'tr' ? 'Lütfen geçerli bir e-posta adresi girin.' : 'Invalid email address.');
        valid = false;
      } else {
        setEmailError('');
      }
    }

    if (!subject || subject === 'select' || !message) {
      valid = false;
    }

    if (valid) {
      setIsSubmitted(true);
    }
  };

  const subjectOptions = [
    { value: 'select', label: 'Seçiniz...' },
    { value: 'investment', label: 'Yatırım' },
    { value: 'partnership', label: 'İşbirliği' },
    { value: 'marketing', label: 'Marka, Reklam ve Tanıtım' },
    { value: 'bug', label: 'Sistemsel Bir Sorun' },
    { value: 'other', label: 'Diğer' }
  ];

  return (
    <BasePageLayout 
      title={t.contactUs} 
      subtitle={lang === 'tr' ? "Bize Ulaşın" : "Get in Touch"}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Form Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 p-10 rounded-[40px] bg-white/60 backdrop-blur-2xl border border-white/50 shadow-xl shadow-cyan-900/5 relative overflow-hidden"
        >
          {isSubmitted ? (
             <div className="flex flex-col items-center justify-center text-center h-full gap-4 py-20 px-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 shadow-md">
                 <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Talebiniz Alındı</h3>
                <p className="text-slate-500 font-medium">
                  İletişim talebiniz başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 px-8 h-12 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-bold shadow-sm"
                >
                  Yeni Mesaj Gönder
                </button>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10 text-slate-700">
              <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tight mb-2">
                İletişim Formu
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 relative">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Ad Soyad</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!!currentUser}
                    className={`h-12 w-full bg-white border rounded-2xl px-4 outline-none transition-all placeholder-slate-300 font-medium text-slate-800 ${
                      nameError ? 'border-red-400 focus:border-red-500 bg-red-50' : 
                      currentUser ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 hover:border-cyan-300 focus:border-cyan-500'
                    }`}
                    placeholder="Adınız ve Soyadınız"
                  />
                  {nameError && <span className="absolute -bottom-5 left-1 text-[10px] text-red-500 font-bold">{nameError}</span>}
                </div>
                
                <div className="flex flex-col gap-2 relative">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">E-Posta</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!currentUser}
                    className={`h-12 w-full bg-white border rounded-2xl px-4 outline-none transition-all placeholder-slate-300 font-medium text-slate-800 ${
                      emailError ? 'border-red-400 focus:border-red-500 bg-red-50' : 
                      currentUser ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 hover:border-cyan-300 focus:border-cyan-500'
                    }`}
                    placeholder="ornek@mail.com"
                  />
                  {emailError && <span className="absolute -bottom-5 left-1 text-[10px] text-red-500 font-bold">{emailError}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Konu</label>
                <div className="relative">
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-12 w-full bg-white border border-slate-200 rounded-2xl px-4 outline-none hover:border-cyan-300 focus:border-cyan-500 transition-all font-medium text-slate-800 appearance-none cursor-pointer"
                  >
                    {subjectOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Mesajınız</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-32 bg-white border border-slate-200 rounded-3xl p-4 outline-none hover:border-cyan-300 focus:border-cyan-500 transition-all resize-none font-medium custom-scrollbar text-slate-800 placeholder-slate-300"
                  placeholder="Bize nasıl yardımcı olabileceğinizi detaylıca anlatın..."
                />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-end">
                <button
                  type="submit"
                  disabled={!name || !email || subject === 'select' || !message}
                  className="h-12 px-8 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-full font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 outline-none flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span>{t.send}</span>
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Right Info Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 p-10 rounded-[40px] bg-gradient-to-b from-cyan-600 to-emerald-600 text-white shadow-xl shadow-cyan-900/10 flex flex-col justify-between"
        >
          <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-xl font-bold mb-6 text-cyan-100 tracking-wide uppercase">İletişim Bilgileri</h3>
              <div className="flex flex-col gap-6">
                <a href="mailto:contact@iyontree.com" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-cyan-200 border border-white/10 group-hover:bg-cyan-400 group-hover:text-emerald-900 group-hover:border-transparent transition-all">
                    <Mail size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/50 uppercase">E-Posta</span>
                    <span className="text-lg font-semibold cursor-pointer border-b border-transparent group-hover:border-cyan-200 transition-all">
                      contact@iyontree.com
                    </span>
                  </div>
                </a>

                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-cyan-200 border border-white/10 group-hover:bg-emerald-400 group-hover:text-cyan-900 group-hover:border-transparent transition-all">
                    <MapPin size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/50 uppercase">Merkez Ofis</span>
                    <span className="text-lg font-semibold">
                      Düzce Üniversitesi <br />
                      Teknopark
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 text-cyan-100 tracking-wide uppercase">Bizi Takip Edin</h3>
              <div className="flex items-center gap-4">
                <a href="https://instagram.com/iyontree" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/80 hover:bg-white hover:text-cyan-600 border border-white/10 transition-all group outline-none">
                  <Instagram size={20} className="group-hover:scale-110 transition-transform" />
                </a>
                <a href="https://linkedin.com/company/iyontree" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/80 hover:bg-white hover:text-cyan-600 border border-white/10 transition-all group outline-none">
                  <Linkedin size={20} className="group-hover:scale-110 transition-transform" />
                </a>
                <a href="https://x.com/iyontree" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/80 hover:bg-white hover:text-cyan-600 border border-white/10 transition-all group outline-none">
                  <Twitter size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-12 opacity-30 select-none">
             <Send size={150} className="translate-y-12 translate-x-12" />
          </div>
        </motion.div>
      </div>
    </BasePageLayout>
  );
}
