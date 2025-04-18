import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { ClanSearchRequest, ClanSortOption } from '../../models/clan/ClanDtos';

@Component({
  selector: 'app-clan-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clan-search.component.html',
  styleUrls: ['./clan-search.component.scss']
})
export class ClanSearchComponent {
  private stateService = inject(StateService);
  protected readonly sortOptions = Object.values(ClanSortOption);

  protected searchRequest: ClanSearchRequest = {
    searchTerm: '',
    isRecruiting: true,
    page: 1,
    pageSize: 10
  };

  protected async search(): Promise<void> {
    await this.stateService.searchClans(this.searchRequest);
  }

  protected clearFilters(): void {
    this.searchRequest = {
      searchTerm: '',
      isRecruiting: true,
      page: 1,
      pageSize: 10
    };
    this.search();
  }
} 