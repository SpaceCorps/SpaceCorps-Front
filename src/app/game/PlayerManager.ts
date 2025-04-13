import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createSelectionBox } from './game.utils';
import { UpdateManager } from './UpdateManager';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Static cache for geometries and materials
const modelCache = new Map<
  string,
  {
    geometries: Map<string, THREE.BufferGeometry>;
    materials: Map<string, THREE.Material>;
    instancedMeshes: THREE.InstancedMesh[];
  }
>();

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
  nameLabel?: CSS2DObject;
}

export class PlayerManager {
  private scene: THREE.Scene;
  private playerDictionary: Map<string, PlayerMeshData> = new Map();
  private maxInstances: number = 512;
  private nextInstanceIndex: number = 0;
  private readonly MOVE_SPEED = 50; // Units per second (increased from 5)
  private readonly MAX_CATCHUP_DISTANCE = 10; // Maximum distance to catch up in one frame
  private rootGroup: THREE.Group;
  private needsMatrixUpdate: boolean = false;
  private lastUpdateTime: number = 0;
  private readonly UPDATE_INTERVAL = 4; // ~240fps
  private readonly ROTATION_SPEED = 0.2;
  private updateManager: UpdateManager;
  private tempVector: THREE.Vector3 = new THREE.Vector3();
  private tempQuaternion: THREE.Quaternion = new THREE.Quaternion();
  private tempMatrix: THREE.Matrix4 = new THREE.Matrix4();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'players';
    this.scene.add(this.rootGroup);
    this.lastUpdateTime = performance.now();
    this.updateManager = new UpdateManager();
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
          instancedMeshes: [],
        };
        modelCache.set('Protos', cache);

        const gltf = await loader.loadAsync(`/models/ships/Protos/Protos.glb`);

        // Process all meshes and cache geometries/materials
        const meshData: {
          geometry: THREE.BufferGeometry;
          material: THREE.Material;
        }[] = [];

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
              material: cache!.materials.get(materialKey)!,
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
          
          // Initialize all instance matrices to a position far away
          const farMatrix = new THREE.Matrix4();
          farMatrix.compose(
            new THREE.Vector3(0, -10000, 0), // Position far below the scene
            new THREE.Quaternion(),
            new THREE.Vector3(1, 1, 1)
          );
          for (let i = 0; i < this.maxInstances; i++) {
            instancedMesh.setMatrixAt(i, farMatrix);
          }
          
          // Set the first instance's position
          const firstMatrix = new THREE.Matrix4();
          firstMatrix.compose(
            initialPosition,
            new THREE.Quaternion(),
            new THREE.Vector3(1, 1, 1)
          );
          instancedMesh.setMatrixAt(0, firstMatrix);
          
          instancedMesh.instanceMatrix.needsUpdate = true;
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
    if (this.hasPlayer(playerData.id)) {
      this.removePlayer(playerData.id);
    }

    const meshes = await this.loadShipModel(
      playerData.name,
      playerData.position
    );
    if (!meshes || meshes.instancedMeshes.length === 0) return;

    // Create selection box for raycasting
    const selectionBox = createSelectionBox();
    selectionBox.position.copy(playerData.position);
    selectionBox.userData = { type: 'player', id: playerData.id };
    this.rootGroup.add(selectionBox);

    // Create name label
    const nameDiv = document.createElement('div');
    nameDiv.className = 'player-label';
    nameDiv.textContent = playerData.name;
    nameDiv.style.color = 'white';
    nameDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    nameDiv.style.padding = '2px 5px';
    nameDiv.style.borderRadius = '3px';
    const nameLabel = new CSS2DObject(nameDiv);
    nameLabel.position.set(0, -0.5, 0); // Position below the player
    selectionBox.add(nameLabel);

    const playerMeshData: PlayerMeshData = {
      instancedMeshes: meshes.instancedMeshes,
      matrixArrays: meshes.matrixArrays,
      instanceIndex: this.nextInstanceIndex++,
      currentPosition: playerData.position.clone(),
      currentRotation: new THREE.Quaternion(),
      currentScale: new THREE.Vector3(1, 1, 1),
      targetPosition: undefined,
      selectionBox,
      nameLabel
    };

    this.playerDictionary.set(playerData.id, playerMeshData);

    // Set initial matrices for all meshes
    this.updatePlayerMatrices(playerMeshData);
  }

  private updatePlayerMatrices(playerData: PlayerMeshData): void {
    this.tempMatrix.compose(
      playerData.currentPosition,
      playerData.currentRotation,
      playerData.currentScale
    );

    for (const mesh of playerData.instancedMeshes) {
      mesh.setMatrixAt(playerData.instanceIndex, this.tempMatrix);
    }

    // Only update instance matrix once per mesh
    for (const mesh of playerData.instancedMeshes) {
      mesh.instanceMatrix.needsUpdate = true;
    }
  }

  public updatePlayerPosition(id: string, position: THREE.Vector3): void {
    const playerData = this.playerDictionary.get(id);
    if (playerData) {
      // Set the target position
      playerData.targetPosition = position.clone();

      // Calculate movement direction for rotation
      if (
        playerData.currentPosition &&
        !playerData.currentPosition.equals(position)
      ) {
        this.tempVector.subVectors(position, playerData.currentPosition);
        const targetRotation = Math.atan2(this.tempVector.x, this.tempVector.z);
        this.tempQuaternion.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          targetRotation
        );
        playerData.currentRotation.slerp(
          this.tempQuaternion,
          this.updateManager.getInterpolationFactor()
        );
      }

      this.needsMatrixUpdate = true;
    }
  }

  public removePlayer(id: string): void {
    const playerData = this.playerDictionary.get(id);
    if (playerData) {
      if (playerData.selectionBox) {
        this.rootGroup.remove(playerData.selectionBox);
      }
      for (const mesh of playerData.instancedMeshes) {
        mesh.setMatrixAt(playerData.instanceIndex, new THREE.Matrix4());
        mesh.instanceMatrix.needsUpdate = true;
      }
      this.playerDictionary.delete(id);
    }
  }

  public removeAllPlayers(): void {
    for (const [id] of this.playerDictionary) {
      this.removePlayer(id);
    }
    this.playerDictionary.clear();
    this.nextInstanceIndex = 0;
  }

  public animate(): void {
    const interpolationFactor = this.updateManager.getInterpolationFactor();

    // Batch update all matrices
    for (const [, playerData] of this.playerDictionary) {
      if (playerData.targetPosition) {
        // Calculate distance to target
        this.tempVector.subVectors(
          playerData.targetPosition,
          playerData.currentPosition
        );
        const distanceToTarget = this.tempVector.length();

        if (distanceToTarget > 0.00001) {
          // Smoothly interpolate towards target position
          playerData.currentPosition.lerp(
            playerData.targetPosition,
            interpolationFactor
          );

          // Update selection box position
          if (playerData.selectionBox) {
            playerData.selectionBox.position.copy(playerData.currentPosition);
          }

          // Update matrices for all meshes
          this.updatePlayerMatrices(playerData);
        } else {
          // We're close enough, snap to target
          playerData.currentPosition.copy(playerData.targetPosition);
          delete playerData.targetPosition;
        }
      }
    }

    this.updateManager.update();
  }

  public onSignalRUpdate(): void {
    this.updateManager.onSignalRUpdate();
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
