import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ClanData } from '../../models/clan/ClanData';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clan-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">Other Clans</h2>
          <div class="flex gap-2">
            <div class="form-control">
              <label class="cursor-pointer label">
                <span class="label-text mr-2">Recruiting Only</span>
                <input
                  type="checkbox"
                  [(ngModel)]="showRecruitingOnly"
                  (ngModelChange)="searchClans()"
                  class="toggle toggle-primary"
                />
              </label>
            </div>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="searchClans()"
              placeholder="Search clans..."
              class="input input-bordered w-64"
            />
          </div>
        </div>

        @if (!filteredClans.length) {
          <div class="text-center py-8">
            <p class="text-lg opacity-70">No clans found matching your criteria.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            @for (clan of filteredClans; track clan.id) {
              <div class="card bg-base-200 shadow-xl">
                <div class="card-body">
                  <!-- Clan Header -->
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="card-title">{{ clan.name }}</h3>
                      <div class="flex items-center gap-2">
                        <span class="badge badge-primary">{{ clan.tag }}</span>
                        @if (clan.isRecruiting) {
                          <span class="badge badge-success">Recruiting</span>
                        }
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm">Level {{ clan.level }}</div>
                      <div class="text-xs opacity-70">{{ clan.rankingPoints }} Points</div>
                    </div>
                  </div>

                  <p class="text-sm opacity-70 mt-2">{{ clan.slogan }}</p>

                  <!-- Clan Stats -->
                  <div class="grid grid-cols-2 gap-4 my-4">
                    <div class="stat bg-base-300 rounded-lg p-2">
                      <div class="stat-title text-xs">Members</div>
                      <div class="stat-value text-lg">{{ clan.activeMembers }}/{{ clan.totalMembers }}</div>
                    </div>
                    <div class="stat bg-base-300 rounded-lg p-2">
                      <div class="stat-title text-xs">Experience</div>
                      <div class="stat-value text-lg">{{ clan.totalExperience | number }}</div>
                    </div>
                  </div>

                  @if (clan.isRecruiting) {
                    <div class="text-sm opacity-70">
                      Requirements: Level {{ clan.minimumLevel }}+, 
                      {{ clan.minimumRankingPoints }}+ Points
                    </div>
                  }

                  <!-- Join Button -->
                  @if (canJoinClan(clan)) {
                    <div class="card-actions justify-end mt-2">
                      <button class="btn btn-primary btn-sm" (click)="joinClan(clan)">
                        Join Clan
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class ClanListComponent {
  private stateService = inject(StateService);
  protected searchTerm = '';
  protected showRecruitingOnly = false;
  protected allClans: ClanData[] = [];
  protected filteredClans: ClanData[] = [];

  ngOnInit() {
    this.loadClans();
  }

  private async loadClans() {
    try {
      await this.stateService.searchClans({
        searchTerm: ''
      });
      this.allClans = this.stateService.searchedClans();
      this.filterClans();
    } catch (error) {
      console.error('Error loading clans:', error);
    }
  }

  protected searchClans() {
    this.filterClans();
  }

  private filterClans() {
    let filtered = [...this.allClans];
    
    // Filter out user's current clan
    const currentClan = this.stateService.clanData();
    if (currentClan) {
      filtered = filtered.filter(clan => clan.id !== currentClan.id);
    }

    // Apply recruiting filter
    if (this.showRecruitingOnly) {
      filtered = filtered.filter(clan => clan.isRecruiting);
    }

    // Apply search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(clan => 
        clan.name.toLowerCase().includes(term) ||
        clan.tag.toLowerCase().includes(term) ||
        clan.slogan.toLowerCase().includes(term)
      );
    }

    this.filteredClans = filtered;
  }

  protected canJoinClan(clan: ClanData): boolean {
    if (!clan.isRecruiting) return false;

    const player = this.stateService.currentPlayer();
    if (!player) return false;

    const currentClan = this.stateService.clanData();
    if (currentClan) return false;

    // Skip level check if not available
    if (clan.minimumLevel && !player.level) return false;
    if (clan.minimumRankingPoints && !player.rankingPoints) return false;

    return (!clan.minimumLevel || player.level >= clan.minimumLevel) &&
           (!clan.minimumRankingPoints || player.rankingPoints >= clan.minimumRankingPoints);
  }

  protected async joinClan(clan: ClanData): Promise<void> {
    const currentPlayer = this.stateService.currentPlayer();
    if (!currentPlayer?.username) {
      console.error('No current player found');
      return;
    }

    try {
      await this.stateService.joinClan(clan.id, currentPlayer.username);
      // Refresh clans list after joining
      await this.loadClans();
    } catch (error) {
      console.error('Error joining clan:', error);
      // TODO: Add error handling/notification
    }
  }
} 