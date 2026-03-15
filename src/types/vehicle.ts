export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  customName: string;
  soc: number;
  batteryCapacity?: number;
  maxChargingPower?: number;
  rangeWLTP?: number;
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
