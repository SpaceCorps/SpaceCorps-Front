import {Component, inject, OnInit} from '@angular/core';
import {AsyncPipe, NgClass} from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {ApiService} from '../../services/api.service';
import {PlayerInfoStatisticsComponent} from '../player-info-statistics/player-info-statistics.component';

@Component({
  selector: 'app-player-info-general-info',
  imports: [NgClass, AsyncPipe, PlayerInfoStatisticsComponent],
  templateUrl: './player-info-general-info.component.html',
  styleUrl: './player-info-general-info.component.scss'
})
export class PlayerInfoGeneralInfoComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);

  authState$ = this.authService.authState$;

  ngOnInit() {
    const authPlayerData = this.authService.getPlayerData();
    if (!authPlayerData) {
      console.error('Error: Missing PlayerData');
      return;
    }
    const username = authPlayerData.username;

    this.getPlayerInfo(username).subscribe({
      next: (response) => {
        this.templateValues.username = response.username;
        this.templateValues.hoursPlayed = response.totalPlayTime;
        this.templateValues.dateOfReg = response.dateOfRegistration;
      },
      error: (err) => {
        throw err;
      }
    })
  }

  getPlayerInfo(username: string) {
    return this.apiService.getPlayerInfo({
      username: username,
    });
  }

  templateValues = {
    username: 'undefined',
    dateOfReg: 'undefined',
    hoursPlayed: 9999,
  };
}
