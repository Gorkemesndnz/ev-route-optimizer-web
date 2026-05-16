// Fields from VehicleResponse (backend source of truth)
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  year?: number;
  customName: string;
  soc: number;
  isActive?: boolean;
  batteryCapacityKwh?: number;
  maxChargingPowerKw?: number;
  rangeWLTP?: number;
  realRangeKm?: number;
  // Driver settings — not stored in backend; merged from localStorage overlay by VehicleContext
  passengers?: number;
  extraWeight?: number;
  climateControl?: boolean;
  drivingStyle?: 'eco' | 'normal' | 'sport';
  maxSpeed?: number;
  refConsumption?: number | null;
  preferredPlugTypes?: string[];
}
