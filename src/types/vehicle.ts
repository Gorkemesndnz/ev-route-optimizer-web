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
}
