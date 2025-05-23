import * as THREE from 'three';

interface StaticEntity {
  id: string;
  name: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

export class StaticEntityManager {
  private scene: THREE.Scene;
  private staticEntities: Map<string, THREE.Mesh> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public async addStaticEntity(entity: StaticEntity): Promise<void> {
    if (this.staticEntities.has(entity.id)) {
      console.warn(`Static entity with ID ${entity.id} already exists`);
      return;
    }

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(entity.position);
    mesh.rotation.copy(entity.rotation);
    mesh.userData = {
      type: 'staticEntity',
      id: entity.id,
      name: entity.name
    };

    this.staticEntities.set(entity.id, mesh);
    this.scene.add(mesh);
  }

  public createPortal(position: THREE.Vector3, destinationMap: string): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5
    });
    const portal = new THREE.Mesh(geometry, material);
    portal.position.copy(position);
    portal.userData = {
      type: 'portal',
      destinationMap: destinationMap
    };
    this.scene.add(portal);
    return portal;
  }

  public updateStaticEntityPosition(id: string, position: THREE.Vector3): void {
    const entity = this.staticEntities.get(id);
    if (entity) {
      entity.position.copy(position);
    }
  }

  public removeStaticEntity(id: string): void {
    const entity = this.staticEntities.get(id);
    if (entity) {
      this.scene.remove(entity);
      this.staticEntities.delete(id);
    }
  }

  public async removeAllStaticEntities(): Promise<void> {
    for (const [id] of this.staticEntities) {
      this.removeStaticEntity(id);
    }
  }

  public hasStaticEntity(id: string): boolean {
    return this.staticEntities.has(id);
  }

  public getStaticEntityIds(): Map<string, THREE.Mesh> {
    return this.staticEntities;
  }

  public getStaticEntityPosition(id: string): THREE.Vector3 | undefined {
    return this.staticEntities.get(id)?.position;
  }
} 