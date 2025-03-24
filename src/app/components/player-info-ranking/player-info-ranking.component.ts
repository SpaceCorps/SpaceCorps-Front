import { Component } from '@angular/core';

@Component({
  selector: 'app-player-info-ranking',
  imports: [],
  templateUrl: './player-info-ranking.component.html',
  styleUrl: './player-info-ranking.component.scss',
})
export class PlayerInfoRankingComponent {
  constructor() {}

  playerRanks: PlayerRankDto[] = [];
  playerRankFields: PlayerRankField[] = ['EXP', 'RP', 'ALD', 'SLD'];
}

type PlayerRankField = PlayerRankDto[keyof PlayerRankDto]['shortName'];

export type PlayerRankDto = {
  experience: {
    shortName: 'EXP';
    value: number;
  };
  rankingPoints: {
    shortName: 'RP';
    value: number;
  };
  aliensDestroyed: {
    shortName: 'ALD';
    value: number;
  };
  shipsDestroyed: {
    shortName: 'SLD';
    value: number;
  };
};
