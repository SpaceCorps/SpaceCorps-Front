import {Position3} from '../../models/entity/Position3';

export type SpaceMapData = {
  mapName: string;
  mapObject: {
    aliens: AlienDto[];
    players: PlayerDto[];
    preferredColor: string;
    size: {
      width: number;
      height: number;
    }
    staticEntities: any[];
  }

};

export type PlayerDto = {
  activeShipName: string;
  currentMapName: string;
  id: string;
  position: Position3;
  username: string;
}

export type AlienDto = {
  id: string;
  name: string;
  position: Position3;
  health: number;
  type: string;
}
