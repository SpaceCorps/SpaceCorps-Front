import { Shield } from '../../player/Items';

export const defaultShields: Shield[] = [
  {
    name: 'Default Shield',
    itemType: 'Shield',
    id: 1,
    capacity: 10000,
    rechargeRate: 600,
    passiveRechargeRate: 0,
    absorbance: 0.8,
    shieldCellSlotCount: 2,
    priceCats: 60000,
    priceThulium: 0,
  },
];
