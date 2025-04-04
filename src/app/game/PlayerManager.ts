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

  constructor(scene: THREE.Scene) {
    this.scene = scene;
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
          this.scene.add(instancedMesh);
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
    const selectionBox = createSelectionBox(3);
    selectionBox.position.copy(playerData.position);
    selectionBox.userData = { type: 'player', id: playerData.id };
    this.scene.add(selectionBox);

    // Create label group with health and shields
    const labelGroup = createEntityLabel(playerData.name, 100, 100);
    labelGroup.position.copy(playerData.position);
    this.scene.add(labelGroup);

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
      playerData.targetPosition = position.clone();
      // Don't update label and selection box positions immediately anymore
      // They will be updated in the animate method along with the model
    }
  }

  public async removePlayer(id: string): Promise<void> {
    const playerData = this.playerDictionary.get(id);
    if (playerData) {
      // Remove selection box
      if (playerData.selectionBox) {
        this.scene.remove(playerData.selectionBox);
      }
      // Remove label group
      if (playerData.labelGroup) {
        this.scene.remove(playerData.labelGroup);
      }
      // Remove instanced meshes
      for (const mesh of playerData.instancedMeshes) {
        this.scene.remove(mesh);
      }
      this.playerDictionary.delete(id);
    }
  }

  public async removeAllPlayers(): Promise<void> {
    for (const [id, playerData] of this.playerDictionary) {
      // Remove selection boxes
      if (playerData.selectionBox) {
        this.scene.remove(playerData.selectionBox);
      }
      // Remove label groups
      if (playerData.labelGroup) {
        this.scene.remove(playerData.labelGroup);
      }
      // Remove instanced meshes
      for (const mesh of playerData.instancedMeshes) {
        this.scene.remove(mesh);
      }
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
    for (const [_, playerData] of this.playerDictionary) {
      if (playerData.targetPosition) {
        // Get current position from the matrix
        const currentMatrix = playerData.matrixArrays[playerData.instanceIndex];
        const currentPosition = new THREE.Vector3();
        currentMatrix.decompose(currentPosition, new THREE.Quaternion(), new THREE.Vector3());

        // Interpolate towards target position
        currentPosition.lerp(playerData.targetPosition, this.MOVE_SPEED);

        // Update the matrix with new position
        const matrix = new THREE.Matrix4();
        matrix.compose(
          currentPosition,
          new THREE.Quaternion(),
          new THREE.Vector3(1, 1, 1)
        );
        playerData.matrixArrays[playerData.instanceIndex] = matrix;

        // Update selection box and label positions to match the interpolated position
        if (playerData.selectionBox) {
          playerData.selectionBox.position.copy(currentPosition);
        }
        if (playerData.labelGroup) {
          playerData.labelGroup.position.copy(currentPosition);
        }

        // If we're very close to the target, remove it
        if (currentPosition.distanceTo(playerData.targetPosition) < 0.01) {
          delete playerData.targetPosition;
        }
      }

      // Update instance matrices
      for (let i = 0; i < playerData.instancedMeshes.length; i++) {
        const matrix = playerData.matrixArrays[playerData.instanceIndex];
        if (matrix) {
          // Add rotation to the matrix
          const rotation = new THREE.Matrix4().makeRotationY(0.01);
          matrix.multiply(rotation);
          playerData.instancedMeshes[i].setMatrixAt(playerData.instanceIndex, matrix);
          playerData.instancedMeshes[i].instanceMatrix.needsUpdate = true;
        }
      }
    }
  }
}
