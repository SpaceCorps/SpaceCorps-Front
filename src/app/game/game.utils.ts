import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PlayerDto, SpaceMapData, AlienDto } from './types/SpaceMapData';
import { GameComponent } from './game.component';
import { EntityDTO } from './types/Entity';
import { PlayerManager } from './PlayerManager';

export async function initializeThreeJs(
  component: GameComponent,
): Promise<void> {
  component.scene = new THREE.Scene();
  component.camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  component.renderer = new THREE.WebGLRenderer();
  component.renderer.setSize(window.innerWidth, window.innerHeight);

  component.renderer.domElement.style.position = 'absolute';
  component.renderer.domElement.style.top = '0';

  document.body.appendChild(component.renderer.domElement);

  component.controls = new OrbitControls(
    component.camera!,
    component.renderer!.domElement,
  );

  component.controls.enableDamping = true;
  component.camera.position.z = 5;

  const animate = () => {
    requestAnimationFrame(animate);
    component.renderer!.render(component.scene!, component.camera!);
  };

  animate();
}

export async function loadNewSpacemap(
  component: GameComponent,
  spaceMapData: SpaceMapData,
): Promise<void> {
  console.log('Loading new space map: ', spaceMapData);
  component.currentMapName = spaceMapData.mapName;
  await clearScene(component);
  await loadMapEnvironment(component, spaceMapData);

  // Load players and aliens for the new map
  await loadPlayers(spaceMapData.mapObject.players, component);
  await loadAliens(spaceMapData.mapObject.aliens, component);
}

export async function clearScene(component: GameComponent): Promise<void> {
  if (component.playerManager) {
    await component.playerManager.removeAllPlayers();
  }
  if (component.alienManager) {
    await component.alienManager.removeAllAliens();
  }
}

async function loadMapEnvironment(
  component: GameComponent,
  spaceMapData: SpaceMapData,
): Promise<void> {
  await createStars(component);
  await createLighting(component);
  await createSkybox(component, spaceMapData.mapName);
  await createStaticEntities(component);
}

export async function createStars(component: GameComponent): Promise<void> {
  // Implementation here
}

export async function createLighting(component: GameComponent): Promise<void> {
  if (!component.scene) {
    console.error('Scene not initialized, cannot create lighting');
    return;
  }
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  component.scene.add(directionalLight);
  component.scene.add(ambientLight);
}

export async function createSkybox(
  component: GameComponent,
  mapname?: string,
): Promise<void> {
  if (!component.scene) {
    console.error('Scene not initialized');
    return;
  }

  const loader = new THREE.CubeTextureLoader();
  const defaultMapname = 'G-1';

  if (!mapname) {
    mapname = defaultMapname;
    console.log(`No mapname provided, loading default map ${defaultMapname}`);
  }

  const loadSkybox = (name: string) => {
    return loader.load([
      `./spacemaps/${name}/right.png`,
      `./spacemaps/${name}/left.png`,
      `./spacemaps/${name}/top.png`,
      `./spacemaps/${name}/bottom.png`,
      `./spacemaps/${name}/front.png`,
      `./spacemaps/${name}/back.png`,
    ]);
  };

  try {
    component.scene.background = loadSkybox(mapname);
  } catch (error) {
    console.error(
      `Failed to load skybox for ${mapname}, loading default skybox`,
      error,
    );
    component.scene.background = loadSkybox(defaultMapname);
  }
}

export async function createStaticEntities(
  component: GameComponent,
): Promise<void> {
  // Implementation here
}

function parsePositionDTOtoVector3(position: {
  x: number;
  y: number;
  z: number;
}): THREE.Vector3 {
  return new THREE.Vector3(position.x, position.y, position.z);
}

export async function loadPlayers(
  playerDtos: PlayerDto[],
  component: GameComponent,
) {
  if (!component.playerManager) {
    console.error('Player manager not initialized');
    return;
  }
  for (const player of playerDtos) {
    await component.playerManager.addPlayer(
      player.id,
      player.activeShipName,
      parsePositionDTOtoVector3(player.position),
      new THREE.Euler(0, 0, 0),
    );
  }
}

export async function loadAliens(aliens: AlienDto[], component: GameComponent) {
  if (!component.alienManager) {
    console.error('Alien manager not initialized');
    return;
  }
  for (const alien of aliens) {
    if (alien.id === undefined) {
      console.error('Alien ID is undefined:', alien);
      continue;
    }
    await component.alienManager.addAlien(
      alien.id,
      parsePositionDTOtoVector3(alien.position),
    );
  }
}

export async function updateSpacemap(
  component: GameComponent,
  spaceMapData: SpaceMapData,
): Promise<void> {
  const entities = component.entities;
  const entitiesIn = spaceMapData.mapObject.players;

  // Update players
  if (component.playerManager) {
    for (const entity of entitiesIn) {
      if (entities.has(entity.id)) {
        const oldEntity = entities.get(entity.id)!;
        const newEntity = entity;

        //TODO: better check later, for now only based on position
        if (
          oldEntity.position.x !== newEntity.position.x ||
          oldEntity.position.y !== newEntity.position.y ||
          oldEntity.position.z !== newEntity.position.z
        ) {
          await component.playerManager.updatePlayerPosition(
            entity.id,
            parsePositionDTOtoVector3(entity.position),
            new THREE.Euler(0, 0, 0),
          );
        }

        oldEntity.position = newEntity.position;
      } else {
        entities.set(entity.id, entity);
        await component.playerManager.addPlayer(
          entity.id,
          entity.activeShipName,
          parsePositionDTOtoVector3(entity.position),
          new THREE.Euler(0, 0, 0),
        );
      }
    }

    for (const entity of entities) {
      if (!entitiesIn.find((e) => e.id === entity[0])) {
        await component.playerManager.removePlayer(entity[0]);
        entities.delete(entity[0]);
      }
    }
  }

  // Update aliens
  if (component.alienManager) {
    const aliens = spaceMapData.mapObject.aliens;
    const currentAlienIds = new Set(
      aliens.map((alien) => alien.id).filter((id) => id !== undefined),
    );

    // Remove aliens that are no longer in the map
    for (const [id, _] of component.alienManager.getAlienIds()) {
      if (!currentAlienIds.has(id)) {
        component.alienManager.removeAlien(id);
      }
    }

    // Add or update aliens
    for (const alien of aliens) {
      if (alien.id === undefined) {
        console.error('Alien ID is undefined:', alien);
        continue;
      }
      const position = parsePositionDTOtoVector3(alien.position);
      if (component.alienManager.hasAlien(alien.id)) {
        component.alienManager.updateAlienPosition(alien.id, position);
      } else {
        await component.alienManager.addAlien(alien.id, position);
      }
    }
  }
}
