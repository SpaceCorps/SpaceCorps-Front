import { Position3 } from '../entity/Position3';

export type PlayerData = {
  id: string;
  username: string;
  position: Position3;
  userId: string;
  dateOfRegistration: string;
  totalPlayTime: number;
  cats: number;
  thulium: number;
  currentMap: string;
}
