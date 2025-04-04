import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class AlienManager {
  private scene: THREE.Scene;
  private alienDictionary: Map<string, { instancedMeshes: THREE.InstancedMesh[], matrixArrays: THREE.Matrix4[] }> = new Map();
  private maxInstances: number = 100;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  private async loadShipModel(): Promise<{ instancedMeshes: THREE.InstancedMesh[], matrixArrays: THREE.Matrix4[] }> {
    const loader = new GLTFLoader();
    try {
      const gltf = await loader.loadAsync('./models/ships/Protos/Protos.glb');
      const instancedMeshes: THREE.InstancedMesh[] = [];
      const matrixArrays: THREE.Matrix4[] = new Array(this.maxInstances).fill(new THREE.Matrix4());

      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const instancedMesh = new THREE.InstancedMesh(
            child.geometry,
            child.material,
            this.maxInstances
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

  public async addAlien(id: string, position: THREE.Vector3): Promise<void> {
    if (this.alienDictionary.has(id.toString())) {
      console.warn(`Alien with ID ${id} already exists`);
      return;
    }

    const shipData = await this.loadShipModel();
    if (shipData.instancedMeshes.length === 0) {
      console.error('Failed to load ship model');
      return;
    }

    // Create a new mesh for this alien
    const alienMesh = new THREE.Mesh();
    alienMesh.position.copy(position);
    
    // Add some random rotation for variety
    alienMesh.rotation.x = Math.random() * Math.PI;
    alienMesh.rotation.y = Math.random() * Math.PI;
    alienMesh.rotation.z = Math.random() * Math.PI;

    // Update instanced meshes
    for (let i = 0; i < shipData.instancedMeshes.length; i++) {
      const matrix = new THREE.Matrix4();
      matrix.compose(
        alienMesh.position,
        alienMesh.quaternion,
        alienMesh.scale
      );
      shipData.matrixArrays[this.alienDictionary.size] = matrix;
      shipData.instancedMeshes[i].setMatrixAt(this.alienDictionary.size, matrix);
      shipData.instancedMeshes[i].instanceMatrix.needsUpdate = true;
    }

    this.alienDictionary.set(id.toString(), shipData);
  }

  public updateAlienPosition(id: string, position: THREE.Vector3): void {
    const shipData = this.alienDictionary.get(id.toString());
    if (shipData) {
      // Update instanced meshes
      for (let i = 0; i < shipData.instancedMeshes.length; i++) {
        const matrix = new THREE.Matrix4();
        matrix.compose(
          position,
          new THREE.Quaternion(),
          new THREE.Vector3(1, 1, 1)
        );
        shipData.matrixArrays[this.alienDictionary.size] = matrix;
        shipData.instancedMeshes[i].setMatrixAt(this.alienDictionary.size, matrix);
        shipData.instancedMeshes[i].instanceMatrix.needsUpdate = true;
      }
    }
  }

  public removeAlien(id: string): void {
    const shipData = this.alienDictionary.get(id.toString());
    if (shipData) {
      // Remove instanced meshes from scene
      for (const mesh of shipData.instancedMeshes) {
        this.scene.remove(mesh);
      }
      this.alienDictionary.delete(id.toString());
    }
  }

  public removeAllAliens(): void {
    for (const [id, _] of this.alienDictionary) {
      this.removeAlien(id);
    }
  }

  public getAlienIds(): Map<string, { instancedMeshes: THREE.InstancedMesh[], matrixArrays: THREE.Matrix4[] }> {
    return this.alienDictionary;
  }

  public hasAlien(id: string): boolean {
    return this.alienDictionary.has(id.toString());
  }

  public animate(): void {
    // Update instanced meshes for each alien
    for (const [_, shipData] of this.alienDictionary) {
      for (let i = 0; i < shipData.instancedMeshes.length; i++) {
        let index = 0;
        for (const matrix of shipData.matrixArrays) {
          if (matrix) {
            // Add rotation to the matrix
            const rotation = new THREE.Matrix4().makeRotationY(0.01);
            matrix.multiply(rotation);
            shipData.instancedMeshes[i].setMatrixAt(index, matrix);
            index++;
          }
        }
        shipData.instancedMeshes[i].instanceMatrix.needsUpdate = true;
      }
    }
  }
}
