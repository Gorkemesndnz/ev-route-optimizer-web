// ── Response types ──────────────────────────────────────────────

/** Mirrors VehicleResponse from backend */
export interface VehicleResponse {
  id: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  customName: string;
  batteryCapacityKwh: number;
  soc: number;
  isActive: boolean;
  rangeWLTP: number;
  realRangeKm: number;
  maxChargingPowerKw: number;
}

// ── Request types ───────────────────────────────────────────────

export interface CreateVehicleRequest {
  brand: string;
  model: string;
  variant: string;
  year: number;
  customName: string;
  batteryCapacityKwh: number;
  soc: number;
  isActive: boolean;
}

export interface UpdateVehicleRequest {
  customName: string;
  soc: number;
  isActive: boolean;
}

// ── EV Catalog ──────────────────────────────────────────────────

export interface CatalogModel {
  model: string;
  variant: string;
  year: number;
  batteryCapacityKwh: number;
}

export interface CatalogBrand {
  id: string;
  name: string;
  models: CatalogModel[];
}
