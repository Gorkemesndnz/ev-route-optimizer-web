// ── Request ─────────────────────────────────────────────────────

export interface RouteWaypointDto {
  lat: number;
  lng: number;
  address?: string;
}

export interface RouteRequestDto {
  startLat: number;
  startLng: number;
  startAddress?: string;
  endLat: number;
  endLng: number;
  endAddress?: string;
  waypoints?: RouteWaypointDto[];
  vehicleId: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleVariant?: string;
  currentSoc: number;
  passengers: number;
  extraWeight: number;
  climateControl: boolean;
  drivingStyle: string;
  maxSpeed: number;
  // null/undefined = kullanıcı override etmedi → backend WLTP/spec ile kendi
  // hesaplar. Sayı = explicit override (kWh/100km).
  refConsumption?: number | null;
  sarjSikligi: string;
  // null = backend otomatik hesaplasın (kullanıcı override etmedi).
  // Sayı değer = kullanıcı manuel override etti.
  varisSarj: number | null;
  istasyonVarisSarj: number | null;
  istasyonAyrisSarj: number | null;
  sarjTercipi: string;
  toggleFeribot: boolean;
  toggleUcretliOtoyollar: boolean;
  toggleOtoyollar: boolean;
  // Sprint 3: Köprü + özel sektör otoyol toggle'ları (.NET ToggleKopruler/
  // ToggleOzelOtoyollar). Default true = "kullan".
  toggleKopruler: boolean;
  toggleOzelOtoyollar: boolean;
  // ─── v2: Akıllı planlayıcı + ek tercihler ───
  smartPlanner?: boolean;          // legacy alias
  // FAZ 2: .NET tarafında SmartPlanEnabled bool alanına bağlanır.
  smartPlanEnabled?: boolean;
  // FAZ 2: Pareto optimizasyon modu — balanced (default), time_priority, cost_priority, battery_care
  optimizationMode?: 'balanced' | 'time_priority' | 'cost_priority' | 'battery_care';
  stationBrands?: string[];
  locationPrefs?: string[];
  departureDate?: string;   // YYYY-MM-DD
  departureTime?: string;   // HH:mm
}

// ── Response (all keys are snake_case per [JsonPropertyName]) ───

export interface WeatherInfoDto {
  temp_c: number;
  condition: string;
  wind_speed_mps: number;
  wind_direction_deg: number;
  precipitation_prob: number;
}

export interface ConnectorInfoDto {
  plug_type: string;
  charger_type: string;
  power_kw: number;
  status: string;
  price_per_kwh: number | null;
  currency: string;
  count: number;
}

export interface StationAmenityDto {
  has_toilet: boolean;
  has_food: boolean;
  has_wifi: boolean;
  has_shopping: boolean;
  has_parking: boolean;
  is_24_7: boolean;
}

/**
 * Sprint 5 — Provider-neutral availability durumu.
 * - 'available': en az bir konektör boş (availableCount > 0)
 * - 'unavailable': tüm konektörler out-of-service
 * - 'unknown': availability bilgisi eksik (UI 'bilgi yok' gösterebilir)
 */
export type StationAvailabilityStatus = 'available' | 'unavailable' | 'unknown';

/** Sprint 5 — istasyon veri sağlayıcısı. */
export type StationSourceProvider = 'google' | 'ocm';

export interface ChargingStopDto {
  station_id: string | null;
  station_name: string;
  operator: string | null;
  lat: number;
  lon: number;
  address: string | null;
  rating: number;
  charge_time_min: number;
  arrival_soc: number;
  departure_soc: number;
  energy_added_kwh: number;
  price_per_kwh: number | null;
  estimated_cost: number | null;
  currency: string;
  distance_from_route_km: number;
  is_open_now: boolean | null;
  data_source: string | null;
  connectors: ConnectorInfoDto[];
  amenities: StationAmenityDto | null;
  weather: WeatherInfoDto | null;

  // Sprint 5 — Provider-neutral normalization alanları (opsiyonel, geriye uyumlu).
  // FastAPI StationInfo'dan üretilir; UI varlığında "güç bilinmiyor" rozeti
  // ve availability durum göstergesi sunabilir. Davranışsal olarak zorunlu değil.
  power_known?: boolean | null;
  availability_status?: StationAvailabilityStatus | null;
  available_count?: number | null;
  out_of_service_count?: number | null;
  availability_last_update_time?: string | null;
  source_provider?: StationSourceProvider | null;
  source_id?: string | null;
}

export interface RouteLegDto {
  from_location: string | null;
  to_location: string | null;
  from_lat: number | null;
  from_lon: number | null;
  to_lat: number | null;
  to_lon: number | null;
  distance_km: number;
  duration_min: number;
  avg_speed_kmh: number;
  consumption_kwh: number;
  elevation_gain_m: number;
  elevation_loss_m: number;
  start_soc: number;
  end_soc: number;
  polyline: string | null;
}

export interface RouteInsightDto {
  type: string;
  title: string;
  message: string;
  icon: string;
  relevance_score: number;
}

export interface SafeHarborRescueStation {
  name: string;
  place_id: string;
  location: { lat: number; lon: number };
  distance_km: number;
  route_distance_km?: number;
  max_power_kw: number;
  rating?: number;
  return_consumption_kwh?: number;
  return_soc_needed_percent?: number;
  required_arrival_soc_percent: number;
  is_selected: boolean;
  elevation?: { gain_m: number; loss_m: number };
}

export interface SafeHarborInfo {
  active: boolean;
  selected_station_index?: number;
  dynamic_min_arrival_soc_percent: number;
  search_radius_used_km?: number;
  rescue_stations: SafeHarborRescueStation[];
}

export interface PlanQualityDto {
  warnings: string[];
  fallback_used: boolean;
  fallback_reasons: string[];
  provider_versions: Record<string, string>;
  call_counts: Record<string, number>;
  cache: Record<string, unknown>;
  low_confidence_station_ratio: number;
  validation_summary: Record<string, unknown>;
}

export interface RouteResultDto {
  status: string;
  message: string | null;
  total_distance_km: number;
  total_duration_min: number;
  duration_without_traffic_min: number | null;
  traffic_ratio: number | null;
  consumption_kwh: number;
  total_charging_cost: number;
  total_regen_recovered_kwh: number;
  total_co2_savings_kg: number;
  route_strategy: string | null;
  charge_stops_count: number;
  legs: RouteLegDto[];
  charging_stops: ChargingStopDto[];
  overview_polyline: string | null;
  start_weather: WeatherInfoDto | null;
  end_weather: WeatherInfoDto | null;
  insights: RouteInsightDto[];
  warning_messages: string[];
  decision_reason?: string | null;
  plan_quality?: PlanQualityDto | null;
  // FAZ 2: ML outcome backfill için trip_id (POST /trips/{trip_id}/outcome)
  trip_id?: string | null;
  // 🏠 V4.0: Safe Harbor — varış noktasında şarj yoksa kurtarıcı istasyon bilgisi
  safe_harbor_info?: SafeHarborInfo | null;
}
