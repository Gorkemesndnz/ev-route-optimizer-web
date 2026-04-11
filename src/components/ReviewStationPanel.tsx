import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Camera, UploadCloud, CheckCircle2 } from 'lucide-react';
import type { StationData } from '../contexts/StationContext';

const AMENITY_TAGS = [
  "💳 ATM", "🚻 Tuvalet", "🛍️ AVM", "☕ Kafe", "🍔 Restoran", "🛒 Market", "📶 Wi-Fi"
];

const ISSUE_TAGS = [
  "🔌 Düşük Güç", "📍 Konum Yanlış", "🚫 Çalışmıyor", "🚗 Park Yeri Dar", "💸 Pahalı", "✨ Temiz"
];

export default function ReviewStationPanel({
  station,
  onClose
}: {
  station: StationData;
  onClose: () => void;
}) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1000);
  };

  // Mock function for adding photos
  const handleAddPhoto = () => {
    if (photos.length >= 3) return;
    setPhotos([...photos, `https://images.unsplash.com/photo-1620060935399-${Math.floor(Math.random() * 10000)}?q=80&w=150&auto=format&fit=crop`]);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="glass-panel w-full sm:w-[380px] h-full overflow-hidden flex flex-col pointer-events-auto shadow-3xl items-center justify-center p-8 text-center shrink-0"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
        >
          <CheckCircle2 size={80} className="text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Teşekkürler!</h2>
        <p className="text-zinc-300">Değerlendirmeniz başarıyla gönderildi ve diğer kullanıcılarla paylaşılacak.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="glass-panel w-full sm:w-[380px] h-full overflow-hidden flex flex-col pointer-events-auto shadow-3xl shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-white">Değerlendirme Yaz</h2>
          <p className="text-xs text-white/50">{station.title} hakkında görüşlerini paylaş</p>
        </div>
        <button 
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-6">
        
        {/* Rating Stars */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold text-zinc-300">İstasyon Puanınız</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={36}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`cursor-pointer transition-colors ${
                  (hoverRating || rating) >= star 
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" 
                    : "text-zinc-500 fill-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Written Review */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-300">Deneyiminizi anlatın <span className="text-zinc-500 font-normal">(İsteğe bağlı)</span></label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Şarj hızı nasıldı? Çevrede vakit geçirilecek yerler var mıydı?"
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 resize-none h-24 custom-scrollbar"
          />
        </div>

        {/* Photos */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <Camera size={16} /> Fotoğraf Ekle <span className="text-zinc-500 font-normal">({photos.length}/3)</span>
          </label>
          <div className="flex gap-3">
            {photos.map((url, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                <img src={url} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <button 
                onClick={handleAddPhoto}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white"
              >
                <UploadCloud size={20} />
                <span className="text-[10px]">Yükle</span>
              </button>
            )}
          </div>
        </div>

        {/* Amenities Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-300">Çevre imkanları</label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Issue Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-300">Durum etiketleri</label>
          <div className="flex flex-wrap gap-2">
            {ISSUE_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedTags.includes(tag)
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Action */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            rating === 0
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Değerlendirmeyi Gönder'
          )}
        </button>
      </div>

    </motion.div>
  );
}
