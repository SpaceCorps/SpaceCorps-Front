import { Component } from '@angular/core';
import { PlayerStatistics } from '../../models/player/PlayerStatistics';

@Component({
  selector: 'app-player-info-statistics',
  templateUrl: './player-info-statistics.component.html',
  styleUrl: './player-info-statistics.component.scss',
})
export class PlayerInfoStatisticsComponent {
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

  ngOnInit() {
    this.statistics = this.getPlayerStatistics();
  }

  getPlayerStatistics(): PlayerStatistics {
    // TODO: Api call here
    // return this.apiService.getPlayerStatistics();
    return this.templateStatistics;
  }

  templateStatistics: PlayerStatistics = {
    experience: {
      totalExperience: 1000,
    },
    honor: {
      totalHonor: 100,
    },
    shipsDestroyed: {
      totalShipsDestroyed: 10,
    },
    aliensDestroyed: {
      totalAliensDestroyed: 5,
    },
    rankingPoints: {
      totalRankingPoints: 100,
    },
    completedQuests: {
      totalCompletedQuests: 5,
    },
    completedGates: {
      totalCompletedGates: 2,
    },
    currentTitle: {
      title: 'Rookie',
    },
  };

  getCategoryValue(category: string): any {
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
