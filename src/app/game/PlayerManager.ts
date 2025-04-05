import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createSelectionBox, createEntityLabel } from './game.utils';

// Static cache for geometries and materials
const modelCache = new Map<string, {
  geometries: Map<string, THREE.BufferGeometry>;
  materials: Map<string, THREE.Material>;
  instancedMeshes: THREE.InstancedMesh[];
}>();

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
      
      // Check if we already have this model in cache
      let cache = modelCache.get('Protos');
      if (!cache) {
        cache = {
          geometries: new Map(),
          materials: new Map(),
          instancedMeshes: []
        };
        modelCache.set('Protos', cache);

        const gltf = await loader.loadAsync(
          `/models/ships/Protos/Protos.glb`,
        );

        // Process all meshes and cache geometries/materials
        const meshData: { geometry: THREE.BufferGeometry, material: THREE.Material }[] = [];
        
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const geometryKey = child.geometry.uuid;
            const materialKey = child.material.uuid;

            if (!cache!.geometries.has(geometryKey)) {
              cache!.geometries.set(geometryKey, child.geometry);
            }
            if (!cache!.materials.has(materialKey)) {
              cache!.materials.set(materialKey, child.material);
            }

            meshData.push({
              geometry: cache!.geometries.get(geometryKey)!,
              material: cache!.materials.get(materialKey)!
            });
          }
        });

        // Create instanced meshes using the original geometry-material pairs
        for (const { geometry, material } of meshData) {
          const instancedMesh = new THREE.InstancedMesh(
            geometry,
            material,
            this.maxInstances
          );
          instancedMesh.name = `Protos_instanced`;
          instancedMesh.frustumCulled = false;
          cache.instancedMeshes.push(instancedMesh);
          this.rootGroup.add(instancedMesh);
        }
      }

      // Create matrices for this instance
      const matrixArrays: THREE.Matrix4[] = [];
      const initialMatrix = new THREE.Matrix4();
      initialMatrix.compose(
        initialPosition,
        new THREE.Quaternion(),
        new THREE.Vector3(1, 1, 1)
      );

      for (const mesh of cache.instancedMeshes) {
        const matrix = initialMatrix.clone();
        matrixArrays.push(matrix);
        mesh.setMatrixAt(this.nextInstanceIndex, matrix);
        mesh.instanceMatrix.needsUpdate = true;
      }

      return { instancedMeshes: cache.instancedMeshes, matrixArrays };
    } catch (error) {
      console.error('Error loading player model:', error);
      return { instancedMeshes: [], matrixArrays: [] };
    }
  }

  public async addPlayer(playerData: PlayerData): Promise<void> {
    // First check if we already have this player
    const existingPlayer = this.playerDictionary.get(playerData.id);
    if (existingPlayer) {
      // If we have an existing player, remove it first to ensure clean state
      this.removePlayer(playerData.id);
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
      mesh.computeBoundingSphere(); // Force bounding sphere update
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
        this.updatePlayerMatrices(playerData);

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

  public getPlayerPosition(id: string): THREE.Vector3 | undefined {
    const playerData = this.playerDictionary.get(id);
    if (playerData) {
      return playerData.currentPosition.clone();
    }
    return undefined;
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