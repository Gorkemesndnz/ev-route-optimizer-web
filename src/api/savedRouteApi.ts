import { apiFetch } from '../lib/apiClient';
import { ENDPOINTS } from '../lib/endpoints';
import type { CreateSavedRouteDto, RateSavedRouteDto, SavedRouteSummaryDto, SavedRouteDetailDto } from '../types/api/savedRoute';

export const savedRouteApi = {
  list: () =>
    apiFetch<SavedRouteSummaryDto[]>(ENDPOINTS.SAVED_ROUTES),

  create: (body: CreateSavedRouteDto) =>
    apiFetch<SavedRouteSummaryDto>(ENDPOINTS.SAVED_ROUTES, { method: 'POST', body }),

  getById: (id: string) =>
    apiFetch<SavedRouteDetailDto>(ENDPOINTS.savedRoute(id)),

  remove: (id: string) =>
    apiFetch<null>(ENDPOINTS.savedRoute(id), { method: 'DELETE' }),

  rate: (id: string, body: RateSavedRouteDto) =>
    apiFetch<null>(ENDPOINTS.savedRouteRate(id), { method: 'POST', body }),
};
