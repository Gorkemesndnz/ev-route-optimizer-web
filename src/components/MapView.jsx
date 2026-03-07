import { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, MarkerClusterer } from '@react-google-maps/api'
import { fetchMapsKey, fetchMapStations } from '../services/api'

const MAP_STYLES = [
    { elementType: 'geometry', stylers: [{ color: '#fdfcf8' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#a0a0a0' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#f0e6e1' }] },
    { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#f0e6e1' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#fdfcf8' }] },
    { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#f0e6e1' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#fce8d5' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#f7d6ba' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#d4e4e6' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9eaba9' }] }
]

const TURKEY_CENTER = { lat: 39.0, lng: 35.0 }
const LIBRARIES = ['places']

export default function MapView({ result, stops }) {
    const defaultMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const [mapsKey, setMapsKey] = useState(defaultMapsKey || null);

    useEffect(() => {
        // Eğer çevre değişkeninden alamazsak (undefined veya null ise), yalnız o zaman backend'den iste.
        if (!defaultMapsKey) {
            fetchMapsKey().then(setMapsKey).catch(console.error)
        }
    }, [defaultMapsKey])

    if (!mapsKey) {
        return <div className="map-container" style={{ background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Harita API Key Yükleniyor...</div>
    }

    return <ActualMap result={result} stops={stops} mapsKey={mapsKey} />
}

function ActualMap({ result, stops, mapsKey }) {
    const [directions, setDirections] = useState(null)
    const [mapStations, setMapStations] = useState([])
    const mapRef = useRef(null)
    const fetchTimeoutRef = useRef(null)

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: mapsKey,
        libraries: LIBRARIES,
    })

    const onLoad = useCallback((map) => {
        mapRef.current = map
    }, [])

    const handleIdle = useCallback(() => {
        if (!mapRef.current) return

        // Debounce for 500ms to avoid spamming the backend while user is panning
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current)

        fetchTimeoutRef.current = setTimeout(async () => {
            const zoom = mapRef.current.getZoom()
            const center = mapRef.current.getCenter()

            if (!center) return;

            // Harita ne kadar gerideyse (zoom küçükse) o kadar geniş çapta arama yapar 
            // ama backend zaten kısıtlıyor (Max 50km google limitini kendi cache'iyle asiyoruz)
            let radiusKm = 50;
            if (zoom >= 13) radiusKm = 10;
            else if (zoom >= 10) radiusKm = 25;
            else if (zoom <= 6) radiusKm = 200; // Turkiye Gorseli icin

            try {
                const fetched = await fetchMapStations(center.lat(), center.lng(), radiusKm, zoom)
                if (Array.isArray(fetched)) {
                    setMapStations(fetched)
                }
            } catch (err) {
                console.error("Map stations fetch idle error:", err)
            }
        }, 500)
    }, [])

    // Draw route when result arrives
    useEffect(() => {
        if (!result || !isLoaded || !window.google) return

        const legs = result.legs || []
        const driveLegs = legs.filter(l => l.type === 'drive')

        if (driveLegs.length === 0) return

        const first = driveLegs[0]
        const last = driveLegs[driveLegs.length - 1]

        const origin = { lat: first.start_location?.lat, lng: first.start_location?.lon }
        const destination = { lat: last.end_location?.lat, lng: last.end_location?.lon }

        if (!origin.lat || !destination.lat) return

        const directionsService = new window.google.maps.DirectionsService()
        directionsService.route(
            { origin, destination, travelMode: window.google.maps.TravelMode.DRIVING },
            (res, status) => {
                if (status === 'OK') setDirections(res)
            }
        )
    }, [result, isLoaded])

    // Fit bounds to stops
    useEffect(() => {
        if (!mapRef.current || !isLoaded || !stops || stops.length === 0) return

        const validStops = stops.filter(s => s.lat && s.lng)
        if (validStops.length === 0) return

        const bounds = new window.google.maps.LatLngBounds()
        validStops.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }))
        mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 420 })
    }, [stops, isLoaded])

    if (!isLoaded) {
        return <div className="map-container" style={{ background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Google Maps yükleniyor...</div>
    }

    // Charge station markers
    const chargeStops = (result?.legs || [])
        .filter(l => l.type === 'charge')
        .map((l, i) => ({
            position: l.station_location ? { lat: l.station_location.lat, lng: l.station_location.lon } : null,
            title: l.station_name || `Şarj ${i + 1}`,
            power: l.charger_power_kw,
        }))
        .filter(s => s.position)

    return (
        <GoogleMap
            mapContainerClassName="map-container"
            center={TURKEY_CENTER}
            zoom={6}
            onLoad={onLoad}
            onIdle={handleIdle}
            options={{
                styles: MAP_STYLES,
                disableDefaultUI: true,
                zoomControl: true,
                zoomControlOptions: { position: 8 },
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            }}
        >
            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{
                        suppressMarkers: true,
                        polylineOptions: { strokeColor: '#22c55e', strokeWeight: 5, strokeOpacity: 0.8 },
                    }}
                />
            )}

            {/* Start marker */}
            {stops.length > 0 && stops[0].lat && (
                <Marker position={{ lat: stops[0].lat, lng: stops[0].lng }} label={{ text: '●', color: '#22c55e', fontSize: '24px' }} title="Başlangıç" />
            )}

            {/* End marker */}
            {stops.length > 1 && stops[stops.length - 1].lat && (
                <Marker position={{ lat: stops[stops.length - 1].lat, lng: stops[stops.length - 1].lng }} label={{ text: '📍', fontSize: '20px' }} title="Varış" />
            )}

            {/* Charge station markers (Route Planner inced) */}
            {chargeStops.map((s, i) => (
                <Marker key={`charge-${i}`} position={s.position} label={{ text: '⚡', fontSize: '16px' }} title={`${s.title} (${s.power ? s.power + 'kW' : 'Bilinmiyor'})`} />
            ))}

            {/* Dinamik Google Harita İstasyonları (Clustered) */}
            <MarkerClusterer
                options={{
                    gridSize: 40,
                    minimumClusterSize: 3,
                    styles: [{
                        url: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m1.png',
                        width: 53,
                        height: 52,
                        textColor: '#fff',
                        textSize: 12
                    }]
                }}
            >
                {(clusterer) =>
                    mapStations.map((s) => {
                        if (!s.location || !s.location.lat) return null

                        // Rotadaki şarj duraklarını tekrar basmamak için filtrele
                        const isRouteStop = chargeStops.some(cs =>
                            Math.abs(cs.position.lat - s.location.lat) < 0.0001 &&
                            Math.abs(cs.position.lng - s.location.lon) < 0.0001
                        );
                        if (isRouteStop) return null;

                        const power = s.connectors?.[0]?.power_kw
                        const title = `${s.name} (${power ? power + 'kW' : 'Bilinmiyor'})`

                        return (
                            <Marker
                                key={`station-${s.id}`}
                                position={{ lat: s.location.lat, lng: s.location.lon }}
                                clusterer={clusterer}
                                icon={{
                                    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                                    scale: 6,
                                    fillColor: '#60a5fa',
                                    fillOpacity: 0.9,
                                    strokeWeight: 2,
                                    strokeColor: '#ffffff'
                                }}
                                title={title}
                            />
                        )
                    })
                }
            </MarkerClusterer>
        </GoogleMap>
    )
}
