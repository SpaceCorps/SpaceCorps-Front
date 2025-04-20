import { ClanRole } from "./ClanRoles";

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