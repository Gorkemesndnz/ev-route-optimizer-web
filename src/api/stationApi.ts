import { apiFetch } from '../lib/apiClient';
import { ENDPOINTS } from '../lib/endpoints';
import type { BaseStationDto, ChargingStationDto, ChargingStationDetailDto, TouristAttractionDto } from '../types/api/station';

export const stationApi = {
  getBase: (params: { swLat: number; swLng: number; neLat: number; neLng: number; zoom: number }) => {
    const q = new URLSearchParams(params as unknown as Record<string, string>).toString();
    return apiFetch<BaseStationDto[]>(`${ENDPOINTS.STATIONS_BASE}?${q}`);
  },

  getGoogle: (params: { swLat: number; swLng: number; neLat: number; neLng: number }) => {
    const { swLat, swLng, neLat, neLng } = params;
    return apiFetch<ChargingStationDto[]>(
      `${ENDPOINTS.STATIONS_GOOGLE}?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`
    );
  },

  getDetail: (id: string | number) =>
    apiFetch<ChargingStationDetailDto>(ENDPOINTS.stationDetail(id)),

  getTouristSpots: (lat: number, lng: number) =>
    apiFetch<TouristAttractionDto[]>(`${ENDPOINTS.STATIONS_TOURIST_SPOTS}?lat=${lat}&lng=${lng}`),

  // B4 fix: Backend GetNearbyAmenitiesAsync List<string> dönüyor (örn. ["Yeme & İçme", "ATM"]).
  // Eski tip Record<string, boolean> idi → Object.keys ile çağrıldığında array indekslerini ("0","1")
  // amenity ismi olarak gösteriyordu. Doğru tip: string[].
  getAmenities: (lat: number, lng: number) =>
    apiFetch<string[]>(`${ENDPOINTS.STATIONS_AMENITIES}?lat=${lat}&lng=${lng}`),
};
