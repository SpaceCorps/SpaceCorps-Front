import { Laser } from '../../player/Items';

export const defaultLasers: Laser[] = [
  {
    name: 'Quantum Laser 1',
    itemType: 'Laser',
    id: 1,
    baseDamage: 50,
    criticalChance: 0.1,
    laserAmpSlotCount: 1,
    priceCats: 10000,
    priceThulium: 0,
  },
  {
    name: 'Quantum Laser 2',
    itemType: 'Laser',
    id: 2,
    baseDamage: 60,
    criticalChance: 0.2,
    laserAmpSlotCount: 2,
    priceCats: 20000,
    priceThulium: 0,
  },
  {
    name: 'Quantum Laser 3',
    itemType: 'Laser',
    id: 3,
    baseDamage: 70,
    criticalChance: 0.3,
    laserAmpSlotCount: 3,
    priceCats: 0,
    priceThulium: 10000,
  },
];
