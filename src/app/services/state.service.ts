import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { Inventory } from '../models/player/Inventory';
import { PlayerData } from '../models/player/PlayerData';
import { SellableItems } from '../models/player/Items';
import { ChapterProgressDto } from '../models/lore/ChapterProgressDto';
import { Commit } from '../components/github-timeline/commit';
import { BuyItemRequest } from '../models/player/BuyItemRequest';
import { firstValueFrom } from 'rxjs';
import {
  EquipEngineRequest,
  EquipLaserAmpRequest,
  EquipLaserRequest,
  EquipShieldCellRequest,
  EquipShieldRequest,
  EquipThrusterRequest,
  UnequipEngineRequest,
  UnequipLaserAmpRequest,
  UnequipLaserRequest,
  UnequipShieldCellRequest,
  UnequipShieldRequest,
  UnequipThrusterRequest,
} from '../models/player/EquipUnequipDtos';

interface ServerInfo {
  version: string;
}

@Injectable({
  providedIn: 'root',
})
export class StateService {
  // Player state
  private playerData = signal<PlayerData | null>(null);
  private playerInventory = signal<Inventory | null>(null);
  private chapterProgress = signal<ChapterProgressDto | null>(null);
  private serverInfo = signal<ServerInfo | null>(null);
  private githubCommits = signal<Commit[] | null>(null);

  // Shop state
  private shopItems = signal<Record<
    SellableItems['itemType'],
    SellableItems[]
  > | null>(null);

  // Computed values
  public currentPlayer = computed(() => this.playerData());
  public currentInventory = computed(() => this.playerInventory());
  public currentChapterProgress = computed(() => this.chapterProgress());
  public currentShopItems = computed(() => this.shopItems());
  public currentServerInfo = computed(() => this.serverInfo());
  public currentGithubCommits = computed(() => this.githubCommits());

  constructor(private apiService: ApiService) {}

  // GitHub methods
  async fetchGithubCommits() {
    try {
      const commits = await this.apiService.getGithubCommits().toPromise();
      if (commits) {
        this.githubCommits.set(commits);
      }
      return commits;
    } catch (error) {
      console.error('Error fetching GitHub commits:', error);
      return null;
    }
  }

  // Server methods
  async fetchServerInfo() {
    try {
      const info = await this.apiService.getBackendVersion().toPromise();
      if (info) {
        this.serverInfo.set(info);
      }
      return info;
    } catch (error) {
      console.error('Error fetching server info:', error);
      return null;
    }
  }

  // Player methods
  async fetchPlayerInfo(username: string) {
    const player = await this.apiService
      .getPlayerInfo({ username })
      .toPromise();
    if (player) {
      this.playerData.set(player);
    }
    return player;
  }

  async fetchPlayerInventory(username: string) {
    const inventory = await this.apiService
      .getUserInventory(username)
      .toPromise();
    if (inventory) {
      this.playerInventory.set(inventory);
    }
    return inventory;
  }

  async fetchChapterProgress(userId: string) {
    const progress = await this.apiService
      .getChapterProgress(userId)
      .toPromise();
    if (progress) {
      this.chapterProgress.set(progress);
    }
    return progress;
  }

  // Shop methods
  async fetchShopItems(category: SellableItems['itemType']) {
    const items = await firstValueFrom(
      this.apiService.getItemEntriesByCategory(category)
    );
    if (items) {
      const currentItems =
        this.shopItems() ||
        ({} as Record<SellableItems['itemType'], SellableItems[]>);
      this.shopItems.set({ ...currentItems, [category]: items });
    }
    return items;
  }

  async buyItem(request: BuyItemRequest) {
    try {
      await firstValueFrom(this.apiService.buyItem(request));
      await this.fetchPlayerInfo(request.username);
      return true;
    } catch (error) {
      console.error('Error buying item:', error);
      return false;
    }
  }

  async createNewItemEntry<T extends SellableItems>(item: T) {
    try {
      await firstValueFrom(this.apiService.createNewItemEntry(item));
      await this.fetchShopItems(item.itemType);
      return true;
    } catch (error) {
      console.error('Error creating new item:', error);
      return false;
    }
  }

