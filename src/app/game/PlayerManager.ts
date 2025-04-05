import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createSelectionBox, createEntityLabel } from './game.utils';

interface PlayerData {
  id: string;
  name: string;
  activeShipName: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

interface PlayerMeshData {
  instancedMeshes: THREE.InstancedMesh[];
  matrixArrays: THREE.Matrix4[];
  instanceIndex: number;
  targetPosition?: THREE.Vector3;
  currentPosition: THREE.Vector3;
  currentRotation: THREE.Quaternion;
  currentScale: THREE.Vector3;
  selectionBox?: THREE.Mesh;
  labelGroup?: THREE.Group;
}

export class PlayerManager {
  private scene: THREE.Scene;
  private playerDictionary: Map<string, PlayerMeshData> = new Map();
  private maxInstances: number = 100;
  private nextInstanceIndex: number = 0;
  private readonly MOVE_SPEED = 0.1;
  private rootGroup: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'players';
    this.scene.add(this.rootGroup);
  }

  private async loadShipModel(
    playerName: string,
    initialPosition: THREE.Vector3
  ): Promise<{
    instancedMeshes: THREE.InstancedMesh[];
    matrixArrays: THREE.Matrix4[];
  }> {
    const loader = new GLTFLoader();
    try {
      console.log(`Loading player model for: ${playerName}`);
      const gltf = await loader.loadAsync(
        `/models/ships/Protos/Protos.glb`,
      );

      const instancedMeshes: THREE.InstancedMesh[] = [];
      const matrixArrays: THREE.Matrix4[] = [];

      // Create a single initial matrix for this instance
      const initialMatrix = new THREE.Matrix4();
      initialMatrix.compose(
        initialPosition,
        new THREE.Quaternion(),
        new THREE.Vector3(1, 1, 1)
      );

      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const instancedMesh = new THREE.InstancedMesh(
            child.geometry,
            child.material,
            this.maxInstances,
          );
          instancedMesh.name = playerName;
          
          // Initialize all matrices for this mesh
          const meshMatrices: THREE.Matrix4[] = [];
          for (let i = 0; i < this.maxInstances; i++) {
            const matrix = initialMatrix.clone();
            meshMatrices.push(matrix);
            instancedMesh.setMatrixAt(i, matrix);
          }
          
          instancedMesh.instanceMatrix.needsUpdate = true;
          matrixArrays.push(...meshMatrices);
          instancedMeshes.push(instancedMesh);
          this.rootGroup.add(instancedMesh);
        }
      });

      return { instancedMeshes, matrixArrays };
    } catch (error) {
      console.error('Error loading player model:', error);
      return { instancedMeshes: [], matrixArrays: [] };
    }
  }

  public async addPlayer(playerData: PlayerData): Promise<void> {
    const existingPlayer = this.playerDictionary.get(playerData.id);
    if (existingPlayer) {
      this.updatePlayerPosition(playerData.id, playerData.position);
      return;
    }

    const meshes = await this.loadShipModel(playerData.name, playerData.position);
    if (!meshes || meshes.instancedMeshes.length === 0) return;

    // Create selection box for raycasting
    const selectionBox = createSelectionBox();
    selectionBox.position.copy(playerData.position);
    selectionBox.userData = { type: 'player', id: playerData.id };
    this.rootGroup.add(selectionBox);

    // Create label group with health and shields
    const labelGroup = createEntityLabel(playerData.name, 100, 100);
    labelGroup.position.copy(playerData.position);
    this.rootGroup.add(labelGroup);

    const playerMeshData: PlayerMeshData = {
      instancedMeshes: meshes.instancedMeshes,
      matrixArrays: meshes.matrixArrays,
      instanceIndex: this.nextInstanceIndex++,
      currentPosition: playerData.position.clone(),
      currentRotation: new THREE.Quaternion(),
      currentScale: new THREE.Vector3(1, 1, 1),
      targetPosition: undefined,
      selectionBox,
      labelGroup
    };

    this.playerDictionary.set(playerData.id, playerMeshData);

    // Set initial matrices for all meshes
    this.updatePlayerMatrices(playerMeshData);
  }

  private updatePlayerMatrices(playerData: PlayerMeshData): void {
    const matrix = new THREE.Matrix4();
    matrix.compose(
      playerData.currentPosition,
      playerData.currentRotation,
      playerData.currentScale
    );

    for (const mesh of playerData.instancedMeshes) {
      mesh.setMatrixAt(playerData.instanceIndex, matrix);
      mesh.instanceMatrix.needsUpdate = true;
    }
  }

  public updatePlayerPosition(id: string, position: THREE.Vector3): void {
    const playerData = this.playerDictionary.get(id);
    if (playerData) {
      playerData.targetPosition = position.clone();
    }
  }

  public removePlayer(id: string): void {
    const playerData = this.playerDictionary.get(id);
    if (playerData) {
      if (playerData.selectionBox) {
        this.rootGroup.remove(playerData.selectionBox);
      }
      if (playerData.labelGroup) {
        this.rootGroup.remove(playerData.labelGroup);
      }
      for (const mesh of playerData.instancedMeshes) {
        this.rootGroup.remove(mesh);
      }
      this.playerDictionary.delete(id);
    }
  }

  public removeAllPlayers(): void {
    for (const [id, _] of this.playerDictionary) {
      this.removePlayer(id);
    }
    this.playerDictionary.clear();
    this.nextInstanceIndex = 0;
  }

  public animate(): void {
    for (const [_, playerData] of this.playerDictionary) {
      if (playerData.targetPosition) {
        // Calculate movement direction
        const moveDirection = new THREE.Vector3();
        moveDirection.subVectors(playerData.targetPosition, playerData.currentPosition);
        
        // Only update rotation if we're actually moving
        if (moveDirection.length() > 0.01) {
          // Calculate the angle to rotate to
          const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
          
          // Create quaternion for target rotation
          const targetQuaternion = new THREE.Quaternion();
          targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetRotation);
          
          // Smoothly interpolate current rotation to target rotation
          playerData.currentRotation.slerp(targetQuaternion, 0.1);
        }

        // Interpolate towards target position
        playerData.currentPosition.lerp(playerData.targetPosition, this.MOVE_SPEED);

        // Update matrices for all meshes
        const matrix = new THREE.Matrix4();
        matrix.compose(
          playerData.currentPosition,
          playerData.currentRotation,
          playerData.currentScale
        );
        
        for (const mesh of playerData.instancedMeshes) {
          mesh.setMatrixAt(playerData.instanceIndex, matrix);
          mesh.instanceMatrix.needsUpdate = true;
        }

        // Update selection box and label positions
        if (playerData.selectionBox) {
          playerData.selectionBox.position.copy(playerData.currentPosition);
        }
        if (playerData.labelGroup) {
          playerData.labelGroup.position.copy(playerData.currentPosition);
        }

        // If we're very close to the target, remove it
        if (playerData.currentPosition.distanceTo(playerData.targetPosition) < 0.01) {
          delete playerData.targetPosition;
        }
      }
    }
  }

  public hasPlayer(id: string): boolean {
    return this.playerDictionary.has(id);
  }

  public getPlayerIds(): IterableIterator<[string, PlayerMeshData]> {
    return this.playerDictionary.entries();
  }

  public getPlayerShip(id: string): THREE.Object3D | undefined {
    const playerData = this.playerDictionary.get(id);
    if (playerData && playerData.instancedMeshes.length > 0) {
      return playerData.instancedMeshes[0];
    }
    return undefined;
  }
} 