import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createSelectionBox, createEntityLabel } from './game.utils';

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
  labelGroup?: THREE.Group;
  currentPosition: THREE.Vector3;
  currentRotation: THREE.Quaternion;
  currentScale: THREE.Vector3;
}

export class AlienManager {
  private scene: THREE.Scene;
  private alienDictionary: Map<string, AlienMeshData> = new Map();
  private maxInstances: number = 100;
  private nextInstanceIndex: number = 0;
  private readonly MOVE_SPEED = 0.1;
  private rootGroup: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'aliens';
    this.scene.add(this.rootGroup);
  }

  private async loadShipModel(
    alienName: string,
  ): Promise<{
    instancedMeshes: THREE.InstancedMesh[];
    matrixArrays: THREE.Matrix4[];
  }> {
    const loader = new GLTFLoader();
    try {
      console.log(`Loading alien model for: ${alienName}`);
      const gltf = await loader.loadAsync(
        `/models/ships/Protos/Protos.glb`,
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
          instancedMesh.name = alienName;
          instancedMeshes.push(instancedMesh);
          this.rootGroup.add(instancedMesh);
        }
      });

      return { instancedMeshes, matrixArrays };
    } catch (error) {
      console.error('Error loading alien model:', error);
      return { instancedMeshes: [], matrixArrays: [] };
    }
  }

  public async addAlien(alienData: AlienData): Promise<void> {
    const existingAlien = this.alienDictionary.get(alienData.id);
    if (existingAlien) {
      this.updateAlienPosition(alienData.id, alienData.position);
      return;
    }

    const meshes = await this.loadShipModel(alienData.name);
    if (!meshes) return;

    // Create selection box for raycasting
    const selectionBox = createSelectionBox();
    selectionBox.position.copy(alienData.position);
    selectionBox.userData = { type: 'alien', id: alienData.id };
    this.rootGroup.add(selectionBox);

    // Create label group with health and shields
    const labelGroup = createEntityLabel(alienData.name, 100, 100);
    labelGroup.position.copy(alienData.position);
    this.rootGroup.add(labelGroup);

    this.alienDictionary.set(alienData.id, {
      instancedMeshes: meshes.instancedMeshes,
      matrixArrays: meshes.matrixArrays,
      instanceIndex: this.nextInstanceIndex++,
      targetPosition: undefined,
      selectionBox,
      labelGroup,
      currentPosition: alienData.position.clone(),
      currentRotation: new THREE.Quaternion(),
      currentScale: new THREE.Vector3(1, 1, 1)
    });
  }

  public updateAlienPosition(id: string, position: THREE.Vector3): void {
    const alienData = this.alienDictionary.get(id);
    if (alienData) {
      alienData.targetPosition = position.clone();
      // Don't update label and selection box positions immediately anymore
      // They will be updated in the animate method along with the model
    }
  }

  public removeAlien(id: string): void {
    const alienData = this.alienDictionary.get(id);
    if (alienData) {
      // Remove selection box
      if (alienData.selectionBox) {
        this.rootGroup.remove(alienData.selectionBox);
      }
      // Remove label group
      if (alienData.labelGroup) {
        this.rootGroup.remove(alienData.labelGroup);
      }
      // Remove instanced meshes
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
    for (const [_, alienData] of this.alienDictionary) {
      if (alienData.targetPosition) {
        // Calculate movement direction
        const moveDirection = new THREE.Vector3();
        moveDirection.subVectors(alienData.targetPosition, alienData.currentPosition);
        
        // Only update rotation if we're actually moving
        if (moveDirection.length() > 0.01) {
          // Calculate the angle to rotate to
          const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
          
          // Create quaternion for target rotation
          const targetQuaternion = new THREE.Quaternion();
          targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetRotation);
          
          // Smoothly interpolate current rotation to target rotation
          alienData.currentRotation.slerp(targetQuaternion, 0.1);
        }

        // Interpolate towards target position
        alienData.currentPosition.lerp(alienData.targetPosition, this.MOVE_SPEED);

        // Update matrices for all meshes
        const matrix = new THREE.Matrix4();
        matrix.compose(
          alienData.currentPosition,
          alienData.currentRotation,
          alienData.currentScale
        );
        
        for (const mesh of alienData.instancedMeshes) {
          mesh.setMatrixAt(alienData.instanceIndex, matrix);
          mesh.instanceMatrix.needsUpdate = true;
        }

        // Update selection box and label positions
        if (alienData.selectionBox) {
          alienData.selectionBox.position.copy(alienData.currentPosition);
        }
        if (alienData.labelGroup) {
          alienData.labelGroup.position.copy(alienData.currentPosition);
        }

        // If we're very close to the target, remove it
        if (alienData.currentPosition.distanceTo(alienData.targetPosition) < 0.01) {
          delete alienData.targetPosition;
        }
      }
    }
  }

  public hasAlien(id: string): boolean {
    return this.alienDictionary.has(id);
  }

  public getAlienIds(): IterableIterator<[string, AlienMeshData]> {
    return this.alienDictionary.entries();
  }
}
