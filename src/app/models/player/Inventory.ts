import { SellableItems } from './Items';

export type Inventory = {
  cats: number;
  thulium: number;
  activeShipName: string;
  items: SellableItems[];
};
