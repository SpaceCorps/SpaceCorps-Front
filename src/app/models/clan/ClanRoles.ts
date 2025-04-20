export type ClanRole = 'LEADER' | 'CO_LEADER' | 'ELDER' | 'ROOKIE';

export const ClanRoleHierarchy: Record<ClanRole, number> = {
  'LEADER': 0,
  'CO_LEADER': 1,
  'ELDER': 2,
  'ROOKIE': 3
};

export interface ClanPermissions {
  canViewInfo: boolean;
  canInvite: boolean;
  canEditClan: boolean;
  canKickMembers: boolean;
}

export function getClanPermissions(role: ClanRole) {
  switch (role) {
    case 'LEADER':
      return {
        canManageMembers: true,
        canInvite: true,
        canEditClan: true,
        canKickMembers: true
      };
    case 'CO_LEADER':
      return {
        canManageMembers: true,
        canInvite: true,
        canEditClan: false,
        canKickMembers: true
      };
    case 'ELDER':
      return {
        canManageMembers: false,
        canInvite: true,
        canEditClan: false,
        canKickMembers: false
      };
    case 'ROOKIE':
      return {
        canManageMembers: false,
        canInvite: false,
        canEditClan: false,
        canKickMembers: false
      };
  }
}

export function getRoleFromNumber(roleNumber: number): ClanRole {
  switch (roleNumber) {
    case 0:
      return 'LEADER';
    case 1:
      return 'CO_LEADER';
    case 2:
      return 'ELDER';
    case 3:
      return 'ROOKIE';
    default:
      return 'ROOKIE';
  }
}

export function canKickMember(kickerRole: ClanRole, targetRole: ClanRole): boolean {
  if (kickerRole === 'LEADER') return true;
  if (kickerRole === 'CO_LEADER') return targetRole === 'ELDER' || targetRole === 'ROOKIE';
  if (kickerRole === 'ELDER') return targetRole === 'ROOKIE';
  return false;
} 