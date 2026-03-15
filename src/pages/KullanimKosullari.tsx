import { useEffect, useState } from "react";
import BasePageLayout, { useMarketing } from "./BasePageLayout";
import { translations } from "../lib/translations";
import { Scale, FileText, AlertTriangle, Zap, ShieldCheck, Copyright, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function KullanimKosullari() {
  const { language: lang } = useMarketing();

  const t = translations[lang];

  return (
    <BasePageLayout 
      title={lang === 'tr' ? "Yasal Şartlar ve Yükümlülükler" : "Legal Terms and Obligations"} 
      subtitle={t.terms}
    >
      <div className="flex flex-col gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 md:p-14 rounded-[40px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 shadow-xl shadow-cyan-900/5 text-slate-800 dark:text-slate-100 transition-colors"
        >
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-cyan-100/50 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 transition-colors">
              <Scale size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase transition-colors">
                {lang === 'tr' ? "Kullanım Koşulları" : "Terms of Use"}
              </h2>
              <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs mt-1 transition-colors">
                {lang === 'tr' ? "Son Güncelleme: 15 Mart 2026" : "Last Updated: March 15, 2026"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {/* Section 1 */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/60 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0">
                <FileText size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '1. Kapsam ve Kabul' : '1. Scope and Acceptance'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'Bu Kullanım Koşulları, IYONTREE platformunun kullanımına ilişkin yasal şartları belirler. Ekosisteme erişerek bu koşulları bütünüyle okuduğunuzu, anladığınızı ve bağlandığınızı kabul etmiş sayılırsınız.' : 'These Terms of Use determine the legal conditions regarding the use of the IYONTREE platform. By accessing the ecosystem, you are deemed to have read, understood and bound yourself entirely by these terms.'}
                </p>
              </div>
            </div>

            {/* Section 2 - Disclaimer */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-red-500 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '2. Hizmetin Doğası ve Sorumluluk Reddi (Kritik Uyarı)' : '2. Nature of Service and Disclaimer (Critical Warning)'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'IYONTREE, elektrikli araçlar için yapay zeka ve fizik tabanlı tüketim algoritmaları kullanan bir destek asistanıdır. Tüm veriler tahminidir. Anlık trafik değişimleri, araç problemleri veya doğabilecek hatalardan/maddi hasarlardan IYONTREE hiçbir yasal sorumluluk kabul etmez.' : 'IYONTREE is an assistant using AI and physics-based consumption algorithms for EVs. All data is estimated. IYONTREE accepts no legal liability for deviations caused by traffic, vehicle failures, or resulting material damages.'}
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0">
                <Zap size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '3. Üçüncü Taraf Verileri' : '3. Third-Party Data'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'Uygulama harita ve API verileri sağlayıcıları ile şarj istasyonu konumlarını üçüncü parti ortaklardan alır. Bu istasyonların anlık aktif olup olmadığı ilgili operatörlerin (CPO) sorumluluğundadır.' : 'The app receives map and API data providers and charging station locations from 3rd-party partners. Real-time active status of these stations is the responsibility of CPOs.'}
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/60 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '4. Kullanıcı Yükümlülükleri ve Sürüş Güvenliği' : '4. User Obligations and Driving Safety'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'IYONTREE\'yi kullanırken yerel trafik kurallarına ve hız sınırlarına uymak tamamen kullanıcının mesuliyetindedir. Güvenli sürüş her zaman optimizasyondan önce gelir.' : 'It is entirely the user\'s responsibility to obey local traffic rules and speed limits while using IYONTREE. Safe driving always comes before optimization.'}
                </p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0">
                <Copyright size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '5. Fikri Mülkiyet Hakları' : '5. Intellectual Property Rights'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'Fizik tüketim algoritması, arayüz kodları ve veritabanı mimarisi IYONTREE\'ye aittir. İzinsiz tersine mühendislik (Reverse Engineering) yapılamaz.' : 'Physical consumption algorithm, interface codes and database architecture belong to IYONTREE. Unauthorized reverse engineering cannot be done.'}
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0">
                <Cpu size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '6. Servis Kesintileri ve Beta Süreci' : '6. Service Interruptions and Beta Process'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'Platformumuz aktif olarak geliştirme aşamasındadır. Sunucu güncellemeleri veya optimizasyon testleri sırasında geçici servis kesintileri yaşanabilir.' : 'Our platform is under active development. Temporary service interruptions may occur during server updates or optimization tests.'}
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/60 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0">
                <Scale size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '7. Uyuşmazlıkların Çözümü' : '7. Dispute Resolution'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'İşbu Kullanım Koşulları Türkiye Cumhuriyeti yasalarına tabidir. Herhangi bir hukuki uyuşmazlık durumunda Düzce ve İstanbul Mahkemeleri yetkilidir.' : 'These Terms of Use are subject to the laws of the Republic of Turkey. In case of legal disputes, Düzce and Istanbul Courts are authorized.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </BasePageLayout>
  );
}
