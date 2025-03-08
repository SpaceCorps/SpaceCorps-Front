import {Component, Input, OnInit} from '@angular/core';
import {Engine, Laser, SellableItems, Shield, Ship} from '../../models/player/Items';
import {ApiService} from '../../services/api.service';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-inventory-selected-item',
  templateUrl: './inventory-selected-item.component.html',
  styleUrl: './inventory-selected-item.component.scss'
})
export class InventorySelectedItemComponent implements OnInit {

  constructor(private apiService: ApiService, private authService: AuthService) {
  }

  @Input({
    required: true
  }) selectedItem: SellableItems | null = null;
  draggedItem: SellableItems | null = null;
  username!: string;

  ngOnInit(): void {
    this.username = this.authService.getPlayerData()!.username;
    if (!this.username) {
      console.error("Username was not provided, can not load component.");
      return;
    }
  }

  getChildMapping(item: SellableItems): { childrenKey: string, maxSlots: number, title: string }[] {
    switch (item.itemType) {
      case 'Ship':
        return [
          {childrenKey: 'engines', maxSlots: (item as Ship).engineSlotCount, title: 'Engines'},
          {childrenKey: 'shields', maxSlots: (item as Ship).shieldSlotCount, title: 'Shields'},
          {childrenKey: 'lasers', maxSlots: (item as Ship).laserSlotCount, title: 'Lasers'}
        ];
      case 'Laser':
        return [
          {childrenKey: 'laserAmps', maxSlots: (item as Laser).laserAmpSlotCount, title: 'Laser Amps'}
        ];
      case 'Shield':
        return [
          {childrenKey: 'shieldCells', maxSlots: (item as Shield).shieldCellSlotCount, title: 'Shield Cells'}
        ];
      case 'Engine':
        return [
          {childrenKey: 'thrusters', maxSlots: (item as Engine).thrusterSlotCount, title: 'Thrusters'}
        ];
      default:
        return [];
    }
  }

  getSlots(maxSlots: number): number[] {
    return Array.from({length: maxSlots}, (_, i) => i);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragStart(event: DragEvent, item: SellableItems) {
    this.draggedItem = item;
  }

  onDrop(event: DragEvent, mapping: { childrenKey: string, maxSlots: number, title: string }, slotIndex: number) {
    event.preventDefault();
    const data = event.dataTransfer?.getData('text/plain');
    if (data) {
      const draggedItem: SellableItems = JSON.parse(data);
      console.log(`Dragged "${draggedItem.name}" from inventory to ${mapping.title} slot #${slotIndex}`, draggedItem);
      if (this.selectedItem) {
        const childArray = this.selectedItem[mapping.childrenKey];

        if (slotIndex < mapping.maxSlots && childArray) {
          if (!childArray[slotIndex]) {

            this.apiService.equipLaserAmp({
              username: this.username,
              laserId: this.selectedItem.id,
              laserAmpId: draggedItem.id,
            }).subscribe({
              next: (response) => {
                childArray[slotIndex] = draggedItem;
                console.log(`Assigned "${draggedItem.name}" to ${mapping.title} slot #${slotIndex}`);
                console.log(response);
              },
              error: (err) => {
                console.error(err);
              }
            })
          } else {
            console.warn(`Slot ${slotIndex} in ${mapping.title} is already occupied.`);
          }
        }
      }
    }
  }

}
