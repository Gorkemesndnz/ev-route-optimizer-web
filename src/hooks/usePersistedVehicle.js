import { useState, useEffect } from 'react'

const STORAGE_KEY = 'iyontree_vehicle'

export default function usePersistedVehicle() {
    const [brand, setBrand] = useState('')
    const [model, setModel] = useState('')

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const { brand: b, model: m } = JSON.parse(saved)
                if (b) setBrand(b)
                if (m) setModel(m)
            }
        } catch { }
    }, [])

    useEffect(() => {
        if (brand && model) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ brand, model }))
        }
    }, [brand, model])

    return { brand, setBrand, model, setModel }
}
