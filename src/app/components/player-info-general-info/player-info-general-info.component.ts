import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircle, faCircleXmark, faClock } from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';
import { ClanData } from '../../models/clan/ClanData';
import { effect } from '@angular/core';

@Component({
  selector: 'app-player-info-general-info',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: './player-info-general-info.component.html',
  styleUrls: ['./player-info-general-info.component.scss']
})
export class PlayerInfoGeneralInfoComponent implements OnInit {
  private stateService = inject(StateService);

  // Icons
  protected readonly faCircle = faCircle;
  protected readonly faCircleXmark = faCircleXmark;
  protected readonly faClock = faClock;

  // Player data
  username: string = '';
  isOnline: boolean = false;
  isInvisible: boolean = false;
  firstLogin: string = '';
  totalHours: string = '';
  experience: number = 0;
  honor: number = 0;
  shipsDestroyed: number = 0;
  aliensDestroyed: number = 0;
  rankingPoints: number = 0;
  completedQuests: number = 0;
  completedGates: number = 0;
  questProgress: string = '0/0';
  protected clanInfo: ClanData | null = null;

  constructor() {
    effect(() => {
      this.clanInfo = this.stateService.clanData();
    });
  }

  ngOnInit() {
    const playerData = this.stateService.currentPlayer();
    if (playerData) {
      this.username = playerData.username;
      this.isOnline = playerData.isOnline;
      this.isInvisible = playerData.isInvisible;
      this.firstLogin = new Date(playerData.dateOfRegistration).toLocaleDateString();
      this.totalHours = Math.floor(playerData.totalPlayTime / 60).toString();
      this.experience = playerData.experience;
      this.honor = playerData.honor;
      this.shipsDestroyed = playerData.shipsDestroyed;
      this.aliensDestroyed = playerData.aliensDestroyed;
      this.rankingPoints = playerData.rankingPoints;
      this.completedQuests = playerData.completedQuests;
      this.completedGates = playerData.completedGates;
      // TODO: Implement quest progress calculation
      this.questProgress = '17/42';
    }

    this.stateService.fetchClanData();
  }
}
