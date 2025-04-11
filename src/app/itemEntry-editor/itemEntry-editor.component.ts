import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons/faArrowsRotate';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { firstValueFrom } from 'rxjs';
import {
  Engine,
  getFieldsForItemCategory,
  LaserAmmo,
  LaserAmp,
  Laser,
  SellableItems,
  ShieldCell,
  Shield,
  Ship,
  Thruster,
} from '../models/player/Items';
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

  constructor(private apiService: ApiService) {}

  ngOnInit() {}

  protected selectCategory(category: SellableItems['itemType']) {
    if (this.selectedCategory === category) {
      return;
    } else {
      this.selectedCategory = category;
      this.newItem = this.createNewItemForCategory(category);
      this.fetchItems(category);
    }
  }

  protected fetchItems(category: SellableItems['itemType']) {
    this.apiService.getItemEntriesByCategory(category).subscribe({
      next: (data: any) => {
        this.items = data;
      },
      error: (err: any) => {
        console.error('Error fetching items', err);
      },
    });
  }

  protected createNewItem() {
    if (this.newItem) {
      const oldCategory = this.newItem.itemType;
      this.apiService.createNewItemEntry(this.newItem).subscribe({
        next: () => {
          this.fetchItems(oldCategory);
        },
        error: (err: any) => {
          console.error('Error creating new item', err);
        },
      });
      this.newItem = null;
    }
  }

  protected createNewItemForCategory(
    category: SellableItems['itemType']
  ): SellableItems {
    const fields = getFieldsForItemCategory(category);
    const newItem: { [key: string]: any } = { itemType: category };
    fields.forEach((field) => {
      newItem[field.key] = '';
    });
    return newItem as SellableItems;
  }

  trackByKey(index: number, item: any): any {
    return item.key;
  }

  protected deleteItem(item: SellableItems) {
    if (this.selectedCategory) {
      const oldCategory = this.selectedCategory;
      this.apiService.deleteItemEntry(item).subscribe({
        next: () => {
          this.fetchItems(oldCategory);
        },
        error: (err: any) => {
          console.error('Error deleting item', err);
        },
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
      this.fetchItems(selectedCategory);
    }, 300);
  }

  private generateDefaultEngineItems() {
    defaultEngines.map(async (engine: Engine) => {
      await firstValueFrom(this.apiService.createNewItemEntry(engine));
    });
  }

  private generateDefaultThrusterItems() {
    defaultThrusters.map(async (thruster: Thruster) => {
      await firstValueFrom(this.apiService.createNewItemEntry(thruster));
    });
  }

  private generateDefaultLaserItems() {
    defaultLasers.map(async (laser: Laser) => {
      await firstValueFrom(this.apiService.createNewItemEntry(laser));
    });
  }

  private generateDefaultLaserAmpItems() {
    defaultLaserAmps.map(async (laserAmp: LaserAmp) => {
      await firstValueFrom(this.apiService.createNewItemEntry(laserAmp));
    });
  }

  private generateDefaultShieldItems() {
    defaultShields.map(async (shield: Shield) => {
      await firstValueFrom(this.apiService.createNewItemEntry(shield));
    });
  }

  private generateDefaultShieldCellItems() {
    defaultShieldCells.map(async (shieldCell: ShieldCell) => {
      await firstValueFrom(this.apiService.createNewItemEntry(shieldCell));
    });
  }

  private generateDefaultShipItems() {
    defaultShips.map(async (ship: Ship) => {
      await firstValueFrom(this.apiService.createNewItemEntry(ship));
    });
  }

  private generateDefaultLaserAmmoItems() {
    defaultLaserAmmos.map(async (laserAmmo: LaserAmmo) => {
      await firstValueFrom(this.apiService.createNewItemEntry(laserAmmo));
    });
  }

  protected createAllDefaultItems() {
    this.generateDefaultEngineItems();
    this.generateDefaultThrusterItems();
    this.generateDefaultLaserItems();
    this.generateDefaultLaserAmpItems();
    this.generateDefaultShieldItems();
    this.generateDefaultShieldCellItems();
    this.generateDefaultShipItems();
    this.generateDefaultLaserAmmoItems();

    setTimeout(() => {
      if (!this.selectedCategory) return;
      this.fetchItems(this.selectedCategory!);
    }, 300);
  }

  protected readonly getFieldsForItemCategory = getFieldsForItemCategory;
}
