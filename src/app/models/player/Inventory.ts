import { InventoryItem } from './InventoryItem';

export type Inventory = {
  cats: number;
  thulium: number;
  activeShipName: string;
  items: InventoryItem[];
}
