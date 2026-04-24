import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import type { StationData } from '../../contexts/StationContext';
import { apiClient } from '../../lib/apiClient';
import { ENDPOINTS } from '../../lib/endpoints';

const ISSUE_TYPES = [
  "Güç çok düşük / Dalgalanıyor",
  "Ödeme / Karekod çalışmıyor",
  "İstasyon tamamen arızalı",
  "Lokasyon (Harita) hatalı",
  "Kablo veya Soket hasarlı",
  "Uygulama bağlantısı koptu",
  "Park yeri başka araç dolu",
  "Diğer"
];

export default function ReportIssuePanel({
  station,
  onClose
}: {
  station: StationData;
  onClose: () => void;
}) {
  const [selectedIssue, setSelectedIssue] = useState<string>("");
  const [customIssueText, setCustomIssueText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!selectedIssue) return;
    if (selectedIssue === "Diğer" && !customIssueText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await apiClient(ENDPOINTS.REPORTS, {
        method: 'POST',
        body: {
          stationId: station.id,
          issueType: selectedIssue,
          customDescription: selectedIssue === "Diğer" ? customIssueText.trim() : null
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        setTimeout(() => { onClose(); }, 2000);
      } else {
        alert(data.message || "Sorun bildirimi gönderilemedi.");
      }
    } catch (err) {
      console.error("Report submit error:", err);
      alert("Bağlantı hatası yaşandı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        className="glass-panel w-full sm:w-[360px] h-[300px] flex flex-col items-center justify-center p-8 text-center shrink-0 shadow-3xl self-center"
      >
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Sorun Bildirildi!</h3>
        <p className="text-white/70">
          Bildiriminiz teknik ekibimize ulaştı. Verdiğiniz bilgiler için teşekkür ederiz.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="glass-panel w-full sm:w-[360px] h-fit max-h-full overflow-hidden flex flex-col shrink-0 shadow-3xl relative pointer-events-auto self-center"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-red-500/20 text-red-500 p-2 rounded-xl">
             <AlertTriangle size={20} />
          </div>
          <h2 className="text-xl font-bold">Sorun Bildir</h2>
        </div>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pt-4 flex flex-col gap-4">
        
        <div className="flex flex-col gap-1">
           <h3 className="text-lg font-bold text-white">{station.title}</h3>
           <p className="text-sm text-white/50">Karşılaştığınız problemi aşağıdan seçin.</p>
        </div>

        {/* Issue Options */}
        <div className="flex flex-col gap-1.5">
          {ISSUE_TYPES.map(issue => (
             <button
               key={issue}
               onClick={() => setSelectedIssue(issue)}
               className={`text-left p-2.5 px-3.5 rounded-xl border text-sm transition-all ${
                 selectedIssue === issue 
                 ? 'bg-red-500/20 border-red-500 text-white font-semibold' 
                 : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
               }`}
             >
               {issue}
             </button>
          ))}
        </div>

        {/* Custom Text Area if Diğer is selected */}
        {selectedIssue === "Diğer" && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             className="flex flex-col gap-2"
           >
              <label className="text-sm font-semibold text-white/80">Lütfen sorunu açıklayın</label>
              <textarea
                value={customIssueText}
                onChange={e => setCustomIssueText(e.target.value)}
                placeholder="Örn: Cihaz ekranı kırıktı ve okunamıyordu..."
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none h-28"
              />
           </motion.div>
        )}

      </div>

      {/* Footer / Submit Button */}
      <div className="p-5 border-t border-white/10 bg-black/20 shrink-0">
        <button
          onClick={handleSubmit}
          disabled={!selectedIssue || (selectedIssue === "Diğer" && !customIssueText.trim()) || isSubmitting}
          className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500 active:scale-95 transition-all text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            'Gönderiliyor...'
          ) : (
            <>Gönder <Send size={18} /></>
          )}
        </button>
      </div>
    </motion.div>
  );
}
