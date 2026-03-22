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
  plugType?: string;
  // Persistent Settings
  passengers?: number;
  extraWeight?: number;
  climateControl?: boolean;
  drivingStyle?: 'eco' | 'normal' | 'sport';
  maxSpeed?: number;
  refConsumption?: number;
  preferredPlugTypes?: string[];
}
