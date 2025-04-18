import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../services/state.service';
import { ClanSearchComponent } from '../components/clan-search/clan-search.component';
import { ClanListComponent } from '../components/clan-list/clan-list.component';
import { CreateClanComponent } from '../components/create-clan/create-clan.component';
import { ClanInvitationsComponent } from '../components/clan-invitations/clan-invitations.component';
import { ClanData } from '../models/clan/ClanData';
import { ClanDetailsComponent } from '../components/clan-details/clan-details.component';

@Component({
  selector: 'app-clans',
  standalone: true,
  imports: [
    CommonModule,
    ClanSearchComponent,
    ClanListComponent,
    CreateClanComponent,
    ClanInvitationsComponent,
    ClanDetailsComponent
  ],
  templateUrl: './clans.component.html',
  styleUrls: ['./clans.component.scss']
})
export class ClansComponent implements OnInit {
  private stateService = inject(StateService);
  protected userClan: ClanData | null = null;
  protected showCreateClan = false;

  constructor() {
    effect(() => {
      this.userClan = this.stateService.clanData();
    });
  }

  ngOnInit(): void {
    this.stateService.fetchClanData();
    this.stateService.fetchClanInvitations();
  }

  protected toggleCreateClan(): void {
    this.showCreateClan = !this.showCreateClan;
  }
} 