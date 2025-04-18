import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ClanData } from '../../models/clan/ClanData';

@Component({
  selector: 'app-clan-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clan-list.component.html',
  styleUrls: ['./clan-list.component.scss']
})
export class ClanListComponent {
  private stateService = inject(StateService);
  protected clans = this.stateService.searchedClans;

  protected async joinClan(clan: ClanData): Promise<void> {
    try {
      await this.stateService.joinClan({
        clanId: clan.id,
        username: this.stateService.currentPlayer()?.username || ''
      });
    } catch (error) {
      console.error('Error joining clan:', error);
      // TODO: Add error handling/notification
    }
  }
} 