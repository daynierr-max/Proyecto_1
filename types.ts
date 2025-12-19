
export type EnergyLevel = 'low' | 'medium' | 'high';

export interface PriceData {
  hour: number;
  price: number; // in €/kWh
  level: EnergyLevel;
}

export interface Appliance {
  id: string;
  name: string;
  icon: string;
  avgConsumption: number; // kWh per use
  description: string;
}

export interface Recommendation {
  title: string;
  subtitle: string;
  color: string;
  costEstimate: string;
}
