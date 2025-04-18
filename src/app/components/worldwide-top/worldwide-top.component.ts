import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

interface TopPlayer {
  rank: number;
  username: string;
  exp: number;
  rp: number;
  ald: number;
  sld: number;
  avatar?: string;
}

@Component({
  selector: 'app-worldwide-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './worldwide-top.component.html',
  styleUrls: ['./worldwide-top.component.scss']
})
export class WorldwideTopComponent implements OnInit {
  private stateService = inject(StateService);

  topPlayers: TopPlayer[] = [];
  currentPage = 1;
  totalPages = 1;

  ngOnInit() {
    // TODO: Implement top players fetching from StateService
    // For now using mock data
    this.topPlayers = [
      {
        rank: 1,
        username: 'Cameron Williamson',
        exp: 1000,
        rp: 500,
        ald: 200,
        sld: 150,
        avatar: 'assets/avatars/avatar1.jpg'
      },
      {
        rank: 2,
        username: '<clan rank>',
        exp: 950,
        rp: 480,
        ald: 190,
        sld: 140
      },
      {
        rank: 3,
        username: 'First login',
        exp: 900,
        rp: 460,
        ald: 180,
        sld: 130
      },
      {
        rank: 4,
        username: 'Robert Fox',
        exp: 850,
        rp: 440,
        ald: 170,
        sld: 120
      },
      {
        rank: 5,
        username: 'Leslie Alexander',
        exp: 800,
        rp: 420,
        ald: 160,
        sld: 110
      }
    ];
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      // TODO: Fetch data for new page
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      // TODO: Fetch data for new page
    }
  }
} 