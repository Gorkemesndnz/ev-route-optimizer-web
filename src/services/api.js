const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export async function fetchMapsKey() {
    const res = await fetch(`${API_URL}/api/maps-key`);
    if (!res.ok) throw new Error('API key alınamadı');
    const data = await res.json();
    return data.key;
}

export async function optimizeRoute({ stops, vehicleModelId, currentSocPercent }) {
    const start = stops[0];
    const end = stops[stops.length - 1];

    const body = {
        start_location: { lat: start.lat, lon: start.lng },
        end_location: { lat: end.lat, lon: end.lng },
        vehicle_model_id: vehicleModelId,
        current_soc_percent: currentSocPercent,
    };

    const res = await fetch(`${API_URL}/optimize_route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `API hatası: ${res.status}`);
    }

    return res.json();
}

export async function fetchVehicleBrands() {
    const res = await fetch(`${API_URL}/api/info`);
    if (!res.ok) throw new Error('Araç bilgisi alınamadı');
    const data = await res.json();
    const vehicles = data.supported_vehicles || [];

    const brandMap = {};
    vehicles.forEach(id => {
        const parts = id.split('_');
        const brand = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        if (!brandMap[brand]) brandMap[brand] = [];
        brandMap[brand].push(id);
    });

    return brandMap;
}

export async function fetchMapStations(lat, lon, radiusKm, zoom) {
    const res = await fetch(`${API_URL}/api/map_stations?lat=${lat}&lon=${lon}&radius_km=${radiusKm}&zoom=${zoom}`);
    if (!res.ok) throw new Error('Dinamik harita istasyonları alınamadı');
    return res.json();
}
