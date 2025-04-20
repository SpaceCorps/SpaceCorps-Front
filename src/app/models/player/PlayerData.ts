import { Position3 } from '../entity/Position3';

export interface PlayerData {
  id: string;
  username: string;
  level: number;
  rankingPoints: number;
  position: Position3;
  userId: string;
  dateOfRegistration: string;
  totalPlayTime: number;
  credits: number;
  thulium: number;
  currentMap: string;
  experience: number;
  honor: number;
  shipsDestroyed: number;
  aliensDestroyed: number;
  completedQuests: number;
  completedGates: number;
  title: string;
  isOnline: boolean;
  isInvisible: boolean;
}
