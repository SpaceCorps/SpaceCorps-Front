export interface ClanData {
  id: string;
  name: string;
  tag: string;
  slogan: string;
  companyInfo: string;
  leader: string;
  officers: string[];
  members: ClanMember[];
  activeMembers: number;
  totalMembers: number;
  totalExperience: number;
  totalHonor: number;
  totalShipsDestroyed: number;
  totalAliensDestroyed: number;
  level: number;
  rankingPoints: number;
  dateCreated: string;
  isRecruiting: boolean;
  minimumLevel: number;
  minimumRankingPoints: number;
}

export interface ClanMember {
  username: string;
  role: ClanRole;
  experience: number;
  honor: number;
  shipsDestroyed: number;
  aliensDestroyed: number;
  joinDate: string;
  lastActive: string;
  isOnline: boolean;
}

export enum ClanRole {
  LEADER = 'LEADER',
  OFFICER = 'OFFICER',
  MEMBER = 'MEMBER',
  RECRUIT = 'RECRUIT'
} 