import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import {
  getFieldsForItemCategory as getAllFieldsForItemCategory,
  SellableItems,
} from '../models/player/Items';
import { ShipModelComponent } from '../components/ship-model/ship-model.component';

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

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.fetchPlayerData();
  }

  selectCategory(category: SellableItems['itemType']) {
    this.selectedCategory = category;
    this.fetchItems(category);
  }

  fetchItems(category: SellableItems['itemType']) {
    this.apiService.getItemEntriesByCategory(category).subscribe((data) => {
      this.items = data as SellableItems[];
    });
  }

  fetchPlayerData() {
    if (!this.username) {
      const playerData = this.authService.getPlayerData();

      if (!playerData) {
        console.error('Player data not found');
        return;
      }

      this.username = playerData.username;
    }

    this.apiService
      .getPlayerInfo({ username: this.username })
      .subscribe((data) => {
        this.playerBalance.credits = data.credits;
        this.playerBalance.thulium = data.thulium;
      });
  }

  buyItem(item: SellableItems) {
    if (this.username === null) {
      alert('No username found');
      return;
    }

    if (item.priceCredits > this.playerBalance.credits) {
      alert('Not enough credits');
      return;
    }

    if (item.priceThulium > this.playerBalance.thulium) {
      alert('Not enough thulium');
      return;
    }

    this.apiService
      .buyItem({
        username: this.username,
        itemId: item.id,
        itemType: item.itemType,
      })
      .subscribe({
        next: (data) => {
          console.log(data);
          setTimeout(() => {
            this.fetchPlayerData();
          }, 200);
        },
        error: (error) => {
          console.error('Error buying item', error);
        },
      });
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
