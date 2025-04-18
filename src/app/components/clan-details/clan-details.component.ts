import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClanData } from '../../models/clan/ClanData';

@Component({
  selector: 'app-clan-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Your Clan</h2>
        
        <!-- Clan Header -->
        <div class="flex items-center gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-xl font-bold">{{ clan.name }}</h3>
              <span class="badge badge-primary">{{ clan.tag }}</span>
            </div>
            <p class="text-sm opacity-70">{{ clan.slogan }}</p>
          </div>
        </div>

        <!-- Members Info -->
        <div class="stats shadow mb-4">
          <div class="stat">
            <div class="stat-title">Active Members</div>
            <div class="stat-value">{{ clan.activeMembers }}</div>
            <div class="stat-desc">of {{ clan.totalMembers }} total</div>
          </div>
          <div class="stat">
            <div class="stat-title">Level</div>
            <div class="stat-value">{{ clan.level }}</div>
            <div class="stat-desc">Ranking Points: {{ clan.rankingPoints }}</div>
          </div>
        </div>

        <!-- Clan Statistics -->
        <div class="grid grid-cols-2 gap-4">
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Total Experience</div>
            <div class="stat-value text-lg">{{ clan.totalExperience | number }}</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Total Honor</div>
            <div class="stat-value text-lg">{{ clan.totalHonor | number }}</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Ships Destroyed</div>
            <div class="stat-value text-lg">{{ clan.totalShipsDestroyed | number }}</div>
          </div>
          <div class="stat bg-base-200 rounded-lg">
            <div class="stat-title">Aliens Destroyed</div>
            <div class="stat-value text-lg">{{ clan.totalAliensDestroyed | number }}</div>
          </div>
        </div>

        <!-- Leadership -->
        <div class="mt-4">
          <h3 class="text-lg font-semibold mb-2">Leadership</h3>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <span class="badge badge-secondary">Leader</span>
              <span>{{ clan.leader }}</span>
            </div>
            @if (clan.officers.length > 0) {
              <div class="flex items-center gap-2">
                <span class="badge badge-primary">Officers</span>
                <span>{{ clan.officers.join(', ') }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Company Info -->
        @if (clan.companyInfo) {
          <div class="mt-4">
            <h3 class="text-lg font-semibold mb-2">Company Info</h3>
            <p class="text-sm opacity-70">{{ clan.companyInfo }}</p>
          </div>
        }

        <!-- Recruitment Status -->
        <div class="mt-4 flex items-center gap-2">
          <span class="badge" [class.badge-success]="clan.isRecruiting" [class.badge-error]="!clan.isRecruiting">
            {{ clan.isRecruiting ? 'Recruiting' : 'Not Recruiting' }}
          </span>
          @if (clan.isRecruiting) {
            <span class="text-sm opacity-70">
              Requirements: Level {{ clan.minimumLevel }}+, 
              {{ clan.minimumRankingPoints }}+ Ranking Points
            </span>
          }
        </div>
      </div>
    </div>
  `
})
export class ClanDetailsComponent {
  @Input() clan!: ClanData;
} 