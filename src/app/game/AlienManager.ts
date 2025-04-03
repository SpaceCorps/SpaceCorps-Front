import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AlienManager {
  private scene: THREE.Scene;
  private alienMeshes: Map<number, THREE.Mesh>;
  private defaultAlienModel: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.alienMeshes = new Map<number, THREE.Mesh>();
    this.defaultAlienModel = this.createDefaultAlienModel();
  }

  private createDefaultAlienModel(): THREE.Mesh {
    // Create a simple alien model (temporary until we have proper models)
    const geometry = new THREE.ConeGeometry(0.5, 1, 4);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0xff0000,
      emissive: 0x330000,
      shininess: 100
    });
    return new THREE.Mesh(geometry, material);
  }

  public async addAlien(id: number, position: THREE.Vector3): Promise<void> {
    if (this.alienMeshes.has(id)) {
      console.warn(`Alien with ID ${id} already exists`);
      return;
    }

    // Clone the default model for this alien
    const alienMesh = this.defaultAlienModel.clone();
    alienMesh.position.copy(position);
    
    // Add some random rotation for variety
    alienMesh.rotation.x = Math.random() * Math.PI;
    alienMesh.rotation.y = Math.random() * Math.PI;
    alienMesh.rotation.z = Math.random() * Math.PI;

    this.scene.add(alienMesh);
    this.alienMeshes.set(id, alienMesh);
  }

  public updateAlienPosition(id: number, position: THREE.Vector3): void {
    const alienMesh = this.alienMeshes.get(id);
    if (alienMesh) {
      alienMesh.position.copy(position);
    }
  }

  public removeAlien(id: number): void {
    const mesh = this.alienMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      this.alienMeshes.delete(id);
    }
  }

  public async removeAllAliens(): Promise<void> {
    for (const [id, mesh] of this.alienMeshes) {
      this.scene.remove(mesh);
    }
    this.alienMeshes.clear();
  }

  public animate(): void {
    // Add some animation to the aliens
    this.alienMeshes.forEach((mesh) => {
      mesh.rotation.y += 0.01;
      // Add some floating motion
      mesh.position.y += Math.sin(Date.now() * 0.001) * 0.001;
    });
  }

  public getAlienIds(): Map<number, THREE.Mesh> {
    return this.alienMeshes;
  }

  public hasAlien(id: number): boolean {
    return this.alienMeshes.has(id);
  }
} 