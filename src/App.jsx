import { useState, useCallback } from 'react'
import MapView from './components/MapView'
import SearchOverlay from './components/SearchOverlay'
import StopList from './components/StopList'
import VehicleCard from './components/VehicleCard'
import ResultsView from './components/ResultsView'
import useRouteOptimizer from './hooks/useRouteOptimizer'

// UI States: idle → search → planning → loading → results
const IDLE = 'idle'
const SEARCH = 'search'
const PLANNING = 'planning'
const LOADING = 'loading'
const RESULTS = 'results'

let stopIdCounter = 0
const createStop = (data) => ({ id: `stop-${++stopIdCounter}`, ...data })

export default function App() {
    const [uiState, setUiState] = useState(IDLE)
    const [stops, setStops] = useState([])
    const [searchTarget, setSearchTarget] = useState('start') // 'start' | 'end' | 'waypoint'
    const [vehicleModelId, setVehicleModelId] = useState('')
    const [soc, setSoc] = useState(85)
    const { result, loading, error, planRoute, clearResult } = useRouteOptimizer()

    // Handle location selection from search overlay
    const handleLocationSelect = useCallback((location) => {
        if (searchTarget === 'start' && stops.length === 0) {
            // First stop → add start, then ask for destination
            setStops([createStop(location)])
            setSearchTarget('end')
            return // Stay in search to pick destination
        }

        if (searchTarget === 'end') {
            if (stops.length === 0) {
                // Edge case: add as start
                setStops([createStop(location)])
                setSearchTarget('end')
                return
            }
            // Add destination
            setStops(prev => [...prev, createStop(location)])
            setUiState(PLANNING)
            return
        }

        if (searchTarget === 'waypoint') {
            // Insert waypoint before the last stop
            setStops(prev => {
                const copy = [...prev]
                copy.splice(copy.length - 1, 0, createStop(location))
                return copy
            })
            setUiState(PLANNING)
            return
        }
    }, [searchTarget, stops])

    // Handle "Nereye gitmek istersiniz?" click
    const handleSearchClick = () => {
        setSearchTarget('start')
        setUiState(SEARCH)
    }

    // Handle search overlay close
    const handleSearchClose = () => {
        if (stops.length >= 2) {
            setUiState(PLANNING)
        } else {
            setStops([])
            setUiState(IDLE)
        }
    }

    // Handle add waypoint
    const handleAddWaypoint = () => {
        setSearchTarget('waypoint')
        setUiState(SEARCH)
    }

    // Handle Plan Route
    const handlePlanRoute = async () => {
        if (stops.length < 2 || !vehicleModelId) return
        setUiState(LOADING)
        await planRoute({ stops, vehicleModelId, currentSocPercent: soc })
        setUiState(RESULTS)
    }

    // Handle back from results
    const handleBack = () => {
        clearResult()
        setUiState(PLANNING)
    }

    // Handle sidebar close
    const handleSidebarClose = () => {
        setStops([])
        clearResult()
        setUiState(IDLE)
    }

    const canPlan = stops.length >= 2 && vehicleModelId

    return (
        <div className="app">
            {/* Full-screen Map */}
            <MapView result={result} stops={stops} />

            {/* State: IDLE → Floating Search Button */}
            {uiState === IDLE && (
                <button className="search-button" onClick={handleSearchClick}>
                    <span className="search-icon">🔍</span>
                    <span>Nereye gitmek istiyorsunuz?</span>
                    <span className="logo-icon">⚡</span>
                </button>
            )}

            {/* State: SEARCH → Search Overlay */}
            {uiState === SEARCH && (
                <SearchOverlay onSelect={handleLocationSelect} onClose={handleSearchClose} />
            )}

            {/* State: PLANNING → Sidebar */}
            {uiState === PLANNING && (
                <div className="sidebar">
                    <div className="sidebar-header">
                        <button className="back-btn" onClick={handleSidebarClose}>←</button>
                        <h2>Rotanız</h2>
                        <div style={{ width: 32 }} />
                    </div>

                    <div className="sidebar-content">
                        <StopList stops={stops} setStops={setStops} onAddStop={handleAddWaypoint} />

                        <VehicleCard
                            onVehicleChange={setVehicleModelId}
                            onSocChange={setSoc}
                            soc={soc}
                        />
                    </div>

                    <div className="sidebar-footer">
                        <button className="options-btn">⇅ Options</button>
                        <button className="plan-btn" disabled={!canPlan} onClick={handlePlanRoute}>
                            Rota Planla →
                        </button>
                    </div>
                </div>
            )}

            {/* State: LOADING → Sidebar with spinner */}
            {uiState === LOADING && (
                <div className="sidebar">
                    <div className="sidebar-header">
                        <button className="back-btn" onClick={() => setUiState(PLANNING)}>←</button>
                        <h2>Hesaplanıyor...</h2>
                        <div style={{ width: 32 }} />
                    </div>
                    <div className="loading-overlay">
                        <div className="spinner" />
                        <span className="loading-text">Rota optimize ediliyor...</span>
                    </div>
                </div>
            )}

            {/* State: RESULTS → Sidebar with results */}
            {uiState === RESULTS && (
                <div className="sidebar">
                    <div className="sidebar-header">
                        <button className="back-btn" onClick={handleBack}>←</button>
                        <h2>Rota Sonuçları</h2>
                        <div style={{ width: 32 }} />
                    </div>

                    {error && (
                        <div className="error-box">
                            <p>❌ {error}</p>
                        </div>
                    )}

                    <ResultsView result={result} onBack={handleBack} />
                </div>
            )}
        </div>
    )
}
