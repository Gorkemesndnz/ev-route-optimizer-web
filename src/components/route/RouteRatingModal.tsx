import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RouteRatingModal({
  savedRouteId,
  existingRating,
  existingComment,
  onRate,
  onClose,
}: {
  savedRouteId: string;
  existingRating?: number | null;
  existingComment?: string | null;
  onRate: (id: string, rating: number, comment?: string) => Promise<void>;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(existingRating ?? 0);
  const [comment, setComment] = useState(existingComment ?? '');
  const [loading, setLoading] = useState(false);

  const labels = ['', 'Kötü', 'İdare eder', 'İyi', 'Çok iyi', 'Mükemmel'];

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    await onRate(savedRouteId, selected, comment || undefined);
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="glass-panel relative w-full max-w-sm p-6 flex flex-col gap-5 pointer-events-auto z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>

          <div>
            <h3 className="font-bold text-white text-lg">Rotayı Değerlendir</h3>
            <p className="text-white/50 text-sm mt-1">Bu rotayla ilgili deneyimini paylaş</p>
          </div>

          {/* Yıldızlar */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(n)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={
                      n <= (hovered || selected)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-white/20'
                    }
                  />
                </button>
              ))}
            </div>
            <span className="text-white/60 text-sm h-4">
              {labels[hovered || selected] || ''}
            </span>
          </div>

          {/* Yorum */}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Yorum ekle (isteğe bağlı)..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/30"
          />

          <button
            onClick={handleSubmit}
            disabled={!selected || loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all active:scale-95"
          >
            {loading ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
