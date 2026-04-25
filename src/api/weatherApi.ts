import { apiFetch } from '../lib/apiClient';
import { ENDPOINTS } from '../lib/endpoints';
import type { WeatherResponseDto } from '../types/api/weather';

export const weatherApi = {
  get: (lat: number, lng: number) =>
    apiFetch<WeatherResponseDto>(`${ENDPOINTS.WEATHER}?lat=${lat}&lng=${lng}`),
};
