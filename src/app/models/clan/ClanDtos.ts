export interface CreateClanRequest {
  name: string;
  tag: string;
  slogan: string;
  companyInfo?: string;
  isRecruiting: boolean;
  minimumLevel: number;
  minimumRankingPoints: number;
}

export interface InviteToClanRequest {
  username: string;
}

export interface UpdateMemberStatsRequest {
  experience: number;
  honor: number;
  shipsDestroyed: number;
  aliensDestroyed: number;
}

export interface ClanInvitation {
  id: string;
  username: string;
  inviteDate: string;
  expiryDate: string;
  isAccepted: boolean;
  isDeclined: boolean;
  clanId: string;
  clanName: string;
  clanTag: string;
  invitedByUsername: string;
  message?: string;
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
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
  DATE_CREATED = 'DATE_CREATED',
}

export interface ClanSearchRequest {
  searchTerm?: string;
  isRecruiting?: boolean;
  minLevel?: number;
  maxLevel?: number;
  minRankingPoints?: number;
  maxRankingPoints?: number;
  minClanLevel?: number;
  minMemberCount?: number;
  sortBy?: ClanSortOption;
}

export interface ClanData {
  id: string;
  name: string;
  tag: string;
  slogan: string;
  companyInfo: string;
  isRecruiting: boolean;
  minimumLevel: number;
  minimumRankingPoints: number;
  level: number;
  experience: number;
  honor: number;
  shipsDestroyed: number;
  aliensDestroyed: number;
  rankingPoints: number;
  dateCreated: string;
  members: ClanMember[];
}

export interface ClanMember {
  username: string;
  role: ClanRole;
  experience: number;
  honor: number;
  shipsDestroyed: number;
  aliensDestroyed: number;
  dateJoined: string;
}

export enum ClanRole {
  LEADER = 'LEADER',
  OFFICER = 'OFFICER',
  MEMBER = 'MEMBER'
}
