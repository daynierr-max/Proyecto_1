
import { Appliance, PriceData } from './types';

export const APPLIANCES: Appliance[] = [
  { id: 'washer', name: 'Lavadora', icon: '🧺', avgConsumption: 0.8, description: 'Ciclo eco 40-60º' },
  { id: 'dishwasher', name: 'Lavavajillas', icon: '🍽️', avgConsumption: 1.2, description: 'Carga completa' },
  { id: 'oven', name: 'Horno', icon: '🍕', avgConsumption: 2.0, description: '60 min de uso' },
  { id: 'ev', name: 'Coche Eléctrico', icon: '🚗', avgConsumption: 10.0, description: 'Carga parcial' },
  { id: 'dryer', name: 'Secadora', icon: '💨', avgConsumption: 2.5, description: 'Secado completo' }
];

export const MOCK_PRICES: PriceData[] = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  price: 0.10 + Math.random() * 0.15,
  level: i < 8 ? 'low' : (i > 18 && i < 22 ? 'high' : 'medium')
}));

export const THEME = {
  low: {
    bg: 'bg-green-500',
    text: 'text-green-500',
    lightBg: 'bg-green-50',
    glow: 'shadow-[0_0_80px_rgba(34,197,94,0.5)]',
    label: 'Buen momento',
    message: 'Ahorra ahora'
  },
  medium: {
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    lightBg: 'bg-orange-50',
    glow: 'shadow-[0_0_80px_rgba(249,115,22,0.5)]',
    label: 'Precio medio',
    message: 'Espera si puedes'
  },
  high: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    lightBg: 'bg-red-50',
    glow: 'shadow-[0_0_80px_rgba(239,68,68,0.5)]',
    label: 'Hora cara',
    message: 'Evita consumos'
  }
};
