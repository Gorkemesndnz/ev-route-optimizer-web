import { apiFetch } from '../lib/apiClient';
import { ENDPOINTS } from '../lib/endpoints';
import type { AutocompleteResponseDto, PlaceDetailsDto, GeocodeResponseDto } from '../types/api/maps';

export const mapsApi = {
  autocomplete: (input: string, sessionToken: string, language: string) =>
    apiFetch<AutocompleteResponseDto>(
      `${ENDPOINTS.MAPS_AUTOCOMPLETE}?input=${encodeURIComponent(input)}&sessionToken=${sessionToken}&language=${language}`
    ),

  placeDetails: (placeId: string, sessionToken: string) =>
    apiFetch<PlaceDetailsDto>(`${ENDPOINTS.mapsPlaceDetails(placeId)}?sessionToken=${sessionToken}`),

  reverseGeocode: (lat: number, lng: number) =>
    apiFetch<GeocodeResponseDto>(`${ENDPOINTS.MAPS_REVERSE_GEOCODE}?lat=${lat}&lng=${lng}`),
};
