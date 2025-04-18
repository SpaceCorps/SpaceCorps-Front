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
  credits: number = 0;
  thulium: number = 0;

  constructor() {
    effect(() => {
      const currentPlayer = this.stateService.currentPlayer();
      if (currentPlayer) {
        this.username = currentPlayer.username;
        this.isOnline = currentPlayer.isOnline;
        this.isInvisible = currentPlayer.isInvisible;
        this.firstLogin = new Date(currentPlayer.dateOfRegistration).toLocaleDateString();
        this.totalHours = Math.floor(currentPlayer.totalPlayTime / 60).toString();
        this.experience = currentPlayer.experience;
        this.honor = currentPlayer.honor;
        this.shipsDestroyed = currentPlayer.shipsDestroyed;
        this.aliensDestroyed = currentPlayer.aliensDestroyed;
        this.rankingPoints = currentPlayer.rankingPoints;
        this.completedQuests = currentPlayer.completedQuests;
        this.completedGates = currentPlayer.completedGates;
        this.credits = currentPlayer.credits;
        this.thulium = currentPlayer.thulium;
      }
      this.clanInfo = this.stateService.clanData();
    });
  }

  ngOnInit() {
    this.stateService.fetchClanData();
  }
}
