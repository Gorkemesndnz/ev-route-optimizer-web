// ── Connection ──────────────────────────────────────────────────

export interface ConnectionDto {
  connectionType: string;
  powerKw: number | null;
  currentType: string;
  count: number;
  availableCount: number | null;
  outOfServiceCount: number | null;
}

// ── Station variants ────────────────────────────────────────────

export interface ChargingStationDto {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  usageType: string;
  statusType: string;
  formattedAddress: string;
  connections: ConnectionDto[];
  amenities: string[];
  contactTelephone: string;
}

export interface ChargingStationDetailDto extends ChargingStationDto {
  address: string;
  operator: string;
  accessComments: string;
  isRecentlyVerified: boolean;
  dateLastStatusUpdate: string | null;
}

/** Minimal station used for map clustering */
export interface BaseStationDto {
  id: string;
  ocmId: number;
  title: string;
  latitude: number;
  longitude: number;
  usageTypeTitle: string;
}

// ── Tourist spots ───────────────────────────────────────────────

export interface TouristAttractionDto {
  id: string;
  name: string;
  rating: number;
  userRatingCount: number;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  durationSeconds: number;
  primaryType: string;
}
