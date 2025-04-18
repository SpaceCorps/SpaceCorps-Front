import { Position3 } from '../entity/Position3';

export type PlayerData = {
  id: string;
  username: string;
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
  rankingPoints: number;
  completedQuests: number;
  completedGates: number;
  title: string;
  isOnline: boolean;
  isInvisible: boolean;
};
