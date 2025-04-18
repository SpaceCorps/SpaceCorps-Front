import { Component, OnInit, inject, effect } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import {
  getFieldsForItemCategory as getAllFieldsForItemCategory,
  SellableItems,
} from '../models/player/Items';
import { ShipModelComponent } from '../components/ship-model/ship-model.component';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-ship-yard',
  templateUrl: './ship-yard.component.html',
  imports: [NgForOf, NgIf, ShipModelComponent],
  styleUrls: ['./ship-yard.component.scss'],
})
export class ShipYardComponent implements OnInit {
  categories: SellableItems['itemType'][] = [
    'Ship',
    'Laser',
    'LaserAmp',
    'Shield',
    'ShieldCell',
    'Engine',
    'Thruster',
    'LaserAmmo',
  ];

  selectedCategory: SellableItems['itemType'] | null = null;
  items: SellableItems[] = [];
  playerBalance = { credits: 0, thulium: 0 };
  username: string | null = null;

  private stateService = inject(StateService);

  constructor() {
    // Set up effect to watch player data changes
    effect(() => {
      const playerData = this.stateService.currentPlayer();
      if (playerData) {
        this.playerBalance.credits = playerData.credits ?? 0;
        this.playerBalance.thulium = playerData.thulium ?? 0;
        this.username = playerData.username;
      } else {
        this.playerBalance.credits = 0;
        this.playerBalance.thulium = 0;
        this.username = null;
      }
    });

    // Set up effect to watch shop items changes
    effect(() => {
      const currentShopItems = this.stateService.currentShopItems();
      if (currentShopItems && this.selectedCategory) {
        this.items = currentShopItems[this.selectedCategory] || [];
      }
    });
  }

  async ngOnInit() {
    // Always fetch player data when the page opens
    await this.stateService.fetchPlayerInfo();
  }

  selectCategory(category: SellableItems['itemType']) {
    this.selectedCategory = category;
    this.stateService.fetchShopItems(category);
  }

  async buyItem(item: SellableItems) {
    if (!this.username) {
      alert('No username found');
      return;
    }

    // Get current player data to check balance
    const playerData = this.stateService.currentPlayer();
    if (!playerData) {
      alert('Player data not loaded');
      return;
    }

    // Check if player has enough currency
    if (item.priceCredits > playerData.credits || item.priceThulium > playerData.thulium) {
      alert('Insufficient balance');
      return;
    }

    try {
      const success = await this.stateService.buyItem({
        username: this.username,
        itemId: Number(item.id),
        itemType: item.itemType,
      });

      if (success) {
        // Refresh the shop items for the current category to reflect any changes
        if (this.selectedCategory) {
          await this.stateService.fetchShopItems(this.selectedCategory);
        }
      } else {
        alert('Failed to buy item. Please check your balance and try again.');
      }
    } catch (error) {
      console.error('Error buying item', error);
      alert('An error occurred while trying to buy the item.');
    }
  }

  protected getFieldsForItemCategory(category: SellableItems['itemType']) {
    const fields = getAllFieldsForItemCategory(category);
    return fields.filter(
      (field) =>
        !['name', 'id', 'priceCredits', 'priceThulium'].includes(field.key)
    );
  }

  protected readonly JSON = JSON;
}
