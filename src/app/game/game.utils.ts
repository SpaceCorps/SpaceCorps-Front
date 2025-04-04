import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PlayerDto, SpaceMapData, AlienDto } from './types/SpaceMapData';
import { GameComponent } from './game.component';
import { EntityDTO } from './types/Entity';
import { PlayerManager } from './PlayerManager';

// Define layers
const LAYERS = {
  DEFAULT: 0,
  RAYCAST: 1
};

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

  // Disable panning completely
  component.controls.enablePan = false;
  component.controls.enableDamping = true;
  component.controls.dampingFactor = 0.05;

  // Set initial camera position
  component.camera.position.set(0, 0, 10);
  component.controls.target.set(0, 0, 0);

  // Add raycasting for left-click
  const raycaster = new THREE.Raycaster();
  raycaster.layers.set(LAYERS.RAYCAST);
  const mouse = new THREE.Vector2();

  component.renderer.domElement.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, component.camera!);

    // Get all objects in the raycast layer
    const intersects = raycaster.intersectObjects(component.scene!.children);
    
    if (intersects.length > 0) {
      const intersect = intersects[0]; // Get the closest intersect
      const userData = intersect.object.userData;
      
      if (userData['type'] === 'player') {
        console.log('Clicked player:', userData['id']);
      } else if (userData['type'] === 'alien') {
        console.log('Clicked alien:', userData['id']);
      } else if (userData['type'] === 'plane') {
        console.log('Clicked plane at:', intersect.point);
      }
    }
  });

  const animate = () => {
    requestAnimationFrame(animate);
    component.renderer!.render(component.scene!, component.camera!);
  };

  animate();
}

// Helper function to create a selection box
export function createSelectionBox(size: number = 2): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshBasicMaterial({
    visible: false,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.layers.set(LAYERS.RAYCAST);
  return mesh;
}

export async function loadNewSpacemap(
  component: GameComponent,
  spaceMapData: SpaceMapData,
): Promise<void> {
  if (component.isLoadingSpacemap) {
    console.log('Skipping spacemap update - still loading previous map');
    return;
  }

  try {
    component.isLoadingSpacemap = true;
    console.log('Loading new space map: ', spaceMapData);
    component.currentMapName = spaceMapData.mapName;
    await clearScene(component);
    await loadMapEnvironment(component, spaceMapData);

    // Load players and aliens for the new map
    await loadPlayers(spaceMapData.mapObject.players, component);
    await loadAliens(spaceMapData.mapObject.aliens, component);
  } finally {
    component.isLoadingSpacemap = false;
  }
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
  await createSpacemapPlane(component, spaceMapData);
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

async function createSpacemapPlane(
  component: GameComponent,
  spaceMapData: SpaceMapData,
): Promise<void> {
  if (!component.scene) {
    console.error('Scene not initialized');
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 0));

  const width = spaceMapData.mapObject.Size.width;
  const height = spaceMapData.mapObject.Size.height;

  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = Math.PI / 2;
  plane.position.y = 0;
  plane.name = 'spacemapPlane';
  plane.layers.set(LAYERS.RAYCAST);
  plane.userData = { type: 'plane' };

  component.scene.add(plane);
  console.log('Spacemap plane added to scene:', plane);
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
    await component.playerManager.addPlayer({
      id: player.id,
      name: player.id,
      shipName: player.activeShipName,
      position: parsePositionDTOtoVector3(player.position),
      rotation: new THREE.Euler(0, 0, 0),
    });
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
    const position = parsePositionDTOtoVector3(alien.position);
    if (component.alienManager.hasAlien(alien.id)) {
      component.alienManager.updateAlienPosition(alien.id, position);
    } else {
      await component.alienManager.addAlien({
        id: alien.id,
        name: alien.name,
        position: position,
        rotation: new THREE.Euler(0, 0, 0),
      });
    }
  }
}

export async function updateSpacemap(
  component: GameComponent,
  spaceMapData: SpaceMapData,
): Promise<void> {
  if (component.isLoadingSpacemap) {
    console.log('Skipping spacemap update - still loading previous map');
    return;
  }

  try {
    component.isLoadingSpacemap = true;
    const entities = component.entities;
    const entitiesIn = spaceMapData.mapObject.players;

    // Store the spacemap plane before clearing
    const spacemapPlane = component.scene?.getObjectByName('spacemapPlane');

    // Update players
    if (component.playerManager) {
      for (const entity of entitiesIn) {
        if (entities.has(entity.id)) {
          const oldEntity = entities.get(entity.id)!;
          const newEntity = entity;

          if (
            oldEntity.position.x !== newEntity.position.x ||
            oldEntity.position.y !== newEntity.position.y ||
            oldEntity.position.z !== newEntity.position.z
          ) {
            component.playerManager.updatePlayerPosition(
              entity.id,
              parsePositionDTOtoVector3(entity.position),
            );
          }

          oldEntity.position = newEntity.position;
        } else {
          entities.set(entity.id, entity);
          await component.playerManager.addPlayer({
            id: entity.id,
            name: entity.id,
            shipName: entity.activeShipName,
            position: parsePositionDTOtoVector3(entity.position),
            rotation: new THREE.Euler(0, 0, 0),
          });
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
          await component.alienManager.addAlien({
            id: alien.id,
            name: alien.name,
            position: position,
            rotation: new THREE.Euler(0, 0, 0),
          });
        }
      }
    }

    // Re-add the spacemap plane if it was removed
    if (spacemapPlane && !component.scene?.getObjectByName('spacemapPlane')) {
      component.scene?.add(spacemapPlane);
    }
  } finally {
    component.isLoadingSpacemap = false;
  }
}
