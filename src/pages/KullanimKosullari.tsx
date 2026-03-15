import { useEffect, useState } from "react";
import BasePageLayout from "./BasePageLayout";
import { translations } from "../lib/translations";
import { Scale, FileText, AlertTriangle, Zap, ShieldCheck, Copyright, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function KullanimKosullari() {
  const [lang, setLang] = useState<'tr' | 'en'>('tr');

  useEffect(() => {
    const saved = localStorage.getItem('iyontree_language');
    if (saved === 'en' || saved === 'tr') {
      setLang(saved);
    }
  }, []);

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
          className="p-10 md:p-14 rounded-[40px] bg-white/60 backdrop-blur-2xl border border-white/50 shadow-xl shadow-cyan-900/5 text-slate-800"
        >
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-cyan-100/50 flex items-center justify-center text-cyan-600 border border-cyan-200">
              <Scale size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {lang === 'tr' ? "Kullanım Koşulları" : "Terms of Use"}
              </h2>
              <p className="font-semibold text-slate-500 uppercase tracking-widest text-xs mt-1">
                {lang === 'tr' ? "Son Güncelleme: 15 Mart 2026" : "Last Updated: March 15, 2026"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {/* Section 1 */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors shrink-0">
                <FileText size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">1. Kapsam ve Kabul</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Bu Kullanım Koşulları, IYONTREE platformunun kullanımına ilişkin yasal şartları belirler. Ekosisteme erişerek bu koşulları bütünüyle okuduğunuzu, anladığınızı ve bağlandığınızı kabul etmiş sayılırsınız.</p>
              </div>
            </div>

            {/* Section 2 - Disclaimer */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">2. Hizmetin Doğası ve Sorumluluk Reddi (Kritik Uyarı)</h3>
                <p className="text-slate-600 leading-relaxed font-medium">IYONTREE, elektrikli araçlar için yapay zeka ve fizik tabanlı tüketim algoritmaları kullanan bir destek asistanıdır. Algoritmalarımız hesaplamalar yapsa da tüm veriler <strong>tahminidir</strong>. Anlık trafik değişimleri, beklenmedik hava koşulları, agresif sürüş tarzı ve donanımsal yaşlanma nedeniyle hesaplamalarda sapmalar yaşanabilir. Yolda kalma (şarj bitmesi), gecikme veya doğabilecek hatalardan/maddi hasarlardan IYONTREE hiçbir yasal sorumluluk kabul etmez.</p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shrink-0">
                <Zap size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">3. Üçüncü Taraf Verileri</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Uygulama harita ve API verileri sağlayıcıları ile şarj istasyonu konumlarını üçüncü parti ortaklardan alır. Bu istasyonların anlık aktif olup olmadığı, arızalı olma veya kW değerinin düşüklüğü ilgili CPO (Charge Point Operator) kurumlarının sorumluluğundadır.</p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">4. Kullanıcı Yükümlülükleri ve Sürüş Güvenliği</h3>
                <p className="text-slate-600 leading-relaxed font-medium">IYONTREE'yi kullanırken yerel trafik kurallarına ve hız sınırlarına uymak tamamen kullanıcının mesuliyetindedir. Güvenli sürüş her zaman optimizasyondan önce gelir.</p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                <Copyright size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">5. Fikri Mülkiyet Hakları</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Uygulama içerisindeki özgün fizik tüketim algoritması, akıllı rota planlama mantığı (machine learning entegrasyonları dahil), arayüz kodları ve veritabanı mimarisi IYONTREE'ye (Görkem Esendeniz'e) aittir. İzinsiz tersine mühendislik yapılamaz (Reverse Engineering), kaynak kodlar ticari amaçla kullanılamaz.</p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shrink-0">
                <Cpu size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">6. Servis Kesintileri ve Beta Süreci</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Platformumuz aktif olarak geliştirme (Beta/Erken Erişim) aşamasındadır. Sunucu güncellemeleri veya optimizasyon testleri sırasında geçici servis kesintileri yaşanabilir.</p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors shrink-0">
                <Scale size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">7. Uyuşmazlıkların Çözümü</h3>
                <p className="text-slate-600 leading-relaxed font-medium">İşbu Kullanım Koşulları Türkiye Cumhuriyeti yasalarına tabidir. Herhangi bir hukuki uyuşmazlık durumunda Düzce ve İstanbul Mahkemeleri ile İcra Daireleri yetkilidir.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </BasePageLayout>
  );
}
