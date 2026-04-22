import { X, Navigation, Clock, Zap, Battery, TrendingDown, DollarSign } from "lucide-react";
import { useRouteContext, type ChargingStopDto, type RouteInsight } from "../../contexts/RouteContext";
import { useSettings } from "../../contexts/SettingsContext";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} dk`;
  return `${h} sa ${m} dk`;
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-white/40">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-white font-bold text-lg leading-tight">{value}</span>
    </div>
  );
}

function ChargeStopCard({ stop }: { stop: ChargingStopDto }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
            <Zap size={13} className="text-green-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{stop.station_name}</p>
            {stop.operator && (
              <p className="text-white/40 text-xs">{stop.operator}</p>
            )}
          </div>
        </div>
        {stop.estimated_cost != null && stop.estimated_cost > 0 && (
          <span className="text-xs text-white/60 shrink-0">{stop.estimated_cost.toFixed(0)} ₺</span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-white/50 flex-wrap">
        <span>%{Math.round(stop.arrival_soc)} → %{Math.round(stop.departure_soc)}</span>
        <span>·</span>
        <span>{formatDuration(stop.charge_time_min)}</span>
        <span>·</span>
        <span>{stop.energy_added_kwh.toFixed(1)} kWh</span>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: RouteInsight }) {
  const colorClass =
    insight.type === 'warning'
      ? 'bg-amber-500/10 border-amber-500/20'
      : insight.type === 'saving'
        ? 'bg-green-500/10 border-green-500/20'
        : 'bg-white/5 border-white/10';

  return (
    <div className={`rounded-2xl p-4 border ${colorClass}`}>
      <p className="text-white font-medium text-sm">{insight.title}</p>
      {insight.message && (
        <p className="text-white/50 text-xs mt-1">{insight.message}</p>
      )}
    </div>
  );
}

export default function RouteResultPanel({ onClose }: { onClose: () => void }) {
  const { routeResult } = useRouteContext();
  const { language } = useSettings();

  if (!routeResult) return null;

  const startLocation = routeResult.legs?.[0]?.from_location || '—';
  const endLocation = routeResult.legs?.[routeResult.legs.length - 1]?.to_location || '—';

  const labels = {
    title: language === 'tr' ? 'Rota Planı' : 'Route Plan',
    distance: language === 'tr' ? 'Mesafe' : 'Distance',
    duration: language === 'tr' ? 'Süre' : 'Duration',
    consumption: language === 'tr' ? 'Tüketim' : 'Consumption',
    stops: language === 'tr' ? 'Şarj Durağı' : 'Charge Stops',
    cost: language === 'tr' ? 'Tahmini Maliyet' : 'Est. Cost',
    co2: language === 'tr' ? 'CO₂ Tasarrufu' : 'CO₂ Saved',
    chargeStops: language === 'tr' ? 'Şarj Durakları' : 'Charging Stops',
    insights: language === 'tr' ? 'Öneriler' : 'Insights',
    clearRoute: language === 'tr' ? 'Rotayı Temizle' : 'Clear Route',
  };

  return (
    <div className="glass-panel w-full sm:w-[420px] h-full sm:h-auto sm:max-h-[90vh] flex flex-col pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 px-6 pb-4 shrink-0 border-b border-white/10">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h2 className="text-lg font-bold text-white">{labels.title}</h2>
          <p className="text-xs text-white/40 truncate max-w-[280px]">
            {startLocation} → {endLocation}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Navigation size={14} className="text-cyan-400" />}
            label={labels.distance}
            value={`${routeResult.total_distance_km.toFixed(1)} km`}
          />
          <StatCard
            icon={<Clock size={14} className="text-cyan-400" />}
            label={labels.duration}
            value={formatDuration(routeResult.total_duration_min)}
          />
          <StatCard
            icon={<Zap size={14} className="text-cyan-400" />}
            label={labels.consumption}
            value={`${routeResult.consumption_kwh.toFixed(1)} kWh`}
          />
          <StatCard
            icon={<Battery size={14} className="text-cyan-400" />}
            label={labels.stops}
            value={`${routeResult.charge_stops_count} durak`}
          />
          {routeResult.total_charging_cost > 0 && (
            <StatCard
              icon={<DollarSign size={14} className="text-cyan-400" />}
              label={labels.cost}
              value={`${routeResult.total_charging_cost.toFixed(0)} ₺`}
            />
          )}
          {routeResult.total_co2_savings_kg > 0 && (
            <StatCard
              icon={<TrendingDown size={14} className="text-green-400" />}
              label={labels.co2}
              value={`${routeResult.total_co2_savings_kg.toFixed(1)} kg`}
            />
          )}
        </div>

        {/* Charging stops */}
        {routeResult.charging_stops?.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold text-white/40 tracking-widest uppercase">
              {labels.chargeStops}
            </h3>
            {routeResult.charging_stops.map((stop, i) => (
              <ChargeStopCard key={i} stop={stop} />
            ))}
          </div>
        )}

        {/* Insights */}
        {routeResult.insights?.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold text-white/40 tracking-widest uppercase">
              {labels.insights}
            </h3>
            {routeResult.insights.slice(0, 3).map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        )}

        {/* Warning messages */}
        {routeResult.warning_messages?.length > 0 && (
          <div className="flex flex-col gap-2">
            {routeResult.warning_messages.map((msg, i) => (
              <div
                key={i}
                className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-300"
              >
                {msg}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-5 shrink-0 border-t border-white/10">
        <button
          onClick={onClose}
          className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-3.5 rounded-2xl transition-all border border-white/10 text-sm active:scale-[0.98]"
        >
          {labels.clearRoute}
        </button>
      </div>
    </div>
  );
}
