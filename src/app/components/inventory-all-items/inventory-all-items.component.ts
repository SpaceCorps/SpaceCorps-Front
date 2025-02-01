import { Component, Input, OnInit } from '@angular/core';
import { InventoryItem } from '../../models/player/InventoryItem';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-inventory-all-items',
  imports: [],
  templateUrl: './inventory-all-items.component.html',
  styleUrl: './inventory-all-items.component.scss'
})
export class InventoryAllItemsComponent implements OnInit {

  @Input({
    required: true
  }) items?: InventoryItem[] = [];

  constructor(private apiService: ApiService, private authService: AuthService) {

  }

  categorizedItems: Map<string, InventoryItem[]> =
    new Map<string, InventoryItem[]>();

  async ngOnInit() {

    const username = this.authService.state().username;

    if (!username) {
      console.error("Username was not provided, can not load component.");
      return;
    }

    if (this.items === null || this.items === undefined) {
      console.warn("Inventory items were not provided, loading them from the server...");

      const inventory = await firstValueFrom(this.apiService.getUserInventory(username));
      this.items = inventory.items;
    }

    this.categorizeItems();

    console.log("Items loaded and sorted in inventory: ", this.items);
  }

  categorizeItems() {
    // Categorize items
    this.items?.forEach(item => {
      if (!this.categorizedItems.has(item.itemType)) {
        this.categorizedItems.set(item.itemType, [item]);
      } else {
        this.categorizedItems.get(item.itemType)!.push(item);
      }
    });

    // Sort items per category
    this.categorizedItems.forEach((items) => {
      items.sort((a, b) => a.name.localeCompare(b.name));
    });
  }
}
