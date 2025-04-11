import { SizeProperty2D } from '../entity/SizeProperty2D';
import { StaticEntity } from '../entity/StaticEntity';
import { SpawnableAlien } from '../entity/SpawnableAlien';

export type SpaceMapDataEntry = {
  name: string;
  size: SizeProperty2D;
  preferredColor: string;
  staticEntities: StaticEntity[];
  spawnableAliens: SpawnableAlien[];
};
