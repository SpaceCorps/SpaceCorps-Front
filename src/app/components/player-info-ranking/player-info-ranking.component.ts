import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-player-info-ranking',
  imports: [],
  templateUrl: './player-info-ranking.component.html',
  styleUrl: './player-info-ranking.component.scss',
})
export class PlayerInfoRankingComponent implements OnInit {
  constructor(private apiService: ApiService) {}

  playerRanks: PlayerRankDto[] = [];
  playerRankFields: PlayerRankField[] = ['EXP', 'RP', 'ALD', 'SLD'];

  ngOnInit(): void {
    this.playerRanks = this.getPlayerRanks();
  }

  getPlayerRanks(): PlayerRankDto[] {

    //TODO: actual api call here
    return [
      {
        topPosition: 1,
        playerName: 'Player 1',
        experience: {
          shortName: 'EXP',
          value: 1000,
        },
        rankingPoints: {
          shortName: 'RP',
          value: 2000,
        },
        aliensDestroyed: {
          shortName: 'ALD',
          value: 3000,
        },
        shipsDestroyed: {
          shortName: 'SLD',
          value: 4000,
        },
      },
      {
        topPosition: 2,
        playerName: 'Player 2',
        experience: {
          shortName: 'EXP',
          value: 1000,
        },
        rankingPoints: {
          shortName: 'RP',
          value: 2000,
        },
        aliensDestroyed: {
          shortName: 'ALD',
          value: 3000,
        },
        shipsDestroyed: {
          shortName: 'SLD',
          value: 4000,
        },
      },
      {
        topPosition: 3,
        playerName: 'Player 3',
        experience: {
          shortName: 'EXP',
          value: 1000,
        },
        rankingPoints: {
          shortName: 'RP',
          value: 2000,
        },
        aliensDestroyed: {
          shortName: 'ALD',
          value: 3000,
        },
        shipsDestroyed: {
          shortName: 'SLD',
          value: 4000,
        },
      },
      {
        topPosition: 4,
        playerName: 'Player 4',
        experience: {
          shortName: 'EXP',
          value: 1000,
        },
        rankingPoints: {
          shortName: 'RP',
          value: 2000,
        },
        aliensDestroyed: {
          shortName: 'ALD',
          value: 3000,
        },
        shipsDestroyed: {
          shortName: 'SLD',
          value: 4000,
        },
      },
    ];
  }
}

type PlayerRankField = FieldsWithShortName;
type FieldsWithShortName = {
  [K in keyof PlayerRankDto]: PlayerRankDto[K] extends { shortName: infer S }
    ? S
    : never;
}[keyof PlayerRankDto];

export type PlayerRankDto = {
  topPosition: number;
  playerName: string;
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
