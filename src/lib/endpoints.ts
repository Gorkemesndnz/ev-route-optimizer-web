/**
 * Merkezi endpoint sabitleri.
 *
 * Tüm .NET API yolları burada tanımlıdır.
 * Yeni bir endpoint eklerken veya mevcut birini değiştirirken
 * yalnızca bu dosyayı güncelleyin.
 */
export const ENDPOINTS = {
  // ── Auth ───────────────────────────────────────────────
  AUTH_CHECK_EMAIL: '/auth/check-email',
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_VERIFY_REGISTRATION: '/auth/verify-registration',
  AUTH_VERIFY_CODE: '/auth/verify-code',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  AUTH_REFRESH_TOKEN: '/auth/refresh-token',
  AUTH_PROFILE: '/auth/profile',
  AUTH_PROFILE_SEND_CODE: '/auth/profile/send-code',
  AUTH_PROFILE_VERIFY_CODE: '/auth/profile/verify-code',

  // ── Vehicles ───────────────────────────────────────────
  USER_VEHICLES: '/UserVehicles',
  EV_CATALOG_BRANDS: '/EvCatalog/brands',

  // ── Route ──────────────────────────────────────────────
  ROUTE_PLAN: '/Route/plan',
  SAVED_ROUTES: '/saved-routes',
  savedRoute: (id: string) => `/saved-routes/${id}` as const,
  savedRouteRate: (id: string) => `/saved-routes/${id}/rate` as const,

  // ── Stations ───────────────────────────────────────────
  STATIONS_BASE: '/stations/base',
  STATIONS_GOOGLE: '/stations/google',
  stationDetail: (id: string | number) => `/stations/${id}` as const,
  STATIONS_AMENITIES: '/stations/amenities',
  STATIONS_TOURIST_SPOTS: '/stations/tourist-spots',

  // ── Reviews & Reports ──────────────────────────────────
  REVIEWS: '/reviews',
  reviewsByStation: (stationId: string) => `/reviews/${stationId}` as const,
  reviewDelete: (reviewId: string) => `/reviews/${reviewId}` as const,
  REPORTS: '/reports',

  // ── Maps ───────────────────────────────────────────────
  MAPS_AUTOCOMPLETE: '/maps/autocomplete',
  mapsPlaceDetails: (placeId: string) => `/maps/place-details/${placeId}` as const,
  MAPS_REVERSE_GEOCODE: '/maps/reverse-geocode',

  // ── Weather ────────────────────────────────────────────
  WEATHER: '/weather',
} as const;
