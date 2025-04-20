import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ClanInvitation } from '../../models/clan/ClanDtos';

@Component({
  selector: 'app-clan-invitations',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!invitations() || invitations().length === 0) {
      <!-- Don't show anything if there are no invitations -->
    } @else {
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Clan Invitations</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (invitation of invitations(); track invitation.id) {
              <div class="card bg-base-200">
                <div class="card-body">
                  <h3 class="card-title">{{ invitation.clanName }}</h3>
                  <span class="badge badge-primary">{{ invitation.clanTag }}</span>
                  <p class="text-sm opacity-70">
                    Invited by: {{ invitation.invitedByUsername }}
                  </p>
                  @if (invitation.message) {
                    <p class="text-sm">{{ invitation.message }}</p>
                  }
                  <div class="card-actions justify-end mt-4">
                    <button class="btn btn-success" (click)="acceptInvitation(invitation)">
                      Accept
                    </button>
                    <button class="btn btn-error" (click)="declineInvitation(invitation)">
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class ClanInvitationsComponent {
  private stateService = inject(StateService);
  protected invitations = this.stateService.clanInvitations;

  protected async acceptInvitation(invitation: ClanInvitation): Promise<void> {
    try {
      await this.stateService.acceptClanInvitation(invitation.id);
    } catch (error) {
      console.error('Error accepting clan invitation:', error);
      // TODO: Add error handling/notification
    }
  }

  protected async declineInvitation(invitation: ClanInvitation): Promise<void> {
    try {
      await this.stateService.declineClanInvitation(invitation.id);
    } catch (error) {
      console.error('Error declining clan invitation:', error);
      // TODO: Add error handling/notification
    }
  }
} 