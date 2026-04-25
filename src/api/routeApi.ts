import { apiFetch } from '../lib/apiClient';
import { ENDPOINTS } from '../lib/endpoints';
import type { RouteRequestDto, RouteResultDto } from '../types/api/route';

export const routeApi = {
  plan: (body: RouteRequestDto) =>
    apiFetch<RouteResultDto>(ENDPOINTS.ROUTE_PLAN, { method: 'POST', body }),
};
