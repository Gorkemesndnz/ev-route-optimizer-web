import { useEffect, useState } from "react";
import BasePageLayout, { useMarketing } from "./BasePageLayout";
import { translations } from "../lib/translations";
import { Shield, Eye, Database, Share2, Lock, Scale } from "lucide-react";
import { motion } from "framer-motion";

export default function GizlilikPolitikasi() {
  const { language: lang } = useMarketing();

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
          className="p-10 md:p-14 rounded-[40px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 shadow-xl shadow-cyan-900/5 text-slate-800 dark:text-slate-100 transition-colors"
        >
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-cyan-100/50 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 transition-colors">
              <Shield size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase transition-colors">
                {lang === 'tr' ? "KVKK (6698 Sayılı Kanun) Metni" : "Privacy & Data Protection Notice"}
              </h2>
              <p className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs mt-1 transition-colors">
                {lang === 'tr' ? "Veri Koruma ve Şeffaflık" : "Data Protection and Transparency"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/60 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0">
                <Shield size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '1. Veri Sorumlusu ve Amacımız' : '1. Data Controller and Purpose'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'IYONTREE platformu olarak, elektrikli araç (EV) ekosistemini daha verimli hale getirmeyi hedefliyoruz. Bu metin, 6698 sayılı (KVKK) uyarınca, kişisel verilerinizin nasıl toplandığı hakkında sizi şeffaf bir şekilde bilgilendirmek amacıyla hazırlanmıştır.' : 'As the IYONTREE platform, we aim to make the electric vehicle (EV) ecosystem more efficient. This text has been prepared to inform you transparently about how your personal data is collected in accordance with privacy laws and regulations.'}
                </p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0">
                <Database size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '2. Hangi Verileri Topluyoruz?' : '2. What Data Do We Collect?'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'Size hizmet sunabilmek için: Kimlik ve İletişim Verileri (Ad, Soyad, E-posta), Konum ve Rota Verileri, Araç ve Telemetri Verileri (Seçtiğiniz araç markası, modeli, SoC değeri), Cihaz ve Analitik Verileri işlemekteyiz.' : 'To provide you with services: We process Identity and Contact Data (Name, Surname, Email), Location and Route Data, Vehicle and Telemetry Data (Selected vehicle brand, model, SoC value), Device and Analytics Data.'}
                </p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0">
                <Eye size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '3. Verilerinizi Neden Kullanıyoruz?' : '3. Why Do We Use Your Data?'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'Topladığımız veriler, hizmet kalitemizi artırmak ve tamamen size özel bir deneyim sunmak için şu amaçlarla kullanılır: Araç fiziğine ve hava durumuna dayalı en hassas tüketim ve şarj planlamasını gerçekleştirmek, hataları çözmek.' : 'The data we collect is used to increase our service quality and provide a completely customized experience: to perform the most precise consumption and charge planning based on vehicle physics and weather, and to resolve system errors.'}
                </p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors shrink-0">
                <Share2 size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '4. Veri Paylaşımı ve Algoritma Eğitimi' : '4. Data Sharing and Algorithm Training'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'IYONTREE, kimlik bilgilerinizi reklam amacıyla asla satmaz! Ancak Makine Öğrenmesi (ML) / Algoritma Eğitimini desteklemek amacıyla, tamamen anonimleştirilmiş rota alışkanlıkları ve şarj beklemeleri CPO\'lar ve iş ortaklarıyla analitik süreçler için paylaşılabilir.' : 'IYONTREE never sells your identity information for advertising! However, to support Machine Learning (ML) / Algorithm Training, completely anonymized route habits and charging waits may be shared with CPOs and partners for analytical processes.'}
                </p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/60 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0">
                <Lock size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '5. Veri Güvenliği ve Saklama Süresi' : '5. Data Security and Retention Period'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'Verileriniz şifrelenir. Hesabınızı sildiğinizde, aktif verileriniz kalıcı olarak silinir (Yasal zorunluluklar gereği tutulması gereken loglar hariç).' : 'Your data is encrypted. When you delete your account, your active data is permanently deleted (except for logs required to be kept by legal obligations).'}
                </p>
              </div>
            </div>

            <div className="flex gap-6 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/60 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0">
                <Scale size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">{lang === 'tr' ? '6. Haklarınız' : '6. Your Rights'}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {lang === 'tr' ? 'İşleme amacını öğrenme, eksiklik düzeltme ve silme (Unutulma Hakkı) talep hakkına sahipsiniz. contact@iyontree.com üzerinden iletişime geçebilirsiniz.' : 'You have the right to request the purpose of processing, correction of deficiencies and deletion (Right to be Forgotten). You can contact us via contact@iyontree.com.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Privacy Note Bottom */}
          <div className="mt-12 p-6 rounded-3xl border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10 flex flex-col md:flex-row items-center gap-6 transition-colors">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-500 shrink-0 transition-colors">
              <Lock size={20} />
            </div>
            <p className="text-sm text-green-800 dark:text-green-400 flex-1 leading-relaxed font-semibold transition-colors">
              {lang === 'tr' ? 'Platformumuzu kullandığınızda ve rota oluşturduğunuzda, en iyi deneyim için Anonim Tüketim Motorumuzun veri işleme yönergelerini kabul etmiş olursunuz. Açık Rıza ve gizlilik kurallarına 100% uyumluyuz.' : 'By using our platform and creating a route, you accept the data processing guidelines of our Anonymous Consumption Engine for the best experience. We are 100% compliant with privacy rules.'}
            </p>
          </div>

        </motion.div>
      </div>
    </BasePageLayout>
  );
}
