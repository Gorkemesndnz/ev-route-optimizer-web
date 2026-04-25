import { apiFetch } from '../lib/apiClient';
import { ENDPOINTS } from '../lib/endpoints';
import type { VehicleResponse, CreateVehicleRequest, UpdateVehicleRequest, CatalogBrand } from '../types/api/vehicle';

export const vehicleApi = {
  list: () =>
    apiFetch<VehicleResponse[]>(ENDPOINTS.USER_VEHICLES),

  create: (body: CreateVehicleRequest) =>
    apiFetch<VehicleResponse>(ENDPOINTS.USER_VEHICLES, { method: 'POST', body }),

  update: (id: string, body: UpdateVehicleRequest) =>
    apiFetch<VehicleResponse>(`${ENDPOINTS.USER_VEHICLES}/${id}`, { method: 'PUT', body }),

  remove: (id: string) =>
    apiFetch<null>(`${ENDPOINTS.USER_VEHICLES}/${id}`, { method: 'DELETE' }),

  getBrands: () =>
    apiFetch<CatalogBrand[]>(ENDPOINTS.EV_CATALOG_BRANDS),
};
