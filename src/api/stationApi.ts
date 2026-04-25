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

  getAmenities: (lat: number, lng: number) =>
    apiFetch<Record<string, boolean>>(`${ENDPOINTS.STATIONS_AMENITIES}?lat=${lat}&lng=${lng}`),
};
