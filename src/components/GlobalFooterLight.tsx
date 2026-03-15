import { Instagram, Linkedin, Github, Twitter } from "lucide-react";

export default function GlobalFooterLight({ 
  language = 'tr' 
}: { 
  language?: 'tr' | 'en'; 
}) {
  const socialLinks = [
    { icon: <Instagram size={20} />, href: "https://instagram.com/iyontree", label: "Instagram" },
    { icon: <Linkedin size={20} />, href: "https://linkedin.com/company/iyontree", label: "LinkedIn" },
    { icon: <Twitter size={20} />, href: "https://x.com/iyontree", label: "X" },
    { icon: <Github size={20} />, href: "https://github.com/iyontree", label: "GitHub" },
  ];

  const footerLinks = [
    { href: '/hakkimizda', label: language === 'tr' ? 'Hakkımızda' : 'About Us' },
    { href: '/iletisim', label: language === 'tr' ? 'Bize Ulaşın' : 'Contact Us' },
    { href: '/kullanim-kosullari', label: language === 'tr' ? 'Kullanım Koşulları' : 'Terms of Use' },
    { href: '/gizlilik', label: language === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy' },
  ] as const;

  return (
    <footer className="w-full py-12 px-6 mt-auto border-t border-slate-200 bg-white/40 backdrop-blur-2xl relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
        {/* Branding & Socials */}
        <div className="flex flex-col items-center gap-6">
          <span className="text-2xl font-black tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-emerald-500 uppercase">
            IYONTREE
          </span>
          <div className="flex items-center gap-5">
            {socialLinks.map((social, idx) => (
              <a 
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-cyan-600 hover:border-cyan-300 hover:bg-cyan-50 transition-all shadow-sm outline-none"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {footerLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="text-sm font-semibold text-slate-500 hover:text-cyan-700 transition-colors outline-none cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Copyright */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            © 2026 IYONTREE. {language === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
          </p>
          <p className="text-[9px] text-slate-300 uppercase tracking-tighter">
            Developed by Görkem Esendeniz • Düzce University
          </p>
        </div>
      </div>
    </footer>
  );
}
