import { Component, OnInit, effect } from '@angular/core';
import { PlayerStatistics } from '../../models/player/PlayerStatistics';
import { StateService } from '../../services/state.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-player-info-statistics',
  templateUrl: './player-info-statistics.component.html',
  styleUrl: './player-info-statistics.component.scss',
})
export class PlayerInfoStatisticsComponent implements OnInit {
  categories = [
    'Experience',
    'Honor',
    'Ships Destroyed',
    'Aliens Destroyed',
    'Ranking Points',
    'Completed Quests',
    'Completed Gates',
    'Current Title',
  ];

  statistics: PlayerStatistics | null = null;

  constructor(
    private stateService: StateService,
    private authService: AuthService
  ) {
    // Set up effect to watch player data changes
    effect(() => {
      const currentPlayer = this.stateService.currentPlayer();
      if (currentPlayer) {
        this.statistics = {
          experience: {
            totalExperience: currentPlayer.experience,
          },
          honor: {
            totalHonor: currentPlayer.honor,
          },
          shipsDestroyed: {
            totalShipsDestroyed: currentPlayer.shipsDestroyed,
          },
          aliensDestroyed: {
            totalAliensDestroyed: currentPlayer.aliensDestroyed,
          },
          rankingPoints: {
            totalRankingPoints: currentPlayer.rankingPoints,
          },
          completedQuests: {
            totalCompletedQuests: currentPlayer.completedQuests,
          },
          completedGates: {
            totalCompletedGates: currentPlayer.completedGates,
          },
          currentTitle: {
            title: currentPlayer.title,
          },
        };
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
    this.stateService.fetchPlayerInfo(username);
  }

  getCategoryValue(category: string): string | number | null {
    if (!this.statistics) return null;
    switch (category) {
      case 'Experience':
        return this.statistics.experience.totalExperience;
      case 'Honor':
        return this.statistics.honor.totalHonor;
      case 'Ships Destroyed':
        return this.statistics.shipsDestroyed.totalShipsDestroyed;
      case 'Aliens Destroyed':
        return this.statistics.aliensDestroyed.totalAliensDestroyed;
      case 'Ranking Points':
        return this.statistics.rankingPoints.totalRankingPoints;
      case 'Completed Quests':
        return this.statistics.completedQuests.totalCompletedQuests;
      case 'Completed Gates':
        return this.statistics.completedGates.totalCompletedGates;
      case 'Current Title':
        return this.statistics.currentTitle.title;
      default:
        return null;
    }
  }
}