  async deleteItemEntry<T extends SellableItems>(item: T) {
    try {
      await firstValueFrom(this.apiService.deleteItemEntry(item));
      await this.fetchShopItems(item.itemType);
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  }

  // Equipment methods
  async equipLaserAmp(request: EquipLaserAmpRequest) {
    try {
      await firstValueFrom(this.apiService.equipLaserAmp(request));
      await this.fetchPlayerInventory(request.username);
      return true;
    } catch (error) {
      console.error('Error equipping laser amp:', error);
      return false;
    }
  }

  async unequipLaserAmp(request: UnequipLaserAmpRequest) {
    try {
      await firstValueFrom(this.apiService.unequipLaserAmp(request));
      await this.fetchPlayerInventory(request.username);
      return true;
    } catch (error) {
      console.error('Error unequipping laser amp:', error);
      return false;
    }
  }

  async equipLaser(request: EquipLaserRequest) {
    try {
      await firstValueFrom(this.apiService.equipLaser(request));
      await this.fetchPlayerInventory(request.username);
      return true;
    } catch (error) {
      console.error('Error equipping laser:', error);
      return false;
    }
  }

  async unequipLaser(request: UnequipLaserRequest) {
    try {
      await firstValueFrom(this.apiService.unequipLaser(request));
      await this.fetchPlayerInventory(request.username);
      return true;
    } catch (error) {
      console.error('Error unequipping laser:', error);
      return false;
    }
  }

  async equipShield(request: EquipShieldRequest) {
    try {
      await firstValueFrom(this.apiService.equipShield(request));
      await this.fetchPlayerInventory(request.username);
      return true;
    } catch (error) {
      console.error('Error equipping shield:', error);
      return false;
    }
  }

  async unequipShield(request: UnequipShieldRequest) {
    try {
      await firstValueFrom(this.apiService.unequipShield(request));
      await this.fetchPlayerInventory(request.username);
      return true;
    } catch (error) {
      console.error('Error unequipping shield:', error);
      return false;
    }
  }

  async equipShieldCell(request: EquipShieldCellRequest) {
    try {
      await firstValueFrom(this.apiService.equipShieldCell(request));
      await this.fetchPlayerInventory(request.username);
      return true;
    } catch (error) {
      console.error('Error equipping shield cell:', error);
      return false;
    }
  }

  async unequipShieldCell(request: UnequipShieldCellRequest) {
    try {
      await firstValueFrom(this.apiService.unequipShieldCell(request));
      await this.fetchPlayerInventory(request.username);
      return true;
    } catch (error) {
      console.error('Error unequipping shield cell:', error);
      return false;
    }
  }

  async equipEngine(request: EquipEngineRequest) {
    try {
      await firstValueFrom(this.apiService.equipEngine(request));
      await this.fetchPlayerInventory(request.username);
      return true;
    } catch (error) {
      console.error('Error equipping engine:', error);
      return false;
    }
  }

  async unequipEngine(request: UnequipEngineRequest) {
    try {
      await firstValueFrom(this.apiService.unequipEngine(request));
      await this.fetchPlayerInventory(request.username);
      return true;
    } catch (error) {
      console.error('Error unequipping engine:', error);
      return false;
    }
  }

  async equipThruster(request: EquipThrusterRequest) {
    try {
      await firstValueFrom(this.apiService.equipThruster(request));
      await this.fetchPlayerInventory(request.username);
      return true;
    } catch (error) {
      console.error('Error equipping thruster:', error);
      return false;
    }
  }

  async unequipThruster(request: UnequipThrusterRequest) {
    try {
      await firstValueFrom(this.apiService.unequipThruster(request));
      await this.fetchPlayerInventory(request.username);
      return true;
    } catch (error) {
      console.error('Error unequipping thruster:', error);
      return false;
    }
  }

  // Update methods
  updatePlayerData(data: PlayerData) {
    this.playerData.set(data);
  }

  updateInventory(inventory: Inventory) {
    this.playerInventory.set(inventory);
  }

  updateChapterProgress(progress: ChapterProgressDto) {
    this.chapterProgress.set(progress);
  }

  // Clear state methods
  clearPlayerState() {
    this.playerData.set(null);
    this.playerInventory.set(null);
    this.chapterProgress.set(null);
  }

  clearShopState() {
    this.shopItems.set(null);
  }
}
