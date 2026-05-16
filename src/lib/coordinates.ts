export interface LatLngLike {
  lat?: unknown;
  lng?: unknown;
}

export function isValidLatLng(coords: LatLngLike | null | undefined): coords is { lat: number; lng: number } {
  if (!coords) return false;
  return (
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lng >= -180 &&
    coords.lng <= 180
  );
}
