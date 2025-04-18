import { ClanRole } from './ClanData';

export interface CreateClanRequest {
  name: string;
  tag: string;
  slogan: string;
  logo: string;
  companyInfo: string;
  isRecruiting: boolean;
  minimumLevel: number;
  minimumRankingPoints: number;
}

export interface UpdateClanRequest {
  clanId: string;
  name?: string;
  tag?: string;
  slogan?: string;
  logo?: string;
  companyInfo?: string;
  isRecruiting?: boolean;
  minimumLevel?: number;
  minimumRankingPoints?: number;
}

export interface JoinClanRequest {
  clanId: string;
  username: string;
}

export interface LeaveClanRequest {
  clanId: string;
  username: string;
}

export interface KickMemberRequest {
  clanId: string;
  username: string;
  reason: string;
}

export interface ChangeMemberRoleRequest {
  clanId: string;
  username: string;
  newRole: ClanRole;
}

export interface InviteToClanRequest {
  clanId: string;
  username: string;
  message?: string;
}

export interface ClanInvitation {
  id: string;
  clanId: string;
  clanName: string;
  clanTag: string;
  invitedUsername: string;
  invitedByUsername: string;
  message?: string;
  dateCreated: string;
  status: InvitationStatus;
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED'
}

export enum ClanSortOption {
  NAME = 'NAME',
  LEVEL = 'LEVEL',
  MEMBERS = 'MEMBERS',
  EXPERIENCE = 'EXPERIENCE',
  HONOR = 'HONOR',
  SHIPS_DESTROYED = 'SHIPS_DESTROYED',
  ALIENS_DESTROYED = 'ALIENS_DESTROYED',
  RANKING_POINTS = 'RANKING_POINTS',
  DATE_CREATED = 'DATE_CREATED'
}

export interface ClanSearchRequest {
  searchTerm: string;
  isRecruiting?: boolean;
  minLevel?: number;
  maxLevel?: number;
  minRankingPoints?: number;
  maxRankingPoints?: number;
  sortBy?: ClanSortOption;
  sortDescending?: boolean;
  page: number;
  pageSize: number;
} 