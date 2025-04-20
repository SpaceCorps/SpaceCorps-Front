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
import { ClanData } from '../models/clan/ClanData';
import {
  ClanInvitation,
  ClanSearchRequest,
  CreateClanRequest,
  InviteToClanRequest,
  UpdateMemberStatsRequest,
} from '../models/clan/ClanDtos';
import { AuthService } from './auth.service';

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

  // Clan signals
  private _clanData = signal<ClanData | null>(null);
  private _clanInvitations = signal<ClanInvitation[]>([]);
  private _searchedClans = signal<ClanData[]>([]);

  // Computed values
  public currentPlayer = computed(() => this.playerData());
  public currentInventory = computed(() => this.playerInventory());
  public currentChapterProgress = computed(() => this.chapterProgress());
  public currentShopItems = computed(() => this.shopItems());
  public currentServerInfo = computed(() => this.serverInfo());
  public currentGithubCommits = computed(() => this.githubCommits());

  // Clan getters
  public clanData = this._clanData.asReadonly();
  public clanInvitations = this._clanInvitations.asReadonly();
  public searchedClans = this._searchedClans.asReadonly();

  constructor(
    private apiService: ApiService,
    public authService: AuthService
  ) {}

  // GitHub methods
  async fetchGithubCommits() {
    try {
      const commits = await firstValueFrom(this.apiService.getGithubCommits());
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
      const info = await firstValueFrom(this.apiService.getBackendVersion());
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
  async fetchPlayerInfo(username?: string) {
    const targetUsername = username || this.authService.getUsername();
    if (!targetUsername) {
      console.error('No username available to fetch player info');
      return null;
    }

    const player = await firstValueFrom(
      this.apiService.getPlayerInfo({ username: targetUsername })
    );
    if (player) {
      this.playerData.set(player);
    }
    return player;
  }

  async fetchPlayerInventory(username: string) {
    const inventory = await firstValueFrom(
      this.apiService.getUserInventory(username)
    );
    if (inventory) {
      this.playerInventory.set(inventory);
    }
    return inventory;
  }

  // Chapter progress methods
  async fetchChapterProgress(userId: string) {
    try {
      const progress = await firstValueFrom(
        this.apiService.getChapterProgress(userId)
      );
      if (progress) {
        this.chapterProgress.set(progress);
      }
      return progress;
    } catch (error) {
      console.error('Error fetching chapter progress:', error);
      return null;
    }
  }

  async updateChapterProgress(request: ChapterProgressDto) {
    try {
      await firstValueFrom(this.apiService.updateChapterProgress(request));
      await this.fetchChapterProgress(request.userId);
      return true;
    } catch (error) {
      console.error('Error updating chapter progress:', error);
      return false;
    }
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
      await this.fetchPlayerInfo();
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
  updatePlayerData(playerData: PlayerData) {
    this.playerData.set(playerData);
  }

  updateInventory(inventory: Inventory) {
    this.playerInventory.set(inventory);
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

  // Clan methods
  public async fetchClanData(username?: string): Promise<void> {
    try {
      const targetUsername = username || this.authService.getUsername();
      console.log('Fetching clan data for username:', targetUsername);
      
      if (!targetUsername) {
        console.log('No username available to fetch clan data');
        return;
      }

      const response = await firstValueFrom(
        this.apiService.getClanMember(targetUsername)
      );
      console.log('Received clan data:', response);
      this._clanData.set(response);
    } catch (error) {
      console.error('Error fetching clan data:', error);
      this._clanData.set(null);
    }
  }

  public async createClan(request: CreateClanRequest): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.apiService.createClan(request)
      );
      this._clanData.set(response);
    } catch (error) {
      console.error('Error creating clan:', error);
      throw error;
    }
  }

  public async updateClan(
    clanId: string,
    username: string,
    request: UpdateMemberStatsRequest
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.apiService.updateMemberStats(clanId, username, request)
      );
      await this.fetchClanData(username);
    } catch (error) {
      console.error('Error updating clan:', error);
      throw error;
    }
  }

  public async joinClan(clanId: string, username: string): Promise<void> {
    try {
      await firstValueFrom(this.apiService.joinClan(clanId, username));
      await this.fetchClanData(username);
    } catch (error) {
      console.error('Error joining clan:', error);
      throw error;
    }
  }

  public async deleteClan(clanId: string, username: string): Promise<void> {
    try {
      await firstValueFrom(this.apiService.deleteClan(clanId, username));
      this._clanData.set(null);
    } catch (error) {
      console.error('Error deleting clan:', error);
      throw error;
    }
  }

  public async leaveClan(clanId: string, username: string): Promise<void> {
    try {
      await firstValueFrom(this.apiService.leaveClan(clanId, { username }));
      this._clanData.set(null);
    } catch (error) {
      console.error('Error leaving clan:', error);
      throw error;
    }
  }

  public async kickMember(clanId: string, memberToKick: string): Promise<void> {
    try {
      const kickerUsername = this.authService.getUsername();
      if (!kickerUsername) {
        throw new Error('No username available to kick member');
      }

      await firstValueFrom(this.apiService.kickMember(clanId, {
        kickerUsername,
        memberToKick
      }));
      await this.fetchClanData();
    } catch (error) {
      console.error('Error kicking member:', error);
      throw error;
    }
  }

  public async changeMemberRole(
    clanId: string,
    username: string,
    isPromotion: boolean
  ): Promise<void> {
    try {
      if (isPromotion) {
        await firstValueFrom(this.apiService.promoteMember(clanId, username));
      } else {
        await firstValueFrom(this.apiService.demoteMember(clanId, username));
      }
      await this.fetchClanData(username);
    } catch (error) {
      console.error('Error changing member role:', error);
      throw error;
    }
  }

  public async inviteToClan(
    clanId: string,
    request: InviteToClanRequest
  ): Promise<void> {
    try {
      await firstValueFrom(this.apiService.inviteToClan(clanId, request));
    } catch (error) {
      console.error('Error sending clan invitation:', error);
      throw error;
    }
  }

  public async fetchClanInvitations(): Promise<void> {
    try {
      const username = this.authService.getUsername();
      if (!username) return;

      const response = await firstValueFrom(
        this.apiService.getClanInvitations(username)
      );
      this._clanInvitations.set(response);
    } catch (error) {
      console.error('Error fetching clan invitations:', error);
      this._clanInvitations.set([]);
    }
  }

  public async acceptClanInvitation(invitationId: string): Promise<void> {
    try {
      await firstValueFrom(this.apiService.acceptClanInvitation(invitationId));
      const username = this.authService.getUsername();
      if (username) {
        await this.fetchClanData(username);
      }
      await this.fetchClanInvitations();
    } catch (error) {
      console.error('Error accepting clan invitation:', error);
      throw error;
    }
  }

  public async declineClanInvitation(invitationId: string): Promise<void> {
    try {
      await firstValueFrom(this.apiService.declineClanInvitation(invitationId));
      await this.fetchClanInvitations();
    } catch (error) {
      console.error('Error declining clan invitation:', error);
      throw error;
    }
  }

  public async searchClans(request: ClanSearchRequest): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.apiService.searchClans(request)
      );
      this._searchedClans.set(response);
    } catch (error) {
      console.error('Error searching clans:', error);
      this._searchedClans.set([]);
    }
  }

  public async updateClanDetails(request: {
    clanId: string;
    slogan: string;
    companyInfo: string;
    isRecruiting: boolean;
    minimumLevel: number;
    minimumRankingPoints: number;
  }): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.apiService.updateClan(request)
      );
      this._clanData.set(response);
    } catch (error) {
      console.error('Error updating clan details:', error);
      throw error;
    }
  }
}
