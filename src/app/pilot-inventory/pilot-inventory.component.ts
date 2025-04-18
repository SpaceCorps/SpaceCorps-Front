import { Component, OnInit, effect } from '@angular/core';
import { InventoryActiveShipComponent } from '../components/inventory-active-ship/inventory-active-ship.component';
import { AuthService } from '../services/auth.service';
import { Inventory } from '../models/player/Inventory';
import { InventoryAllItemsComponent } from '../components/inventory-all-items/inventory-all-items.component';
import { SellableItems } from '../models/player/Items';
import { InventorySelectedItemComponent } from '../components/inventory-selected-item/inventory-selected-item.component';
import { StateService } from '../services/state.service';

const ItemTypes = {
  Laser: 'Laser',
  LaserAmp: 'LaserAmp',
  Shield: 'Shield',
  ShieldCell: 'ShieldCell',
  Engine: 'Engine',
  Thruster: 'Thruster',
  LaserAmmo: 'LaserAmmo',
  Ship: 'Ship',
};

@Component({
  selector: 'app-pilot-inventory',
  imports: [
    InventoryActiveShipComponent,
    InventoryAllItemsComponent,
    InventorySelectedItemComponent,
  ],
  templateUrl: './pilot-inventory.component.html',
  styleUrl: './pilot-inventory.component.scss',
})
export class PilotInventoryComponent implements OnInit {
  protected username?: string;
  protected inventory?: Inventory;
  selectedItem: SellableItems | null = null;

  constructor(
    private authService: AuthService,
    private stateService: StateService
  ) {
    // Set up effect to watch inventory changes
    effect(() => {
      const currentInventory = this.stateService.currentInventory();
      if (currentInventory) {
        this.inventory = currentInventory;
      }
    });
  }

  ngOnInit() {
    this.authService.authState$.subscribe(state => {
      if (!state.username) {
        return console.error('No username found thus cannot load inventory');
      }
      this.username = state.username;
      this.stateService.fetchPlayerInventory(state.username);
    });
  }

  handleItemSelection($event: SellableItems) {
    this.selectedItem = $event;
  }

  handleItemDragged() {
    // console.log('Dragged item:', item);
  }

  handleItemDroppedEquipCase($event: {
    draggedItem: SellableItems;
    mapping: { childrenKey: string; maxSlots: number; title: string };
    slotIndex: number;
  }) {
    const { draggedItem, mapping, slotIndex } = $event;

    if (!this.username) return console.error('No username found');

    console.log(
      `Dragged "${draggedItem.name}" from inventory to ${mapping.title} slot #${slotIndex}`,
      draggedItem
    );
    if (this.selectedItem) {
      const childArray = this.selectedItem[mapping.childrenKey];

      if (slotIndex < mapping.maxSlots && childArray) {
        if (!childArray[slotIndex]) {
          switch (draggedItem.itemType) {
            case ItemTypes.LaserAmp:
              this.stateService.equipLaserAmp({
                username: this.username,
                laserId: this.selectedItem.id,
                laserAmpId: draggedItem.id,
              });
              break;
            case ItemTypes.Laser:
              this.stateService.equipLaser({
                username: this.username,
                shipId: this.selectedItem.id,
                laserId: draggedItem.id,
              });
              break;
            case ItemTypes.ShieldCell:
              this.stateService.equipShieldCell({
                username: this.username,
                shieldCellId: draggedItem.id,
                shieldId: this.selectedItem.id,
              });
              break;
            case ItemTypes.Shield:
              this.stateService.equipShield({
                username: this.username,
                shieldId: draggedItem.id,
                shipId: this.selectedItem.id,
              });
              break;
            case ItemTypes.Engine:
              this.stateService.equipEngine({
                username: this.username,
                engineId: draggedItem.id,
                shipId: this.selectedItem.id,
              });
              break;
            case ItemTypes.Thruster:
              this.stateService.equipThruster({
                username: this.username,
                thrusterId: draggedItem.id,
                engineId: this.selectedItem.id,
              });
              break;
            default:
              console.error(`Unknown item type: ${draggedItem.itemType}`);
              break;
          }
        } else {
          console.warn(
            `Slot ${slotIndex} in ${mapping.title} is already occupied.`
          );
        }
      }
    }
  }

  handleItemUnequipEvent(event: {
    childId: number;
    parentId: number;
    itemType: string;
  }) {
    switch (event.itemType) {
      case ItemTypes.LaserAmp:
        this.stateService.unequipLaserAmp({
          username: this.username!,
          laserId: event.parentId,
          laserAmpId: event.childId,
        });
        break;
      case ItemTypes.Laser:
        this.stateService.unequipLaser({
          username: this.username!,
          shipId: event.parentId,
          laserId: event.childId,
        });
        break;
      case ItemTypes.ShieldCell:
        this.stateService.unequipShieldCell({
          username: this.username!,
          shieldCellId: event.childId,
          shieldId: event.parentId,
        });
        break;
      case ItemTypes.Shield:
        this.stateService.unequipShield({
          username: this.username!,
          shieldId: event.childId,
          shipId: event.parentId,
        });
        break;
      case ItemTypes.Engine:
        this.stateService.unequipEngine({
          username: this.username!,
          engineId: event.childId,
          shipId: event.parentId,
        });
        break;
      case ItemTypes.Thruster:
        this.stateService.unequipThruster({
          username: this.username!,
          thrusterId: event.childId,
          engineId: event.parentId,
        });
        break;
      default:
        console.error(`Unknown item type: ${event.itemType}`);
        break;
    }
  }
}
