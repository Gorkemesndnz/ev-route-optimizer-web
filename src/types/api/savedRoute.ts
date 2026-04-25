// ── Request types ───────────────────────────────────────────────

export interface CreateSavedRouteDto {
  startLabel: string;
  endLabel: string;
  totalDistanceKm: number;
  totalDurationMin: number;
  consumptionKwh: number;
  totalChargingCost: number;
  routeResultJson: string;
  routeRequestJson: string;
}

export interface RateSavedRouteDto {
  rating: number;
  comment?: string;
}

// ── Response types ──────────────────────────────────────────────

export interface SavedRouteSummaryDto {
  id: string;
  startLabel: string;
  endLabel: string;
  totalDistanceKm: number;
  totalDurationMin: number;
  consumptionKwh: number;
  totalChargingCost: number;
  rating: number | null;
  ratingComment: string | null;
  createdAt: string;
}

export interface SavedRouteDetailDto extends SavedRouteSummaryDto {
  routeResultJson: string;
  routeRequestJson: string;
}
