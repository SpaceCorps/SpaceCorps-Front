import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ClanData } from '../../models/clan/ClanData';

@Component({
  selector: 'app-clan-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!clans() || clans().length === 0) {
      <div class="text-center py-8">
        <p class="text-lg opacity-70">No clans found matching your criteria.</p>
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (clan of clans(); track clan.id) {
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <!-- Clan Header -->
              <div class="flex items-center gap-4">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="card-title">{{ clan.name }}</h3>
                    <span class="badge badge-primary">{{ clan.tag }}</span>
                  </div>
                  <p class="text-sm opacity-70">{{ clan.slogan }}</p>
                </div>
              </div>

              <!-- Clan Stats -->
              <div class="grid grid-cols-2 gap-4 my-4">
                <div class="stat bg-base-300 rounded-lg p-2">
                  <div class="stat-title text-xs">Members</div>
                  <div class="stat-value text-lg">{{ clan.activeMembers }}/{{ clan.totalMembers }}</div>
                </div>
                <div class="stat bg-base-300 rounded-lg p-2">
                  <div class="stat-title text-xs">Level</div>
                  <div class="stat-value text-lg">{{ clan.level }}</div>
                </div>
                <div class="stat bg-base-300 rounded-lg p-2">
                  <div class="stat-title text-xs">Experience</div>
                  <div class="stat-value text-lg">{{ clan.totalExperience | number }}</div>
                </div>
                <div class="stat bg-base-300 rounded-lg p-2">
                  <div class="stat-title text-xs">Honor</div>
                  <div class="stat-value text-lg">{{ clan.totalHonor | number }}</div>
                </div>
              </div>

              <!-- Join Button -->
              <div class="card-actions justify-end">
                <button class="btn btn-primary" (click)="joinClan(clan)">
                  Join Clan
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class ClanListComponent {
  private stateService = inject(StateService);
  protected clans = this.stateService.searchedClans;

  protected async joinClan(clan: ClanData): Promise<void> {
    const currentPlayer = this.stateService.currentPlayer();
    if (!currentPlayer?.username) {
      console.error('No current player found');
      return;
    }

    try {
      await this.stateService.joinClan({
        clanId: clan.id,
        username: currentPlayer.username
      });
    } catch (error) {
      console.error('Error joining clan:', error);
      // TODO: Add error handling/notification
    }
  }
} 