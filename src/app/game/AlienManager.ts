import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

interface AlienData {
  id: string;
  name: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

export class AlienManager {
  private scene: THREE.Scene;
  private alienDictionary: Map<
    string,
    {
      instancedMeshes: THREE.InstancedMesh[];
      matrixArrays: THREE.Matrix4[];
      instanceIndex: number;
      targetPosition?: THREE.Vector3;
    }
  > = new Map();
  private maxInstances: number = 100;
  private nextInstanceIndex: number = 0;
  private readonly MOVE_SPEED = 0.1; // Adjust this value to control movement speed

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  private async loadShipModel(): Promise<{
    instancedMeshes: THREE.InstancedMesh[];
    matrixArrays: THREE.Matrix4[];
  }> {
    const loader = new GLTFLoader();
    try {
      const gltf = await loader.loadAsync('/models/ships/Protos/Protos.glb');
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

  public async addAlien(alien: AlienData): Promise<void> {
    if (this.alienDictionary.has(alien.id)) {
      console.warn(`Alien with ID ${alien.id} already exists`);
      return;
    }

    if (this.nextInstanceIndex >= this.maxInstances) {
      console.warn('Maximum number of aliens reached');
      return;
    }

    const shipData = await this.loadShipModel();
    if (shipData.instancedMeshes.length === 0) {
      console.error('Failed to load ship model');
      return;
    }

    // Create a new mesh for this alien
    const alienMesh = new THREE.Mesh();
    alienMesh.position.copy(alien.position);
    alienMesh.name = alien.name;

    // Add some random rotation for variety
    alienMesh.rotation.x = Math.random() * Math.PI;
    alienMesh.rotation.y = Math.random() * Math.PI;
    alienMesh.rotation.z = Math.random() * Math.PI;

    // Update instanced meshes
    for (let i = 0; i < shipData.instancedMeshes.length; i++) {
      const matrix = new THREE.Matrix4();
      matrix.compose(alienMesh.position, alienMesh.quaternion, alienMesh.scale);
      shipData.matrixArrays[this.nextInstanceIndex] = matrix;
      shipData.instancedMeshes[i].setMatrixAt(this.nextInstanceIndex, matrix);
      shipData.instancedMeshes[i].instanceMatrix.needsUpdate = true;
    }

    this.alienDictionary.set(alien.id, {
      ...shipData,
      instanceIndex: this.nextInstanceIndex,
    });
    this.nextInstanceIndex++;
  }

  public updateAlienPosition(id: string, position: THREE.Vector3): void {
    const alienData = this.alienDictionary.get(id);
    if (alienData) {
      // Store the target position instead of moving immediately
      alienData.targetPosition = position.clone();
    }
  }

  public removeAlien(id: string): void {
    const alienData = this.alienDictionary.get(id);
    if (alienData) {
      // Remove instanced meshes from scene
      for (const mesh of alienData.instancedMeshes) {
        this.scene.remove(mesh);
      }
      this.alienDictionary.delete(id);
    }
  }

  public removeAllAliens(): void {
    for (const [id, _] of this.alienDictionary) {
      this.removeAlien(id);
    }
    this.nextInstanceIndex = 0;
  }

  public getAlienIds(): Map<
    string,
    {
      instancedMeshes: THREE.InstancedMesh[];
      matrixArrays: THREE.Matrix4[];
      instanceIndex: number;
    }
  > {
    return this.alienDictionary;
  }

  public hasAlien(id: string): boolean {
    return this.alienDictionary.has(id);
  }

  public animate(): void {
    // Update instanced meshes for each alien
    for (const [_, alienData] of this.alienDictionary) {
      if (alienData.targetPosition) {
        // Get current position from the matrix
        const currentMatrix = alienData.matrixArrays[alienData.instanceIndex];
        const currentPosition = new THREE.Vector3();
        currentMatrix.decompose(
          currentPosition,
          new THREE.Quaternion(),
          new THREE.Vector3(),
        );

        // Interpolate towards target position
        currentPosition.lerp(alienData.targetPosition, this.MOVE_SPEED);

        // Update the matrix with new position
        const matrix = new THREE.Matrix4();
        matrix.compose(
          currentPosition,
          new THREE.Quaternion(),
          new THREE.Vector3(1, 1, 1),
        );
        alienData.matrixArrays[alienData.instanceIndex] = matrix;

        // If we're very close to the target, remove it
        if (currentPosition.distanceTo(alienData.targetPosition) < 0.01) {
          delete alienData.targetPosition;
        }
      }

      for (let i = 0; i < alienData.instancedMeshes.length; i++) {
        const matrix = alienData.matrixArrays[alienData.instanceIndex];
        if (matrix) {
          // Add rotation to the matrix
          const rotation = new THREE.Matrix4().makeRotationY(0.01);
          matrix.multiply(rotation);
          alienData.instancedMeshes[i].setMatrixAt(
            alienData.instanceIndex,
            matrix,
          );
          alienData.instancedMeshes[i].instanceMatrix.needsUpdate = true;
        }
      }
    }
  }
}
