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
        this.playerBalance.credits = playerData.credits;
        this.playerBalance.thulium = playerData.thulium;
        this.username = playerData.username;
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

  ngOnInit() {
    const playerData = this.stateService.currentPlayer();
    if (playerData) {
      this.username = playerData.username;
    }
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

    try {
      await this.stateService.buyItem({
        username: this.username,
        itemId: Number(item.id),
        itemType: item.itemType,
      });
    } catch (error) {
      console.error('Error buying item', error);
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
