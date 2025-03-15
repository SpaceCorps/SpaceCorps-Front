import { Component, OnInit } from '@angular/core';
import { InventoryActiveShipComponent } from '../components/inventory-active-ship/inventory-active-ship.component';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Inventory } from '../models/player/Inventory';
import { InventoryAllItemsComponent } from '../components/inventory-all-items/inventory-all-items.component';
import { Laser, SellableItems } from '../models/player/Items';
import { InventorySelectedItemComponent } from '../components/inventory-selected-item/inventory-selected-item.component';

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
    private apiService: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const playerData = this.authService.getPlayerData();
    if (!playerData)
      return console.error(
        'No player data found thus cannot get username and load inventory',
      );
    this.username = playerData?.username;
    this.apiService
      .getUserInventory(playerData?.username)
      .subscribe((inventory: Inventory) => {
        this.inventory = inventory;
      });
  }

  handleItemSelection($event: SellableItems) {
    this.selectedItem = $event;
  }

  handleItemDragged(item: SellableItems) {
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
      draggedItem,
    );
    if (this.selectedItem) {
      const childArray = this.selectedItem[mapping.childrenKey];

      if (slotIndex < mapping.maxSlots && childArray) {
        if (!childArray[slotIndex]) {
          this.apiService
            .equipLaserAmp({
              username: this.username,
              laserId: this.selectedItem.id,
              laserAmpId: draggedItem.id,
            })
            .subscribe({
              next: (response) => {
                childArray[slotIndex] = draggedItem;
                this.inventory!.items = this.inventory!.items.filter(
                  (item) => item.id !== draggedItem.id,
                );
              },
              error: (err) => {
                console.error(err);
              },
            });
        } else {
          console.warn(
            `Slot ${slotIndex} in ${mapping.title} is already occupied.`,
          );
        }
      }
    }
  }

  handleItemUnequipEvent(event: { laserAmpId: number; laserId: number }) {
    this.apiService
      .unequipLaserAmp({
        username: this.username!,
        ...event,
      })
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
