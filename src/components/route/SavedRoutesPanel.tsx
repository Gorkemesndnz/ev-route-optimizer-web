import { useEffect } from 'react';
import { X, Map, Trash2, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSavedRoute } from '../../contexts/SavedRouteContext';

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} dk`;
  return `${h}sa ${m}dk`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function SavedRoutesPanel({
  onBack,
  onSelectRoute,
}: {
  onBack: () => void;
  onSelectRoute: (id: string) => void;
}) {
  const { savedRoutes, isLoading, loadSavedRoutes, deleteSavedRoute } = useSavedRoute();

  useEffect(() => {
    loadSavedRoutes();
  }, [loadSavedRoutes]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="glass-panel w-full sm:w-[420px] h-full sm:h-auto sm:max-h-[92vh] flex flex-col pointer-events-auto overflow-hidden border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/10 shrink-0">
        <Map size={18} className="text-cyan-400" />
        <h2 className="font-bold text-white text-lg flex-1">Kayıtlı Rotalar</h2>
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar flex flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
                <div className="h-4 w-40 bg-white/10 rounded mb-2" />
                <div className="h-3 w-24 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : savedRoutes.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/50">
            Henüz kayıtlı rotanız yok. Rota planladıktan sonra yer imi butonuna basın.
          </div>
        ) : (
          savedRoutes.map(route => (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className="relative bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-5 flex items-center justify-between cursor-pointer group"
            >
              {/* Sol */}
              <div className="flex flex-col min-w-0 flex-1 pr-3">
                <span className="text-white font-semibold text-[15px] truncate">
                  {route.startLabel} → {route.endLabel}
                </span>
                <span className="text-white/50 text-sm mt-0.5">{formatDate(route.createdAt)}</span>
                {route.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={i < route.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sağ */}
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span className="text-cyan-400 font-medium text-sm">{formatDuration(route.totalDurationMin)}</span>
                <span className="text-white/60 text-xs">{route.consumptionKwh.toFixed(1)} kWh</span>
                <span className="text-white/40 text-xs">{Math.round(route.totalDistanceKm)} km</span>
              </div>

              {/* Sil */}
              <button
                onClick={e => { e.stopPropagation(); deleteSavedRoute(route.id); }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center"
              >
                <Trash2 size={11} className="text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
