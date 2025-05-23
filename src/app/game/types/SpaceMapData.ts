import { Position3 } from '../../models/entity/Position3';

export interface StaticEntityDto {
  id: string;
  name: string;
  position: Position3;
  locationName: string;
  safeZoneRadii: number;
}

export interface PortalDto extends StaticEntityDto {
  destinationMap: string;
  teleportRange: number;
}

export interface SpaceMapData {
  mapName: string;
  mapObject: {
    players: PlayerDto[];
    aliens: AlienDto[];
    preferredColor: string;
    size: {
      width: number;
      height: number;
    };
    staticEntities: (StaticEntityDto | PortalDto)[];
  };
}

export type PlayerDto = {
  id: string;
  name: string;
  position: Position3;
  activeShipName: string;
};

export type AlienDto = {
  id: string;
  name: string;
  position: Position3;
};
