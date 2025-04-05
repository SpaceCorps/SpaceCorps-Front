import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createSelectionBox } from './game.utils';

// Static cache for geometries and materials
const modelCache = new Map<string, {
  geometries: Map<string, THREE.BufferGeometry>;
  materials: Map<string, THREE.Material>;
  instancedMeshes: THREE.InstancedMesh[];
}>();

interface AlienData {
  id: string;
  name: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

interface AlienMeshData {
  instancedMeshes: THREE.InstancedMesh[];
  matrixArrays: THREE.Matrix4[];
  instanceIndex: number;
  targetPosition?: THREE.Vector3;
  selectionBox?: THREE.Mesh;
  currentPosition: THREE.Vector3;
  currentRotation: THREE.Quaternion;
  currentScale: THREE.Vector3;
}

export class AlienManager {
  private scene: THREE.Scene;
  private alienDictionary: Map<string, AlienMeshData> = new Map();
  private maxInstances: number = 512;
  private nextInstanceIndex: number = 0;
  private readonly MOVE_SPEED = 10; // Units per second
  private rootGroup: THREE.Group;
  private needsMatrixUpdate: boolean = false;
  private lastUpdateTime: number = 0;
  private readonly UPDATE_INTERVAL = 4; // ~240fps
  private readonly ROTATION_SPEED = 0.2;
  private tempVector: THREE.Vector3 = new THREE.Vector3();
  private tempQuaternion: THREE.Quaternion = new THREE.Quaternion();
  private tempMatrix: THREE.Matrix4 = new THREE.Matrix4();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'aliens';
    this.scene.add(this.rootGroup);
    this.lastUpdateTime = performance.now();
  }

  private async loadShipModel(
    alienName: string,
    position: THREE.Vector3
  ): Promise<{
    instancedMeshes: THREE.InstancedMesh[];
    matrixArrays: THREE.Matrix4[];
  }> {
    const loader = new GLTFLoader();
    try {
      console.log(`Loading alien model for: ${alienName}`);
      
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
        position,
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
      console.error('Error loading alien model:', error);
      return { instancedMeshes: [], matrixArrays: [] };
    }
  }

  private updateAlienMatrices(alienData: AlienMeshData): void {
    this.tempMatrix.compose(
      alienData.currentPosition,
      alienData.currentRotation,
      alienData.currentScale
    );

    for (const mesh of alienData.instancedMeshes) {
      mesh.setMatrixAt(alienData.instanceIndex, this.tempMatrix);
    }
    
    // Only update instance matrix once per mesh
    for (const mesh of alienData.instancedMeshes) {
      mesh.instanceMatrix.needsUpdate = true;
    }
  }

  public async addAlien(alienData: AlienData): Promise<void> {
    if (this.hasAlien(alienData.id)) {
      this.removeAlien(alienData.id);
    }

    const meshes = await this.loadShipModel(alienData.name, alienData.position);
    if (!meshes || meshes.instancedMeshes.length === 0) return;

    // Create selection box for raycasting
    const selectionBox = createSelectionBox();
    selectionBox.position.copy(alienData.position);
    selectionBox.userData = { type: 'alien', id: alienData.id };
    this.rootGroup.add(selectionBox);

    const alienMeshData: AlienMeshData = {
      instancedMeshes: meshes.instancedMeshes,
      matrixArrays: meshes.matrixArrays,
      instanceIndex: this.nextInstanceIndex++,
      currentPosition: alienData.position.clone(),
      currentRotation: new THREE.Quaternion(),
      currentScale: new THREE.Vector3(1, 1, 1),
      targetPosition: undefined,
      selectionBox
    };

    this.alienDictionary.set(alienData.id, alienMeshData);

    // Set initial matrices for all meshes
    this.updateAlienMatrices(alienMeshData);
  }

  public updateAlienPosition(id: string, position: THREE.Vector3): void {
    const alienData = this.alienDictionary.get(id);
    if (alienData) {
      // Set target position for movement
      alienData.targetPosition = position.clone();
      
      // Calculate movement direction for rotation
      if (alienData.currentPosition && !alienData.currentPosition.equals(position)) {
        this.tempVector.subVectors(position, alienData.currentPosition);
        const targetRotation = Math.atan2(this.tempVector.x, this.tempVector.z);
        this.tempQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetRotation);
        alienData.currentRotation.slerp(this.tempQuaternion, this.ROTATION_SPEED);
      }
      
      this.needsMatrixUpdate = true;
    }
  }

  public removeAlien(id: string): void {
    const alienData = this.alienDictionary.get(id);
    if (alienData) {
      if (alienData.selectionBox) {
        this.rootGroup.remove(alienData.selectionBox);
      }
      for (const mesh of alienData.instancedMeshes) {
        this.rootGroup.remove(mesh);
      }
      this.alienDictionary.delete(id);
    }
  }

  public removeAllAliens(): void {
    for (const [id, _] of this.alienDictionary) {
      this.removeAlien(id);
    }
    this.alienDictionary.clear();
    this.nextInstanceIndex = 0;
  }

  public animate(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;

    // Update at high refresh rate for smooth movement
    if (deltaTime >= this.UPDATE_INTERVAL) {
      const deltaSeconds = deltaTime / 1000; // Convert to seconds
      const moveDistance = this.MOVE_SPEED * deltaSeconds; // Distance to move this frame

      // Batch update all matrices
      for (const [_, alienData] of this.alienDictionary) {
        if (alienData.targetPosition) {
          // Calculate direction to target
          this.tempVector.subVectors(alienData.targetPosition, alienData.currentPosition);
          const distanceToTarget = this.tempVector.length();

          if (distanceToTarget > 0.01) {
            // Normalize direction vector
            this.tempVector.normalize();
            
            // Move towards target at constant speed
            if (distanceToTarget <= moveDistance) {
              // If we would overshoot, just snap to target
              alienData.currentPosition.copy(alienData.targetPosition);
              delete alienData.targetPosition;
            } else {
              // Move at constant speed
              this.tempVector.multiplyScalar(moveDistance);
              alienData.currentPosition.add(this.tempVector);
            }

            // Update selection box position
            if (alienData.selectionBox) {
              alienData.selectionBox.position.copy(alienData.currentPosition);
            }

            // Update matrices for all meshes
            this.updateAlienMatrices(alienData);
          } else {
            // We're close enough, snap to target
            alienData.currentPosition.copy(alienData.targetPosition);
            delete alienData.targetPosition;
          }
        }
      }

      this.lastUpdateTime = currentTime;
    }
  }

  public hasAlien(id: string): boolean {
    return this.alienDictionary.has(id);
  }

  public getAlienIds(): IterableIterator<[string, AlienMeshData]> {
    return this.alienDictionary.entries();
  }
}
