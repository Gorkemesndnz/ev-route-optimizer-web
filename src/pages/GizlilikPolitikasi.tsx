import { useEffect, useState } from "react";
import BasePageLayout from "./BasePageLayout";
import { translations } from "../lib/translations";
import { Shield, Eye, Database, Share2, Lock, Scale } from "lucide-react";
import { motion } from "framer-motion";

export default function GizlilikPolitikasi() {
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
      title={t.privacyTitle || (lang === 'tr' ? "İYONTREE Gizlilik Politikası" : "IYONTREE Privacy Policy")} 
      subtitle={lang === 'tr' ? "Güvenlik ve Veri" : "Security and Data"}
    >
      <div className="flex flex-col gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 md:p-14 rounded-[40px] bg-white/60 backdrop-blur-2xl border border-white/50 shadow-xl shadow-cyan-900/5 text-slate-800"
        >
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-cyan-100/50 flex items-center justify-center text-cyan-600 border border-cyan-200">
              <Shield size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {lang === 'tr' ? "KVKK (6698 Sayılı Kanun) Metni" : "Privacy & Data Protection Notice"}
              </h2>
              <p className="font-semibold text-slate-500 uppercase tracking-widest text-xs mt-1">
                {lang === 'tr' ? "Veri Koruma ve Şeffaflık" : "Data Protection and Transparency"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors shrink-0">
                <Shield size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">1. Veri Sorumlusu ve Amacımız</h3>
                <p className="text-slate-600 leading-relaxed font-medium">IYONTREE platformu olarak, elektrikli araç (EV) ekosistemini daha verimli hale getirmeyi hedefliyoruz. Bu metin, 6698 sayılı (KVKK) uyarınca, kişisel verilerinizin nasıl toplandığı hakkında sizi şeffaf bir şekilde bilgilendirmek amacıyla hazırlanmıştır.</p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shrink-0">
                <Database size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">2. Hangi Verileri Topluyoruz?</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Size hizmet sunabilmek için: Kimlik ve İletişim Verileri (Ad, Soyad, E-posta), Konum ve Rota Verileri, Araç ve Telemetri Verileri (Seçtiğiniz araç markası, modeli, SoC değeri), Cihaz ve Analitik Verileri (Tarayıcı, IP, Navigasyon istatistikleri) işlemekteyiz.</p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                <Eye size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">3. Verilerinizi Neden Kullanıyoruz? (İşleme Amaçları)</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Topladığımız veriler, hizmet kalitemizi artırmak ve tamamen size özel bir deneyim sunmak için şu amaçlarla kullanılır: Araç fiziğine ve hava durumuna dayalı en hassas tüketim ve şarj planlamasını gerçekleştirmek, hataları çözmek, yasal süreci işletmek.</p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 group-hover:bg-emerald-100 transition-colors shrink-0">
                <Share2 size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">4. Veri Paylaşımı, İşbirlikleri ve Algoritma Eğitimi (Kritik)</h3>
                <p className="text-slate-600 leading-relaxed font-medium">IYONTREE, kimlik bilgilerinizi reklam amacıyla asla 3. şahıslara satmaz! Ancak, sürdürülebilir e-mobilite ekosistemini geliştirmek ve <strong>Makine Öğrenmesi (ML) / Algoritma Eğitimini</strong> desteklemek amacıyla, <strong>tamamen anonimleştirilmiş (kimliksizleştirilmiş) rota alışkanlıkları, araç enerji tüketim eğrileri ve şarj beklemeleri</strong> Şarj Ağı Operatörleri (CPO), üniversiteler ve iş ortaklarıyla analitik süreçler için paylaşılabilir. (<i>Anonim veriler "kişisel veri" sayılmaz.</i>)</p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors shrink-0">
                <Lock size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">5. Veri Güvenliği ve Saklama Süresi</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Verileriniz, endüstri standardı yöntemlerle şifrelenir. Hesabınızı sildiğinizde, aktif verileriniz kalıcı olarak silinir. (Ancak yasal zorunluluk gereği 5651 log kayıtları vs. kanuni süre zarfında güvenle muhafaza edilir.)</p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors shrink-0">
                <Scale size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800">6. KVKK Kapsamındaki Haklarınız</h3>
                <p className="text-slate-600 leading-relaxed font-medium">KVKK'nın 11. Maddesi uyarınca; işleme amacını öğrenme, eksiklik düzeltme ve <strong>silme (Unutulma Hakkı)</strong> talep hakkına sahipsiniz. Tüm talepler için <strong>contact@iyontree.com</strong> üzerinden iletişime geçebilirsiniz.</p>
              </div>
            </div>
          </div>
          
          {/* Privacy Note Bottom */}
          <div className="mt-12 p-6 rounded-3xl border border-green-200 bg-green-50/50 flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <Lock size={20} />
            </div>
            <p className="text-sm text-green-800 flex-1 leading-relaxed font-semibold">
              Platformumuzu kullandığınızda ve rota oluşturduğunuzda, en iyi deneyim için Anonim Tüketim Motorumuzun veri işleme yönergelerini kabul etmiş olursunuz. Açık Rıza ve gizlilik kurallarına <strong>%100 uyumluyuz.</strong>
            </p>
          </div>

        </motion.div>
      </div>
    </BasePageLayout>
  );
}
