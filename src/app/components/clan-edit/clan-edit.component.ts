import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClanData } from '../../models/clan/ClanDtos';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-clan-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clan-edit.component.html'
})
export class ClanEditComponent {
  @Input() clan!: ClanData;
  @Output() clanUpdated = new EventEmitter<void>();
  @Output() deleteClan = new EventEmitter<void>();

  editData = {
    slogan: '',
    companyInfo: '',
    isRecruiting: false,
    minimumLevel: 0,
    minimumRankingPoints: 0
  };

  constructor(private stateService: StateService) {}

  ngOnInit() {
    this.resetForm();
  }

  resetForm() {
    if (this.clan) {
      this.editData = {
        slogan: this.clan.slogan,
        companyInfo: this.clan.companyInfo,
        isRecruiting: this.clan.isRecruiting,
        minimumLevel: this.clan.minimumLevel,
        minimumRankingPoints: this.clan.minimumRankingPoints
      };
    }
  }

  async updateClan() {
    try {
      await this.stateService.updateClanDetails({
        clanId: this.clan.id,
        slogan: this.editData.slogan,
        companyInfo: this.editData.companyInfo,
        isRecruiting: this.editData.isRecruiting,
        minimumLevel: this.editData.minimumLevel,
        minimumRankingPoints: this.editData.minimumRankingPoints
      });
      this.clanUpdated.emit();
    } catch (error) {
      console.error('Error updating clan:', error);
      // TODO: Add error handling/notification
    }
  }
} 