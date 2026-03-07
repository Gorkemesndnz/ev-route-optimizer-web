export default function ResultsView({ result, onBack }) {
    if (!result) return null

    const legs = result.legs || []
    const totalDistance = result.total_distance_km || 0
    const totalDuration = result.total_duration_minutes || 0
    const chargeCount = result.charge_stops || 0

    // SOC değerlerini bacaklardan çekelim (API root seviyesinde her zaman vermeyebilir)
    const startSoc = legs[0]?.start_soc_percent || result.start_soc_percent || 0
    const endSoc = legs[legs.length - 1]?.end_soc_percent || result.end_soc_percent || 0

    const formatDuration = (min) => {
        const h = Math.floor(min / 60)
        const m = Math.round(min % 60)
        return h > 0 ? `${h}s ${m}dk` : `${m}dk`
    }

    return (
        <div className="results-view">
            {/* Summary */}
            <div className="result-summary">
                <h3>🗺️ Rota Planı</h3>
                <div className="route-meta">
                    {legs.filter(l => l.type === 'drive').length} sürüş + {chargeCount} şarj durağı
                </div>

                <div className="result-stat-grid">
                    <div className="result-stat">
                        <div className="stat-value">{totalDistance.toFixed(0)}</div>
                        <div className="stat-label">km Toplam</div>
                    </div>
                    <div className="result-stat">
                        <div className="stat-value">{formatDuration(totalDuration)}</div>
                        <div className="stat-label">Tahmini Süre</div>
                    </div>
                    <div className="result-stat">
                        <div className="stat-value" style={{ color: '#22c55e' }}>{startSoc}%</div>
                        <div className="stat-label">Başlangıç SOC</div>
                    </div>
                    <div className="result-stat">
                        <div className="stat-value" style={{ color: endSoc < 20 ? '#ef4444' : '#f59e0b' }}>{endSoc}%</div>
                        <div className="stat-label">Varış SOC</div>
                    </div>
                </div>
            </div>

            {/* Legs */}
            <div className="result-legs">
                {legs.map((leg, i) => {
                    if (leg.type === 'drive') {
                        return (
                            <div key={i} className="result-leg">
                                <div className="leg-icon drive">🚗</div>
                                <div className="leg-details">
                                    <div className="leg-title">Sürüş</div>
                                    <div className="leg-subtitle">{leg.distance_km?.toFixed(1)} km — {formatDuration(leg.duration_minutes || 0)}</div>
                                    <div className="leg-meta">
                                        <span>SOC: {leg.start_soc_percent}% → {leg.end_soc_percent}%</span>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    if (leg.type === 'charge') {
                        const station = leg.station || {}
                        const connector = station.connectors?.[0] || {}
                        return (
                            <div key={i} className="result-leg">
                                <div className="leg-icon charge">⚡</div>
                                <div className="leg-details">
                                    <div className="leg-title">{station.name || 'Şarj Durağı'}</div>
                                    <div className="leg-subtitle">
                                        {connector.power_kw}kW — {formatDuration(leg.duration_minutes || 0)}
                                    </div>
                                    <div className="leg-meta">
                                        <span>SOC: {leg.arrival_soc_percent}% → {leg.target_soc_percent}%</span>
                                        {station.rating && <span>⭐ {station.rating}</span>}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    return null
                })}
            </div>

            {/* Back button */}
            <div className="sidebar-footer">
                <button className="options-btn" onClick={onBack}>← Yeni Rota</button>
            </div>
        </div>
    )
}
