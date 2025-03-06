import {Component, OnInit} from '@angular/core';
import {InventoryActiveShipComponent} from '../components/inventory-active-ship/inventory-active-ship.component';
import {ApiService} from '../services/api.service';
import {AuthService} from '../services/auth.service';
import {Inventory} from '../models/player/Inventory';
import {InventoryAllItemsComponent} from '../components/inventory-all-items/inventory-all-items.component';
import {SellableItem, SellableItems} from '../models/player/Items';
import {InventorySelectedItemComponent} from "../components/inventory-selected-item/inventory-selected-item.component";

@Component({
  selector: 'app-pilot-inventory',
  imports: [
    InventoryActiveShipComponent,
    InventoryAllItemsComponent,
    InventorySelectedItemComponent
  ],
  templateUrl: './pilot-inventory.component.html',
  styleUrl: './pilot-inventory.component.scss'
})
export class PilotInventoryComponent implements OnInit {

  protected inventory?: Inventory;
  selectedItem: SellableItems | null = null;

  constructor(private apiService: ApiService, private authService: AuthService) {
  }

  ngOnInit() {
    const playerData = this.authService.getPlayerData();
    if (!playerData) return console.error('No player data found thus cannot get username and load inventory');

    this.apiService.getUserInventory(playerData?.username).subscribe((inventory: Inventory) => {
      this.inventory = inventory;
    });

  }

  handleItemSelection($event: SellableItems) {
    this.selectedItem = $event;
  }

  handleItemDragged(item: SellableItems) {
    // console.log('Dragged item:', item);
  }


}
