import { useState, useCallback } from 'react'
import { optimizeRoute } from '../services/api'

export default function useRouteOptimizer() {
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const planRoute = useCallback(async ({ stops, vehicleModelId, currentSocPercent }) => {
        if (stops.length < 2) {
            setError('En az başlangıç ve varış noktası gerekli')
            return
        }

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const data = await optimizeRoute({ stops, vehicleModelId, currentSocPercent })
            if (data.status === 'success') {
                setResult(data)
            } else {
                setError(data.message || 'Rota optimize edilemedi')
            }
        } catch (err) {
            setError(err.message || 'Bağlantı hatası')
        } finally {
            setLoading(false)
        }
    }, [])

    const clearResult = useCallback(() => {
        setResult(null)
        setError(null)
    }, [])

    return { result, loading, error, planRoute, clearResult }
}
