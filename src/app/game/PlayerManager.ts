import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createSelectionBox, createEntityLabel } from './game.utils';

interface PlayerData {
  id: string;
  name: string;
  shipName: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

interface PlayerMeshData {
  instancedMeshes: THREE.InstancedMesh[];
  matrixArrays: THREE.Matrix4[];
  instanceIndex: number;
  targetPosition?: THREE.Vector3;
  selectionBox?: THREE.Mesh;
  labelGroup?: THREE.Group;
}

export class PlayerManager {
  private scene: THREE.Scene;
  private playerDictionary: Map<string, PlayerMeshData> = new Map();
  private maxInstances: number = 100;
  private nextInstanceIndex: number = 0;
  private readonly MOVE_SPEED = 0.1; // Adjust this value to control movement speed
  private rootGroup: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'players';
    this.scene.add(this.rootGroup);
  }

  private async loadShipModel(
    shipName: string,
    playerName: string,
  ): Promise<{
    instancedMeshes: THREE.InstancedMesh[];
    matrixArrays: THREE.Matrix4[];
  }> {
    const loader = new GLTFLoader();
    try {
      console.log(`Loading ship model: ${shipName}`);
      const gltf = await loader.loadAsync(
        `/models/ships/${shipName}/${shipName}.glb`,
      );
      const instancedMeshes: THREE.InstancedMesh[] = [];
      const matrixArrays: THREE.Matrix4[] = new Array(this.maxInstances).fill(
        new THREE.Matrix4(),
      );

      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const instancedMesh = new THREE.InstancedMesh(
            child.geometry,
            child.material,
            this.maxInstances,
          );
          instancedMesh.name = playerName;
          instancedMeshes.push(instancedMesh);
          this.rootGroup.add(instancedMesh);
        }
      });

      return { instancedMeshes, matrixArrays };
    } catch (error) {
      console.error('Error loading ship model:', error);
      return { instancedMeshes: [], matrixArrays: [] };
    }
  }

  public async addPlayer(playerData: PlayerData): Promise<void> {
    const existingPlayer = this.playerDictionary.get(playerData.id);
    if (existingPlayer) {
      this.updatePlayerPosition(playerData.id, playerData.position);
      return;
    }

    const meshes = await this.loadShipModel(playerData.shipName, playerData.name);
    if (!meshes) return;

    // Create selection box for raycasting
    const selectionBox = createSelectionBox();
    selectionBox.position.copy(playerData.position);
    selectionBox.userData = { type: 'player', id: playerData.id };
    this.rootGroup.add(selectionBox);

    // Create label group with health and shields
    const labelGroup = createEntityLabel(playerData.name, 100, 100);
    labelGroup.position.copy(playerData.position);
    this.rootGroup.add(labelGroup);

    this.playerDictionary.set(playerData.id, {
      instancedMeshes: meshes.instancedMeshes,
      matrixArrays: meshes.matrixArrays,
      instanceIndex: this.nextInstanceIndex++,
      targetPosition: undefined,
      selectionBox,
      labelGroup
    });
  }

  public updatePlayerPosition(id: string, position: THREE.Vector3): void {
    const playerData = this.playerDictionary.get(id);
    if (playerData) {
      console.log(`[PlayerManager] Setting target position for player ${id}:`, position.toArray());
      playerData.targetPosition = position.clone();
    } else {
      console.warn(`[PlayerManager] Tried to update position for non-existent player ${id}`);
    }
  }

  public async removePlayer(id: string): Promise<void> {
    const playerData = this.playerDictionary.get(id);
    if (playerData) {
      // Remove selection box
      if (playerData.selectionBox) {
        this.rootGroup.remove(playerData.selectionBox);
      }
      // Remove label group
      if (playerData.labelGroup) {
        this.rootGroup.remove(playerData.labelGroup);
      }
      // Remove instanced meshes
      for (const mesh of playerData.instancedMeshes) {
        this.rootGroup.remove(mesh);
      }
      this.playerDictionary.delete(id);
    }
  }

  public async removeAllPlayers(): Promise<void> {
    for (const [id, playerData] of this.playerDictionary) {
      await this.removePlayer(id);
    }
    this.playerDictionary.clear();
    this.nextInstanceIndex = 0;
  }

  public getPlayerIds(): Map<
    string,
    {
      instancedMeshes: THREE.InstancedMesh[];
      matrixArrays: THREE.Matrix4[];
      instanceIndex: number;
    }
  > {
    return this.playerDictionary;
  }

  public hasPlayer(id: string): boolean {
    return this.playerDictionary.has(id);
  }

  public getPlayerShip(id: string): THREE.InstancedMesh | undefined {
    const playerData = this.playerDictionary.get(id);
    if (playerData && playerData.instancedMeshes.length > 0) {
      return playerData.instancedMeshes[0];
    }
    return undefined;
  }

  public animate(): void {
    for (const [playerId, playerData] of this.playerDictionary) {
      if (playerData.targetPosition) {
        console.log(`[PlayerManager] Animating player ${playerId}`);
        
        // Get current position from the first instanced mesh's matrix
        const currentPosition = new THREE.Vector3();
        const currentRotation = new THREE.Quaternion();
        const currentScale = new THREE.Vector3();
        
        if (!playerData.matrixArrays[playerData.instanceIndex]) {
          console.error(`[PlayerManager] No matrix found for player ${playerId} at index ${playerData.instanceIndex}`);
          continue;
        }

        playerData.matrixArrays[playerData.instanceIndex].decompose(
          currentPosition,
          currentRotation,
          currentScale
        );

        console.log(`[PlayerManager] Current position:`, currentPosition.toArray());
        console.log(`[PlayerManager] Target position:`, playerData.targetPosition.toArray());

        // Interpolate towards target position
        currentPosition.lerp(playerData.targetPosition, this.MOVE_SPEED);
        console.log(`[PlayerManager] Interpolated position:`, currentPosition.toArray());

        // Update all instanced meshes with new position
        for (let i = 0; i < playerData.instancedMeshes.length; i++) {
          const matrix = new THREE.Matrix4();
          
          // Add rotation
          const rotationMatrix = new THREE.Matrix4().makeRotationY(0.01);
          currentRotation.multiply(new THREE.Quaternion().setFromRotationMatrix(rotationMatrix));
          
          // Compose new matrix with updated position and rotation
          matrix.compose(
            currentPosition,
            currentRotation,
            currentScale
          );
          
          playerData.matrixArrays[playerData.instanceIndex] = matrix;
          playerData.instancedMeshes[i].setMatrixAt(playerData.instanceIndex, matrix);
          playerData.instancedMeshes[i].instanceMatrix.needsUpdate = true;
        }

        // Update selection box and label positions
        if (playerData.selectionBox) {
          playerData.selectionBox.position.copy(currentPosition);
        }
        if (playerData.labelGroup) {
          playerData.labelGroup.position.copy(currentPosition);
        }

        // If we're very close to the target, remove it
        if (currentPosition.distanceTo(playerData.targetPosition) < 0.01) {
          console.log(`[PlayerManager] Player ${playerId} reached target position`);
          delete playerData.targetPosition;
        }
      }
    }
  }
}
