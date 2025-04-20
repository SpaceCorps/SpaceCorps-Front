import { Component, Input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClanData } from '../../models/clan/ClanDtos';
import { StateService } from '../../services/state.service';
import { ClanEditComponent } from '../clan-edit/clan-edit.component';
import { ClanListComponent } from '../clan-list/clan-list.component';
import {
  ClanRole,
  getClanPermissions,
  canKickMember,
  getRoleFromNumber
} from '../../models/clan/ClanRoles';

type MemberRole = 'LEADER' | 'CO_LEADER' | 'ELDER' | 'ROOKIE';

@Component({
  selector: 'app-clan-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ClanEditComponent, ClanListComponent],
  templateUrl: './clan-details.component.html'
})
export class ClanDetailsComponent {
  @Input() clan!: ClanData | null;
  private stateService = inject(StateService);

  protected inviteUsername = '';
  protected permissions: ReturnType<typeof getClanPermissions> | null = null;
  protected currentUserRole: MemberRole | null = null;

  constructor() {
    effect(() => {
      const currentPlayer = this.stateService.currentPlayer();
      if (currentPlayer && this.clan) {
        const member = this.clan.members.find(
          (m) => m.username === currentPlayer.username
        );
        if (member) {
          const roleNumber = typeof member.role === 'number' ? member.role : 0;
          this.currentUserRole = getRoleFromNumber(roleNumber) as MemberRole;
          this.permissions = getClanPermissions(this.currentUserRole as ClanRole);
        }
      }
    });
  }

  protected getRoleBadgeClass(role: string | number): string {
    const roleStr = typeof role === 'number' ? getRoleFromNumber(role) : role;
    switch (roleStr) {
      case 'LEADER':
        return 'badge-primary';
      case 'CO_LEADER':
        return 'badge-secondary';
      case 'ELDER':
        return 'badge-accent';
      default:
        return 'badge-ghost';
    }
  }

  protected isLeader(): boolean {
    return this.currentUserRole === 'LEADER';
  }

  protected canKickCurrentMember(memberRole: string | number): boolean {
    if (!this.currentUserRole) return false;
    const memberRoleStr = typeof memberRole === 'number' ? getRoleFromNumber(memberRole) : memberRole;
    return canKickMember(this.currentUserRole as ClanRole, memberRoleStr as ClanRole);
  }

  protected async invitePlayer() {
    if (!this.clan || !this.inviteUsername) return;
    try {
      await this.stateService.inviteToClan(this.clan.id, {
        username: this.inviteUsername,
      });
      this.inviteUsername = '';
    } catch (error) {
      console.error('Error inviting player:', error);
      // TODO: Add error handling/notification
    }
  }

  protected async kickMember(username: string) {
    if (!this.clan) return;
    try {
      await this.stateService.kickMember(this.clan.id, username);
    } catch (error) {
      console.error('Error kicking member:', error);
      // TODO: Add error handling/notification
    }
  }

  protected async leaveClan() {
    if (!this.clan) return;
    try {
      const username = this.stateService.authService.getUsername();
      if (!username) return;
      await this.stateService.leaveClan(this.clan.id, username);
    } catch (error) {
      console.error('Error leaving clan:', error);
      // TODO: Add error handling/notification
    }
  }

  protected async deleteClan() {
    if (!this.clan) return;
    try {
      const username = this.stateService.authService.getUsername();
      if (!username) return;
      await this.stateService.deleteClan(this.clan.id, username);
    } catch (error) {
      console.error('Error deleting clan:', error);
      // TODO: Add error handling/notification
    }
  }
}
