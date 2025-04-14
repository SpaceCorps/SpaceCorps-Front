import { SellableItems } from './Items';

export type Inventory = {
  credits: number;
  thulium: number;
  activeShipName: string;
  items: SellableItems[];
};
