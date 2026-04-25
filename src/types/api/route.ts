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
  refConsumption: number;
  sarjSikligi: string;
  varisSarj: number;
  istasyonVarisSarj: number;
  istasyonAyrisSarj: number;
  sarjTercipi: string;
  toggleFeribot: boolean;
  toggleUcretliOtoyollar: boolean;
  toggleOtoyollar: boolean;
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
}
