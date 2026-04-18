import { Instagram, Linkedin, Github, Twitter } from "lucide-react";
import { translations } from "../../lib/translations";

export default function GlobalFooter({ 
  language, 
  onNavigate 
}: { 
  language: 'tr' | 'en'; 
  onNavigate: (page: 'contact' | 'about' | 'terms' | 'privacy') => void;
}) {
  const t = translations[language];

  const socialLinks = [
    { icon: <Instagram size={20} />, href: "https://instagram.com/iyontree", label: "Instagram" },
    { icon: <Linkedin size={20} />, href: "https://linkedin.com/company/iyontree", label: "LinkedIn" },
    { icon: <Twitter size={20} />, href: "https://x.com/iyontree", label: "X" },
    { icon: <Github size={20} />, href: "https://github.com/iyontree", label: "GitHub" },
  ];

  const footerLinks = [
    { id: 'about', label: t.aboutUs },
    { id: 'contact', label: t.contactUs },
    { id: 'terms', label: t.terms },
    { id: 'privacy', label: t.privacy },
  ] as const;

  return (
    <footer className="w-full py-12 px-6 mt-auto border-t border-white/5 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
        {/* Branding & Socials */}
        <div className="flex flex-col items-center gap-6">
          <span className="text-2xl font-black tracking-[0.2em] text-cyan-400 uppercase">IYONTREE</span>
          <div className="flex items-center gap-5">
            {socialLinks.map((social, idx) => (
              <a 
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all outline-none"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {footerLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className="text-sm font-medium text-white/40 hover:text-white transition-colors outline-none cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Copyright */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[11px] font-bold tracking-widest text-white/20 uppercase">
            © 2026 IYONTREE. {language === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
          </p>
          <p className="text-[9px] text-white/10 uppercase tracking-tighter">
            Developed by Görkem Esendeniz • Düzce University
          </p>
        </div>
      </div>
    </footer>
  );
}
