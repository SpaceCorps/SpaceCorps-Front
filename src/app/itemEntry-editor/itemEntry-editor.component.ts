import { Component, inject, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons/faArrowsRotate';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { getFieldsForItemCategory, SellableItems } from '../models/player/Items';
import {
  defaultEngines,
  defaultThrusters,
  defaultLasers,
  defaultLaserAmps,
  defaultShields,
  defaultShieldCells,
  defaultShips,
  defaultLaserAmmos,
} from '../models/dataEntries/itemEntryGenScripts';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-itemEntry-editor',
  imports: [FormsModule, FaIconComponent],
  templateUrl: './itemEntry-editor.component.html',
  styleUrl: './itemEntry-editor.component.scss',
})
export class ItemEntryEditorComponent {
  protected selectedCategory: SellableItems['itemType'] | null = null;
  protected itemCategories: SellableItems['itemType'][] = [
    'Engine',
    'Thruster',
    'Laser',
    'LaserAmp',
    'LaserAmmo',
    'Shield',
    'ShieldCell',
    'Ship',
  ];

  protected items: SellableItems[] = [];
  protected newItem: SellableItems | null = null;

  stateService = inject(StateService);

  constructor() {
    // Set up effect to watch shop items changes
    effect(() => {
      const currentShopItems = this.stateService.currentShopItems();
      if (currentShopItems && this.selectedCategory) {
        this.items = currentShopItems[this.selectedCategory] || [];
      }
    });
  }

  protected selectCategory(category: SellableItems['itemType']) {
    if (this.selectedCategory === category) {
      return;
    } else {
      this.selectedCategory = category;
      this.newItem = this.createNewItemForCategory(category);
      this.stateService.fetchShopItems(category);
    }
  }

  protected createNewItem() {
    if (this.newItem) {
      const oldCategory = this.newItem.itemType;
      this.stateService.createNewItemEntry(this.newItem).then(() => {
        this.stateService.fetchShopItems(oldCategory);
      });
      this.newItem = null;
    }
  }

  protected createNewItemForCategory(
    category: SellableItems['itemType']
  ): SellableItems {
    const fields = getFieldsForItemCategory(category);
    const newItem: Partial<SellableItems> = { itemType: category };
    fields.forEach((field) => {
      newItem[field.key] = '';
    });
    return newItem as SellableItems;
  }

  trackByKey(index: number, item: { key: string }): string {
    return item.key;
  }

  protected deleteItem(item: SellableItems) {
    if (this.selectedCategory) {
      const oldCategory = this.selectedCategory;
      this.stateService.deleteItemEntry(item).then(() => {
        this.stateService.fetchShopItems(oldCategory);
      });
    }
  }

  protected readonly faArrowsRotate = faArrowsRotate;

  generateDefaultItemsForCategory(selectedCategory: SellableItems['itemType']) {
    switch (selectedCategory) {
      case 'Engine':
        this.generateDefaultEngineItems();
        break;
      case 'Thruster':
        this.generateDefaultThrusterItems();
        break;
      case 'Laser':
        this.generateDefaultLaserItems();
        break;
      case 'LaserAmp':
        this.generateDefaultLaserAmpItems();
        break;
      case 'Shield':
        this.generateDefaultShieldItems();
        break;
      case 'ShieldCell':
        this.generateDefaultShieldCellItems();
        break;
      case 'Ship':
        this.generateDefaultShipItems();
        break;
      case 'LaserAmmo':
        this.generateDefaultLaserAmmoItems();
        break;
      default:
        console.error('No default items for category', selectedCategory);
    }
    setTimeout(() => {
      if (this.selectedCategory) {
        this.stateService.fetchShopItems(this.selectedCategory);
      }
    }, 300);
  }

  private async generateDefaultEngineItems() {
    for (const engine of defaultEngines) {
      await this.stateService.createNewItemEntry(engine);
    }
  }

  private async generateDefaultThrusterItems() {
    for (const thruster of defaultThrusters) {
      await this.stateService.createNewItemEntry(thruster);
    }
  }

  private async generateDefaultLaserItems() {
    for (const laser of defaultLasers) {
      await this.stateService.createNewItemEntry(laser);
    }
  }

  private async generateDefaultLaserAmpItems() {
    for (const laserAmp of defaultLaserAmps) {
      await this.stateService.createNewItemEntry(laserAmp);
    }
  }

  private async generateDefaultShieldItems() {
    for (const shield of defaultShields) {
      await this.stateService.createNewItemEntry(shield);
    }
  }

  private async generateDefaultShieldCellItems() {
    for (const shieldCell of defaultShieldCells) {
      await this.stateService.createNewItemEntry(shieldCell);
    }
  }

  private async generateDefaultShipItems() {
    for (const ship of defaultShips) {
      await this.stateService.createNewItemEntry(ship);
    }
  }

  private async generateDefaultLaserAmmoItems() {
    for (const laserAmmo of defaultLaserAmmos) {
      await this.stateService.createNewItemEntry(laserAmmo);
    }
  }

  protected async createAllDefaultItems() {
    await Promise.all([
      this.generateDefaultEngineItems(),
      this.generateDefaultThrusterItems(),
      this.generateDefaultLaserItems(),
      this.generateDefaultLaserAmpItems(),
      this.generateDefaultShieldItems(),
      this.generateDefaultShieldCellItems(),
      this.generateDefaultShipItems(),
      this.generateDefaultLaserAmmoItems(),
    ]);

    setTimeout(() => {
      if (this.selectedCategory) {
        this.stateService.fetchShopItems(this.selectedCategory);
      }
    }, 300);
  }

  protected readonly getFieldsForItemCategory = getFieldsForItemCategory;
}
