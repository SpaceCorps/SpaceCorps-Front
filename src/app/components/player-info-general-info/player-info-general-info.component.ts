import { Component, inject, OnInit, effect } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';
import { PlayerInfoStatisticsComponent } from '../player-info-statistics/player-info-statistics.component';

@Component({
  selector: 'app-player-info-general-info',
  imports: [NgClass, AsyncPipe, PlayerInfoStatisticsComponent],
  templateUrl: './player-info-general-info.component.html',
  styleUrl: './player-info-general-info.component.scss',
})
export class PlayerInfoGeneralInfoComponent implements OnInit {
  authService = inject(AuthService);
  stateService = inject(StateService);

  authState$ = this.authService.authState$;

  constructor() {
    // Set up effect to watch player data changes
    effect(() => {
      const currentPlayer = this.stateService.currentPlayer();
      console.log('Current player data:', currentPlayer);
      if (currentPlayer) {
        this.templateValues.username = currentPlayer.username;
        this.templateValues.hoursPlayed = currentPlayer.totalPlayTime;
        this.templateValues.dateOfReg = currentPlayer.dateOfRegistration;
        this.templateValues.credits = currentPlayer.credits;
        this.templateValues.thulium = currentPlayer.thulium;
      }
    });
  }

  ngOnInit() {
    const authPlayerData = this.authService.getPlayerData();
    if (!authPlayerData) {
      console.error('Error: Missing PlayerData');
      return;
    }
    const username = authPlayerData.username;

    // Initial fetch of player data
    this.stateService.fetchPlayerInfo(username).catch(error => {
      console.error('Error fetching player info:', error);
    });
  }

  templateValues = {
    username: 'undefined',
    dateOfReg: 'undefined',
    hoursPlayed: 9999,
    credits: 0,
    thulium: 0
  };
}
