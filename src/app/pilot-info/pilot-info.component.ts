import { Component } from '@angular/core';
import { PlayerInfoGeneralInfoComponent } from '../components/player-info-general-info/player-info-general-info.component';
import { ThemePickerComponent } from '../components/theme-picker/theme-picker.component';
import { PlayerInfoClanInfoComponent } from '../components/player-info-clan-info/player-info-clan-info.component';
import { PlayerInfoLatestActivityComponent } from '../components/player-info-latest-activity/player-info-latest-activity.component';
import { PlayerInfoRankingComponent } from '../components/player-info-ranking/player-info-ranking.component';

@Component({
  selector: 'app-pilot-info',
  imports: [
    PlayerInfoGeneralInfoComponent,
    ThemePickerComponent,
    PlayerInfoClanInfoComponent,
    PlayerInfoLatestActivityComponent,
    PlayerInfoRankingComponent,
  ],
  templateUrl: './pilot-info.component.html',
  styleUrl: './pilot-info.component.scss',
})
export class PilotInfoComponent {}
