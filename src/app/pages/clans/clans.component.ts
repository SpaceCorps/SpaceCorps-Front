import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { ClanDetailsComponent } from '../../components/clan-details/clan-details.component';
import { ClanListComponent } from '../../components/clan-list/clan-list.component';
import { ClanInvitationsComponent } from '../../components/clan-invitations/clan-invitations.component';

@Component({
  selector: 'app-clans',
  standalone: true,
  imports: [CommonModule, FormsModule, ClanDetailsComponent, ClanListComponent, ClanInvitationsComponent],
  template: `
    <div class="container mx-auto p-4 space-y-8">
      <!-- Your Clan Section -->
      <section>
        <h1 class="text-3xl font-bold mb-4">Your Clan</h1>
        @if (clanData()) {
          <app-clan-details [clan]="clanData()!" />
        } @else {
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Not In A Clan</h2>
              <p class="opacity-70">You are not currently a member of any clan. Join an existing clan or create your own!</p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary" (click)="showCreateClan = true">
                  Create New Clan
                </button>
              </div>
            </div>
          </div>
        }
      </section>

      <!-- Clan Invitations -->
      <app-clan-invitations />

      <!-- Other Clans Section -->
      <section>
        <app-clan-list />
      </section>

      <!-- Create Clan Modal -->
      @if (showCreateClan) {
        <div class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg">Create New Clan</h3>
            <form (ngSubmit)="createClan()" class="space-y-4 mt-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Clan Name</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="newClan.name"
                  name="name"
                  class="input input-bordered"
                  maxlength="32"
                  required
                />
                <label class="label">
                  <span class="label-text-alt">3-32 characters</span>
                </label>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Clan Tag</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="newClan.tag"
                  name="tag"
                  class="input input-bordered"
                  maxlength="3"
                  required
                />
                <label class="label">
                  <span class="label-text-alt">Exactly 3 characters</span>
                </label>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Clan Slogan</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="newClan.slogan"
                  name="slogan"
                  class="input input-bordered"
                  maxlength="128"
                />
                <label class="label">
                  <span class="label-text-alt">Up to 128 characters</span>
                </label>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Company Info</span>
                </label>
                <textarea
                  [(ngModel)]="newClan.companyInfo"
                  name="companyInfo"
                  class="textarea textarea-bordered"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Open for Recruitment</span>
                  <input
                    type="checkbox"
                    [(ngModel)]="newClan.isRecruiting"
                    name="isRecruiting"
                    class="toggle toggle-primary"
                  />
                </label>
              </div>

              @if (newClan.isRecruiting) {
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Minimum Level</span>
                    </label>
                    <input
                      type="number"
                      [(ngModel)]="newClan.minimumLevel"
                      name="minimumLevel"
                      class="input input-bordered"
                      min="0"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Minimum Ranking Points</span>
                    </label>
                    <input
                      type="number"
                      [(ngModel)]="newClan.minimumRankingPoints"
                      name="minimumRankingPoints"
                      class="input input-bordered"
                      min="0"
                    />
                  </div>
                </div>
              }

              <div class="modal-action">
                <button type="button" class="btn" (click)="showCreateClan = false">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Clan</button>
              </div>
            </form>
          </div>
          <div class="modal-backdrop" (click)="showCreateClan = false"></div>
        </div>
      }
    </div>
  `
})
export class ClansComponent {
  private stateService = inject(StateService);
  protected clanData = this.stateService.clanData;
  protected showCreateClan = false;

  protected newClan = {
    name: '',
    tag: '',
    slogan: '',
    companyInfo: '',
    isRecruiting: true,
    minimumLevel: 0,
    minimumRankingPoints: 0
  };

  protected async createClan() {
    try {
      await this.stateService.createClan(this.newClan);
      this.showCreateClan = false;
      // Reset form
      this.newClan = {
        name: '',
        tag: '',
        slogan: '',
        companyInfo: '',
        isRecruiting: true,
        minimumLevel: 0,
        minimumRankingPoints: 0
      };
    } catch (error) {
      console.error('Error creating clan:', error);
      // TODO: Add error handling/notification
    }
  }
} 