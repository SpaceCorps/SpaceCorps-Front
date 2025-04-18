import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { effect } from '@angular/core';
import { ClanData } from '../../models/clan/ClanData';

@Component({
  selector: 'app-clan-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clan-info.component.html',
  styleUrls: ['./clan-info.component.scss']
})
export class ClanInfoComponent implements OnInit {
  private stateService = inject(StateService);
  protected clanInfo: ClanData | null = null;

  constructor() {
    effect(() => {
      this.clanInfo = this.stateService.clanData();
    });
  }

  ngOnInit(): void {
    this.stateService.fetchClanData();
  }
} 