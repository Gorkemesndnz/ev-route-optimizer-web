import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicyView({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[120] bg-zinc-50 overflow-y-auto pointer-events-auto text-zinc-900 custom-scrollbar"
    >
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20 flex flex-col">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-10 font-medium transition-colors outline-none self-start"
        >
          <ChevronLeft size={20} />
          Geri Dön
        </button>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-10 text-zinc-900">İYONTREE Gizlilik Bildirimi</h1>
        <div className="flex flex-col gap-8 text-base leading-relaxed text-zinc-700">
          <p className="text-lg">
            İYONTREE ("biz", "bizim", "bize"), kullanıcıların elektrikli araç rota planlamasını kolaylaştırmak amacıyla kişisel verilerin korunmasına ve gizliliğine büyük önem vermektedir.
          </p>
          
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-zinc-900">1. Toplanan Veriler</h2>
            <p>Uygulamamızı kullanırken konum verileri, araç şarj tercihleri ve batarya kapasite bilgileri toplanabilir. Bu veriler yalnızca etkili bir rota planlaması yapmak için kullanılır. Hesap oluşturan kullanıcıların temel profil bilgileri güvenle saklanır ve üçüncü kişilere satılamaz.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-zinc-900">2. Çerezler (Cookies) ve İzleme</h2>
            <p>Gezinme deneyimini geliştirmek, kullanım istatistiklerini anlamak ve uygulamamızın daha iyi çalışmasını sağlamak için zorunlu, analitik ve performans (çökme) çerezleri kullanıyoruz. Çerezler vasıtasıyla toplanan anonim veriler tamamen algoritma optimizasyonu odaklıdır. Tercihlerinizi sitemiz üzerinde dilediğiniz zaman sağ menüdeki "Çerez Tercihlerini Yönet" ekranından değiştirebilirsiniz.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-zinc-900">3. Üçüncü Taraflar ve API Paylaşımları</h2>
            <p>Uygulama harita verileri sağlamak ve API bağlantılarını yürütmek için Google Maps vb. üçüncü parti servisler kullanabilmektedir. Aktif navigasyon işlemleri, ilgili API'lerin kendi veri güvenliği standartları çerçevesinde işlenir ve toplanan araç datası bu platformlara açık şekilde yollanmaz.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-zinc-900">4. Veri Güvenliği Standardı</h2>
            <p>Verilerinizi yetkisiz erişime karşı korumak için gerekli tüm endüstri standardı siber güvenlik önlemlerini kullanıyoruz. API isteklerimiz SSL/TLS sertifikaları üzerinden daima uçtan uca şifrelenmektedir.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-zinc-900">5. İletişim</h2>
            <p>Gizlilik süreçleri hakkında sorularınız veya verilerinizin silinmesi talebi için bize <a href="mailto:destek@iyontree.com" className="text-emerald-600 hover:text-emerald-500 font-bold underline underline-offset-2">destek@iyontree.com</a> adresinden ulaşabilirsiniz.</p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
