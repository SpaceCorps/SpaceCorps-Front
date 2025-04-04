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
}

export class AlienManager {
  private scene: THREE.Scene;
  private alienDictionary: Map<string, AlienMeshData> = new Map();
  private maxInstances: number = 100;
  private nextInstanceIndex: number = 0;
  private readonly MOVE_SPEED = 0.1;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
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
    const selectionBox = createSelectionBox(3);
    selectionBox.position.copy(alienData.position);
    selectionBox.userData = { type: 'alien', id: alienData.id };
    this.scene.add(selectionBox);

    // Create label group with health and shields
    const labelGroup = createEntityLabel(alienData.name, 100, 100);
    labelGroup.position.copy(alienData.position);
    this.scene.add(labelGroup);

    this.alienDictionary.set(alienData.id, {
      instancedMeshes: meshes.instancedMeshes,
      matrixArrays: meshes.matrixArrays,
      instanceIndex: this.nextInstanceIndex++,
      targetPosition: undefined,
      selectionBox,
      labelGroup
    });
  }

  public updateAlienPosition(id: string, position: THREE.Vector3): void {
    const alienData = this.alienDictionary.get(id);
    if (alienData) {
      alienData.targetPosition = position.clone();
      // Update selection box position immediately
      if (alienData.selectionBox) {
        alienData.selectionBox.position.copy(position);
      }
      // Update label position immediately
      if (alienData.labelGroup) {
        alienData.labelGroup.position.copy(position);
      }
    }
  }

  public removeAlien(id: string): void {
    const alienData = this.alienDictionary.get(id);
    if (alienData) {
      // Remove selection box
      if (alienData.selectionBox) {
        this.scene.remove(alienData.selectionBox);
      }
      // Remove label group
      if (alienData.labelGroup) {
        this.scene.remove(alienData.labelGroup);
      }
      // Remove instanced meshes
      for (const mesh of alienData.instancedMeshes) {
        this.scene.remove(mesh);
      }
      this.alienDictionary.delete(id);
    }
  }

  public removeAllAliens(): void {
    for (const [id, alienData] of this.alienDictionary) {
      // Remove selection boxes
      if (alienData.selectionBox) {
        this.scene.remove(alienData.selectionBox);
      }
      // Remove label groups
      if (alienData.labelGroup) {
        this.scene.remove(alienData.labelGroup);
      }
      // Remove instanced meshes
      for (const mesh of alienData.instancedMeshes) {
        this.scene.remove(mesh);
      }
    }
    this.alienDictionary.clear();
    this.nextInstanceIndex = 0;
  }

  public animate(): void {
    for (const [_, alienData] of this.alienDictionary) {
      if (alienData.targetPosition) {
        // Get current position from the matrix
        const currentMatrix = alienData.matrixArrays[alienData.instanceIndex];
        const currentPosition = new THREE.Vector3();
        currentMatrix.decompose(currentPosition, new THREE.Quaternion(), new THREE.Vector3());

        // Interpolate towards target position
        currentPosition.lerp(alienData.targetPosition, this.MOVE_SPEED);

        // Update the matrix with new position
        const matrix = new THREE.Matrix4();
        matrix.compose(
          currentPosition,
          new THREE.Quaternion(),
          new THREE.Vector3(1, 1, 1)
        );
        alienData.matrixArrays[alienData.instanceIndex] = matrix;

        // Update selection box position
        if (alienData.selectionBox) {
          alienData.selectionBox.position.copy(currentPosition);
        }

        // Update label group position
        if (alienData.labelGroup) {
          alienData.labelGroup.position.copy(currentPosition);
        }

        // If we're very close to the target, remove it
        if (currentPosition.distanceTo(alienData.targetPosition) < 0.01) {
          delete alienData.targetPosition;
        }
      }

      // Update instance matrices
      for (let i = 0; i < alienData.instancedMeshes.length; i++) {
        const matrix = alienData.matrixArrays[alienData.instanceIndex];
        if (matrix) {
          // Add rotation to the matrix
          const rotation = new THREE.Matrix4().makeRotationY(0.01);
          matrix.multiply(rotation);
          alienData.instancedMeshes[i].setMatrixAt(alienData.instanceIndex, matrix);
          alienData.instancedMeshes[i].instanceMatrix.needsUpdate = true;
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
          this.scene.add(instancedMesh);
        }
      });

      return { instancedMeshes, matrixArrays };
    } catch (error) {
      console.error('Error loading alien model:', error);
      return { instancedMeshes: [], matrixArrays: [] };
    }
  }
}
