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