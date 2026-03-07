import { useState, useEffect } from 'react'
import { fetchVehicleBrands } from '../services/api'
import usePersistedVehicle from '../hooks/usePersistedVehicle'

export default function VehicleCard({ onVehicleChange, onSocChange, soc }) {
    const { brand, setBrand, model, setModel } = usePersistedVehicle()
    const [brands, setBrands] = useState({})
    const [showSelector, setShowSelector] = useState(false)

    useEffect(() => {
        fetchVehicleBrands().then(setBrands).catch(console.error)
    }, [])

    useEffect(() => {
        if (model) onVehicleChange(model)
    }, [model, onVehicleChange])

    const brandList = Object.keys(brands).sort()
    const modelList = brand ? (brands[brand] || []) : []

    const formatModelName = (id) => {
        return id
            .split('_')
            .slice(1)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
            .replace(/kwh/gi, 'kWh')
    }

    return (
        <div className="vehicle-card">
            <div className="vehicle-card-header">
                <span className="vehicle-name">
                    {model ? formatModelName(model) : 'Araç Seç'}
                </span>
                <button className="settings-btn" onClick={() => setShowSelector(!showSelector)}>⚙️</button>
            </div>

            {(showSelector || !model) && (
                <div className="vehicle-selector">
                    <select value={brand} onChange={e => { setBrand(e.target.value); setModel('') }}>
                        <option value="">Marka</option>
                        {brandList.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select value={model} onChange={e => setModel(e.target.value)} disabled={!brand}>
                        <option value="">Model</option>
                        {modelList.map(m => <option key={m} value={m}>{formatModelName(m)}</option>)}
                    </select>
                </div>
            )}

            <div className="soc-section">
                <div className="soc-label">
                    <span>🔋</span>
                    <span className="soc-value">{soc}</span>
                    <span className="soc-percent">%</span>
                </div>
                <input
                    type="range"
                    className="soc-slider"
                    min="10"
                    max="100"
                    value={soc}
                    onChange={e => onSocChange(Number(e.target.value))}
                    style={{ '--soc-fill': `${soc}%` }}
                />
            </div>
        </div>
    )
}
