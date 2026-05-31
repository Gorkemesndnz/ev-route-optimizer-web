import type { RouteSettings } from "../contexts/RouteContext";

export const ROUTE_SOC_BOUNDS = {
  arrivalSoc: { min: 5, max: 50 },
  stationArrivalSoc: { min: 5, max: 40 },
  stationDepartureSoc: { min: 50, max: 100 },
  stationSpread: 20,
} as const;

type SocKey = "arrivalSoc" | "stationArrivalSoc" | "stationDepartureSoc";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeSocValue(value: unknown, key: SocKey): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const bounds = ROUTE_SOC_BOUNDS[key];
  return clamp(value, bounds.min, bounds.max);
}

export function normalizeStationSocPair(
  stationArrivalSoc: number | null,
  stationDepartureSoc: number | null,
): Pick<RouteSettings, "stationArrivalSoc" | "stationDepartureSoc"> {
  let arrival = normalizeSocValue(stationArrivalSoc, "stationArrivalSoc");
  let departure = normalizeSocValue(stationDepartureSoc, "stationDepartureSoc");

  if (arrival !== null && departure !== null && departure - arrival < ROUTE_SOC_BOUNDS.stationSpread) {
    const maxArrivalForDeparture = departure - ROUTE_SOC_BOUNDS.stationSpread;
    if (maxArrivalForDeparture >= ROUTE_SOC_BOUNDS.stationArrivalSoc.min) {
      arrival = clamp(
        maxArrivalForDeparture,
        ROUTE_SOC_BOUNDS.stationArrivalSoc.min,
        ROUTE_SOC_BOUNDS.stationArrivalSoc.max,
      );
    } else {
      departure = clamp(
        arrival + ROUTE_SOC_BOUNDS.stationSpread,
        ROUTE_SOC_BOUNDS.stationDepartureSoc.min,
        ROUTE_SOC_BOUNDS.stationDepartureSoc.max,
      );
    }
  }

  return { stationArrivalSoc: arrival, stationDepartureSoc: departure };
}

export function normalizeRouteSettingsSoc(settings: RouteSettings): RouteSettings {
  if (settings.smartPlanner) {
    return {
      ...settings,
      arrivalSoc: null,
      stationArrivalSoc: null,
      stationDepartureSoc: null,
    };
  }

  const stationPair = normalizeStationSocPair(
    settings.stationArrivalSoc,
    settings.stationDepartureSoc,
  );

  return {
    ...settings,
    arrivalSoc: normalizeSocValue(settings.arrivalSoc, "arrivalSoc"),
    ...stationPair,
  };
}

