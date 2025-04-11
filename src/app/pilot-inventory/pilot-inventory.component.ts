import { Component, OnInit } from '@angular/core';
import { InventoryActiveShipComponent } from '../components/inventory-active-ship/inventory-active-ship.component';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Inventory } from '../models/player/Inventory';
import { InventoryAllItemsComponent } from '../components/inventory-all-items/inventory-all-items.component';
import {
  Engine,
  Laser,
  LaserAmp,
  SellableItems,
  Shield,
  ShieldCell,
  Ship,
  Thruster,
} from '../models/player/Items';
import { InventorySelectedItemComponent } from '../components/inventory-selected-item/inventory-selected-item.component';

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
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const playerData = this.authService.getPlayerData();
    if (!playerData)
      return console.error(
        'No player data found thus cannot get username and load inventory'
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
      draggedItem
    );
    if (this.selectedItem) {
      const childArray = this.selectedItem[mapping.childrenKey];

      if (slotIndex < mapping.maxSlots && childArray) {
        if (!childArray[slotIndex]) {
          switch (draggedItem.itemType) {
            case ItemTypes.LaserAmp:
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
                      (item) => item.id !== draggedItem.id
                    );
                  },
                  error: (err) => {
                    console.error(err);
                  },
                });
              break;
            case ItemTypes.Laser:
              this.apiService
                .equipLaser({
                  username: this.username,
                  shipId: this.selectedItem.id,
                  laserId: draggedItem.id,
                })
                .subscribe({
                  next: (response) => {
                    childArray[slotIndex] = draggedItem;
                    this.inventory!.items = this.inventory!.items.filter(
                      (item) => item.id !== draggedItem.id
                    );
                  },
                  error: (err) => {
                    console.error(err);
                  },
                });
              break;
            case ItemTypes.ShieldCell:
              this.apiService
                .equipShieldCell({
                  username: this.username,
                  shieldCellId: draggedItem.id,
                  shieldId: this.selectedItem.id,
                })
                .subscribe({
                  next: (response) => {
                    childArray[slotIndex] = draggedItem;
                    this.inventory!.items = this.inventory!.items.filter(
                      (item) => item.id !== draggedItem.id
                    );
                  },
                  error: (err) => {
                    console.error(err);
                  },
                });
              break;
            case ItemTypes.Shield:
              this.apiService
                .equipShield({
                  username: this.username,
                  shieldId: draggedItem.id,
                  shipId: this.selectedItem.id,
                })
                .subscribe({
                  next: (response) => {
                    childArray[slotIndex] = draggedItem;
                    this.inventory!.items = this.inventory!.items.filter(
                      (item) => item.id !== draggedItem.id
                    );
                  },
                  error: (err) => {
                    console.error(err);
                  },
                });
              break;
            case ItemTypes.Engine:
              this.apiService
                .equipEngine({
                  username: this.username,
                  engineId: draggedItem.id,
                  shipId: this.selectedItem.id,
                })
                .subscribe({
                  next: (response) => {
                    childArray[slotIndex] = draggedItem;
                    this.inventory!.items = this.inventory!.items.filter(
                      (item) => item.id !== draggedItem.id
                    );
                  },
                  error: (err) => {
                    console.error(err);
                  },
                });
              break;
            case ItemTypes.Thruster:
              this.apiService
                .equipThruster({
                  username: this.username,
                  thrusterId: draggedItem.id,
                  engineId: this.selectedItem.id,
                })
                .subscribe({
                  next: (response) => {
                    childArray[slotIndex] = draggedItem;
                    this.inventory!.items = this.inventory!.items.filter(
                      (item) => item.id !== draggedItem.id
                    );
                  },
                  error: (err) => {
                    console.error(err);
                  },
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
        this.apiService
          .unequipLaserAmp({
            username: this.username!,
            laserId: event.parentId,
            laserAmpId: event.childId,
          })
          .subscribe({
            next: (response) => {
              const laser = this.inventory!.items.find(
                (i) => i.id === event.parentId
              ) as Laser;
              const laserAmp = laser.laserAmps!.find(
                (i) => i.id === event.childId
              ) as LaserAmp;
              this.inventory!.items = [...this.inventory!.items, laserAmp];
              laser.laserAmps = laser.laserAmps!.filter(
                (i) => i.id !== event.childId
              );
              this.selectedItem = laser;
            },
            error: (err) => {
              console.error(err);
            },
          });
        break;
      case ItemTypes.Laser:
        this.apiService
          .unequipLaser({
            username: this.username!,
            shipId: event.parentId,
            laserId: event.childId,
          })
          .subscribe({
            next: (response) => {
              const ship = this.inventory!.items.find(
                (i) => i.id === event.parentId
              ) as Ship;
              const laser = ship.lasers!.find(
                (i) => i.id === event.childId
              ) as Laser;
              this.inventory!.items = [...this.inventory!.items, laser];
              ship.lasers = ship.lasers!.filter((i) => i.id !== event.childId);
              this.selectedItem = ship;
            },
            error: (err) => {
              console.error(err);
            },
          });
        break;
      case ItemTypes.ShieldCell:
        this.apiService
          .unequipShieldCell({
            username: this.username!,
            shieldCellId: event.childId,
            shieldId: event.parentId,
          })
          .subscribe({
            next: (response) => {
              const shield = this.inventory!.items.find(
                (i) => i.id === event.parentId
              ) as Shield;
              const shieldCell = shield.shieldCells!.find(
                (i) => i.id === event.childId
              ) as ShieldCell;
              this.inventory!.items = [...this.inventory!.items, shieldCell];
              shield.shieldCells = shield.shieldCells!.filter(
                (i) => i.id !== event.childId
              );
              this.selectedItem = shield;
            },
            error: (err) => {
              console.error(err);
            },
          });
        break;
      case ItemTypes.Shield:
        this.apiService
          .unequipShield({
            username: this.username!,
            shieldId: event.childId,
            shipId: event.parentId,
          })
          .subscribe({
            next: (response) => {
              const ship = this.inventory!.items.find(
                (i) => i.id === event.parentId
              ) as Ship;
              const shield = ship.shields!.find(
                (i) => i.id === event.childId
              ) as Shield;
              this.inventory!.items = [...this.inventory!.items, shield];
              ship.shields = ship.shields!.filter(
                (i) => i.id !== event.childId
              );
              this.selectedItem = ship;
            },
            error: (err) => {
              console.error(err);
            },
          });
        break;
      case ItemTypes.Engine:
        this.apiService
          .unequipEngine({
            username: this.username!,
            engineId: event.childId,
            shipId: event.parentId,
          })
          .subscribe({
            next: () => {
              const ship = this.inventory!.items.find(
                (i) => i.id === event.parentId
              ) as Ship;
              const engine = ship.engines!.find(
                (i) => i.id === event.childId
              ) as Engine;
              this.inventory!.items = [...this.inventory!.items, engine];
              ship.engines = ship.engines!.filter(
                (i) => i.id !== event.childId
              );
              this.selectedItem = ship;
            },
            error: (err) => {
              console.error(err);
            },
          });
        break;
      case ItemTypes.Thruster:
        this.apiService
          .unequipThruster({
            username: this.username!,
            thrusterId: event.childId,
            engineId: event.parentId,
          })
          .subscribe({
            next: () => {
              const engine = this.inventory!.items.find(
                (i) => i.id === event.parentId
              ) as Engine;
              const thruster = engine.thrusters!.find(
                (i) => i.id === event.childId
              ) as Thruster;
              this.inventory!.items = [...this.inventory!.items, thruster];
              engine.thrusters = engine.thrusters!.filter(
                (i) => i.id !== event.childId
              );
              this.selectedItem = engine;
            },
            error: (err) => {
              console.error(err);
            },
          });
        break;
      default:
        console.error(`Unknown item type: ${event.itemType}`);
        break;
    }
  }
}
