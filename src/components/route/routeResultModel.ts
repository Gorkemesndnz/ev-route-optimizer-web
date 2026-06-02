import type { ChargingStopDto, Location, RouteResultDto, WeatherInfo } from '../../contexts/RouteContext';

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} dk`;
  return `${h}sa ${m}dk`;
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function formatShortAddress(address?: string | null) {
  if (!address) return 'Adres bilinmiyor';
  const parts = address.split(',').map(p => p.trim());

  const filtered = parts.filter(p => !p.includes('+'));
  if (filtered.length <= 2) return filtered.join(', ');

  const lastIndex = filtered.length - 1;
  const isTurkey = filtered[lastIndex].toLowerCase() === 'türkiye' || filtered[lastIndex].toLowerCase() === 'turkey';

  let cityDistrict = isTurkey && filtered.length > 1 ? filtered[lastIndex - 1] : filtered[lastIndex];
  cityDistrict = cityDistrict.replace(/^\d{5}\s*/, '');

  if (filtered[0] === cityDistrict) return filtered[0];

  return `${filtered[0]}, ${cityDistrict}`;
}

export interface TimelineNode {
  type: string;
  location?: string;
  weather?: WeatherInfo | null;
  soc?: number;
  time?: Date;
  arrivalTime?: Date;
  duration?: number;
  distance?: number;
  consumption?: number;
  stop?: ChargingStopDto;
  index?: number;
  coords?: { lat: number; lng: number };
}

export function buildTimelineNodes(routeResult: RouteResultDto | null, routeLocations: Location[]): TimelineNode[] {
  if (!routeResult) return [];
  const routeLegs = Array.isArray((routeResult as { legs?: unknown }).legs) ? routeResult.legs : [];
  const chargingStops = Array.isArray((routeResult as { charging_stops?: unknown }).charging_stops)
    ? routeResult.charging_stops
    : [];

  const nodes: TimelineNode[] = [];
  let currentTime = new Date();

  nodes.push({
    type: 'start',
    location: routeLocations[0]?.value || routeLegs[0]?.from_location || 'Başlangıç',
    weather: routeResult.start_weather,
    soc: routeLegs[0]?.start_soc || 100,
    time: new Date(currentTime)
  });

  const userWaypoints = routeLocations.slice(1, -1);
  userWaypoints.forEach((wp, idx) => {
    nodes.push({
      type: 'waypoint',
      index: idx + 1,
      location: wp.value,
      coords: wp.coords,
    });
  });

  routeLegs.forEach((leg, i) => {
    currentTime = new Date(currentTime.getTime() + leg.duration_min * 60000);

    nodes.push({
      type: 'leg',
      duration: leg.duration_min,
      distance: leg.distance_km,
      consumption: leg.consumption_kwh
    });

    const isLastLeg = i === routeLegs.length - 1;
    if (!isLastLeg) {
      const stop = chargingStops[i];
      if (stop) {
        nodes.push({
          type: 'stop',
          index: i + 1,
          stop,
          arrivalTime: new Date(currentTime)
        });
        currentTime = new Date(currentTime.getTime() + stop.charge_time_min * 60000);
      }
    } else {
      nodes.push({
        type: 'end',
        location: routeLocations[routeLocations.length - 1]?.value || leg.to_location || 'Varış',
        weather: routeResult.end_weather,
        soc: leg.end_soc,
        time: new Date(currentTime)
      });
    }
  });

  return nodes;
}
