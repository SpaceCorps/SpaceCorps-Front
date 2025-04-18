import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { CreateClanRequest } from '../../models/clan/ClanDtos';

@Component({
  selector: 'app-create-clan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-clan.component.html',
  styleUrls: ['./create-clan.component.scss']
})
export class CreateClanComponent {
  @Output() created = new EventEmitter<void>();
  private stateService = inject(StateService);

  protected request: CreateClanRequest = {
    name: '',
    tag: '',
    slogan: '',
    companyInfo: '',
    isRecruiting: true,
    minimumLevel: 0,
    minimumRankingPoints: 0
  };

  protected async createClan(): Promise<void> {
    try {
      await this.stateService.createClan(this.request);
      this.created.emit();
    } catch (error) {
      console.error('Error creating clan:', error);
      // TODO: Add error handling/notification
    }
  }
} 