import { useState, useRef, useEffect, useCallback } from 'react'

export default function SearchOverlay({ onSelect, onClose }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const inputRef = useRef(null)
    const autocompleteService = useRef(null)
    const placesService = useRef(null)

    useEffect(() => {
        inputRef.current?.focus()
        if (window.google?.maps?.places) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService()
        }
    }, [])

    const handleSearch = useCallback((value) => {
        setQuery(value)
        if (!value.trim() || !autocompleteService.current) {
            setResults([])
            return
        }

        autocompleteService.current.getPlacePredictions(
            { input: value, componentRestrictions: { country: 'tr' }, language: 'tr' },
            (predictions, status) => {
                if (status === 'OK' && predictions) {
                    setResults(predictions.map(p => ({
                        placeId: p.place_id,
                        mainText: p.structured_formatting?.main_text || p.description,
                        secondaryText: p.structured_formatting?.secondary_text || '',
                        description: p.description,
                    })))
                } else {
                    setResults([])
                }
            }
        )
    }, [])

    const handleSelect = useCallback((item) => {
        // Get place details for lat/lng
        if (!window.google) return

        if (!placesService.current) {
            const div = document.createElement('div')
            placesService.current = new window.google.maps.places.PlacesService(div)
        }

        placesService.current.getDetails(
            { placeId: item.placeId, fields: ['geometry', 'name', 'formatted_address'] },
            (place, status) => {
                if (status === 'OK' && place?.geometry?.location) {
                    onSelect({
                        name: place.name || item.mainText,
                        address: place.formatted_address || item.description,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        placeId: item.placeId,
                    })
                }
            }
        )
    }, [onSelect])

    return (
        <div className="search-overlay">
            <div className="search-overlay-header">
                <button className="back-btn" onClick={onClose}>←</button>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Nereye gitmek istiyorsunuz?"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>
            <div className="search-results">
                {results.length === 0 && !query && (
                    <div className="search-result-item" style={{ cursor: 'default', color: 'var(--text-muted)' }}>
                        <span className="result-icon">📍</span>
                        <span>Bir konum arayın</span>
                    </div>
                )}
                {results.map((item) => (
                    <div key={item.placeId} className="search-result-item" onClick={() => handleSelect(item)}>
                        <span className="result-icon">📍</span>
                        <div className="result-text">
                            <div>{item.mainText}</div>
                            {item.secondaryText && <div className="result-description">{item.secondaryText}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
