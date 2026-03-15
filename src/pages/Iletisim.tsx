import { useEffect, useState } from "react";
import BasePageLayout, { useMarketing } from "./BasePageLayout";
import { translations } from "../lib/translations";
import { Mail, MapPin, Send, Instagram, Linkedin, Twitter, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { contactSchema } from "../lib/validation";
import { z } from "zod";

export default function Iletisim() {
  const { language: lang } = useMarketing();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subjectError, setSubjectError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
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

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    // Reset errors
    setNameError('');
    setEmailError('');
    setSubjectError('');
    setMessageError('');

    const formData = {
      name,
      email,
      subject,
      message
    };

    try {
      contactSchema.parse(formData);
      // Valid data
      setIsSubmitted(true);
      console.log("Form validated successfully", formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.issues.forEach((issue) => {
          const path = issue.path[0];
          if (path === 'name') setNameError(issue.message);
          if (path === 'email') setEmailError(issue.message);
          if (path === 'subject') setSubjectError(issue.message);
          if (path === 'message') setMessageError(issue.message);
        });
      }
    }
  };

  const subjectOptions = lang === 'tr' ? [
    { value: 'select', label: 'Seçiniz...' },
    { value: 'investment', label: 'Yatırım' },
    { value: 'partnership', label: 'İşbirliği' },
    { value: 'marketing', label: 'Marka, Reklam ve Tanıtım' },
    { value: 'bug', label: 'Sistemsel Bir Sorun' },
    { value: 'other', label: 'Diğer' }
  ] : [
    { value: 'select', label: 'Select...' },
    { value: 'investment', label: 'Investment' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'marketing', label: 'Marketing & PR' },
    { value: 'bug', label: 'System Bug' },
    { value: 'other', label: 'Other' }
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
          className="lg:col-span-3 p-10 rounded-[40px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 shadow-xl shadow-cyan-900/5 relative overflow-hidden transition-colors"
        >
          {isSubmitted ? (
             <div className="flex flex-col items-center justify-center text-center h-full gap-4 py-20 px-6">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-md transition-colors">
                 <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
                  {lang === 'tr' ? 'Talebiniz Alındı' : 'Request Received'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
                  {lang === 'tr' ? 'İletişim talebiniz başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.' : 'Your request has been sent successfully. We will contact you soon.'}
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 px-8 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold shadow-sm outline-none"
                >
                  {lang === 'tr' ? 'Yeni Mesaj Gönder' : 'Send Another Message'}
                </button>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10 text-slate-700 dark:text-slate-300 transition-colors">
              <h2 className="text-2xl font-black uppercase text-slate-900 dark:text-slate-100 tracking-tight mb-2 transition-colors">
                {lang === 'tr' ? 'İletişim Formu' : 'Contact Form'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 relative">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 transition-colors">
                    {lang === 'tr' ? 'Ad Soyad' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!!currentUser}
                    className={`h-12 w-full bg-white dark:bg-slate-800 border rounded-2xl px-4 outline-none transition-all placeholder-slate-300 dark:placeholder-slate-500 font-medium text-slate-800 dark:text-slate-200 ${
                      nameError ? 'border-red-400 dark:border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' : 
                      currentUser ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60' : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-500 focus:border-cyan-500 dark:focus:border-cyan-500'
                    }`}
                    placeholder={lang === 'tr' ? "Adınız ve Soyadınız" : "Your Name"}
                  />
                  {nameError && <span className="absolute -bottom-5 left-1 text-[10px] text-red-500 font-bold">{nameError}</span>}
                </div>
                
                <div className="flex flex-col gap-2 relative">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 transition-colors">
                    {lang === 'tr' ? 'E-Posta' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!currentUser}
                    className={`h-12 w-full bg-white dark:bg-slate-800 border rounded-2xl px-4 outline-none transition-all placeholder-slate-300 dark:placeholder-slate-500 font-medium text-slate-800 dark:text-slate-200 ${
                      emailError ? 'border-red-400 dark:border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' : 
                      currentUser ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60' : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-500 focus:border-cyan-500 dark:focus:border-cyan-500'
                    }`}
                    placeholder="ornek@mail.com"
                  />
                  {emailError && <span className="absolute -bottom-5 left-1 text-[10px] text-red-500 font-bold">{emailError}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2 relative">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 transition-colors">{lang === 'tr' ? 'Konu' : 'Subject'}</label>
                <div className="relative">
                  <select 
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setSubjectError(''); }}
                    className={`h-12 w-full bg-white dark:bg-slate-800 border rounded-2xl px-4 outline-none transition-all font-medium text-slate-800 dark:text-slate-200 appearance-none cursor-pointer ${
                      subjectError ? 'border-red-400 dark:border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-500 focus:border-cyan-500'
                    }`}
                  >
                    {subjectOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {subjectError && <span className="absolute -bottom-5 left-1 text-[10px] text-red-500 font-bold">{subjectError}</span>}
              </div>

              <div className="flex flex-col gap-2 relative">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 transition-colors">{lang === 'tr' ? 'Mesajınız' : 'Your Message'}</label>
                <textarea
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setMessageError(''); }}
                  className={`w-full h-32 bg-white dark:bg-slate-800 border rounded-3xl p-4 outline-none transition-all resize-none font-medium custom-scrollbar text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-500 ${
                    messageError ? 'border-red-400 dark:border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-500 focus:border-cyan-500'
                  }`}
                  placeholder={lang === 'tr' ? "Bize nasıl yardımcı olabileceğinizi detaylıca anlatın..." : "Tell us in detail how we can help..."}
                />
                {messageError && <span className="absolute -bottom-5 left-1 text-[10px] text-red-500 font-bold">{messageError}</span>}
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
          className="lg:col-span-2 p-10 rounded-[40px] bg-gradient-to-b from-cyan-600 to-emerald-600 dark:from-cyan-800 dark:to-emerald-800 text-white shadow-xl shadow-cyan-900/10 flex flex-col justify-between transition-colors"
        >
          <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-xl font-bold mb-6 text-cyan-100 tracking-wide uppercase">{lang === 'tr' ? 'İletişim Bilgileri' : 'Contact Info'}</h3>
              <div className="flex flex-col gap-6">
                <a href="mailto:contact@iyontree.com" className="flex items-center gap-4 group outline-none">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-cyan-200 border border-white/10 group-hover:bg-cyan-400 group-hover:text-emerald-900 dark:group-hover:text-emerald-950 group-hover:border-transparent transition-all">
                    <Mail size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/50 uppercase">{lang === 'tr' ? 'E-Posta' : 'Email'}</span>
                    <span className="text-lg font-semibold border-b border-transparent group-hover:border-cyan-200 transition-all">
                      contact@iyontree.com
                    </span>
                  </div>
                </a>

                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-cyan-200 border border-white/10 group-hover:bg-emerald-400 group-hover:text-cyan-900 dark:group-hover:text-cyan-950 group-hover:border-transparent transition-all">
                    <MapPin size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white/50 uppercase">{lang === 'tr' ? 'Merkez Ofis' : 'Head Office'}</span>
                    <span className="text-lg font-semibold">
                      Düzce Üniversitesi <br />
                      Teknopark
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 text-cyan-100 tracking-wide uppercase">{lang === 'tr' ? 'Bizi Takip Edin' : 'Follow Us'}</h3>
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
