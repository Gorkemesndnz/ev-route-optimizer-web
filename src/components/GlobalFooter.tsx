import { translations } from "../lib/translations";

export default function GlobalFooter({ language = 'tr' }: { language?: 'tr' | 'en' }) {
  const t = translations[language];
  return (
    <div className="mt-20 pt-10 border-t border-zinc-200 text-center w-full">
      <p className="text-zinc-400 font-medium tracking-widest uppercase text-[10px] sm:text-xs">
        © 2026 IYONTREE YAZILIM A.Ş. • {language === 'tr' ? "Tüm Hakları Saklıdır" : "All Rights Reserved"}
      </p>
    </div>
  );
}
