import { Injectable } from '@angular/core';
import { HubService } from './hub.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class KeyboardService {
  private scene?: THREE.Scene;
  private playerPosition?: THREE.Vector3;
  private portals: THREE.Mesh[] = [];
  private readonly TELEPORT_DISTANCE = 5; // Distance within which player can teleport

  constructor(private hubService: HubService) {
    this.initializeKeyboardListeners();
  }

  private initializeKeyboardListeners(): void {
    window.addEventListener('keydown', (event) => this.handleKeyPress(event));
  }

  private async handleKeyPress(event: KeyboardEvent): Promise<void> {
    switch (event.key.toLowerCase()) {
      case 'o':
        await this.logEntities();
        console.log(this.scene!.children);
        break;
      case 'j':
        await this.handleTeleport();
        break;
      default:
        break;
    }
  }

  private async handleTeleport(): Promise<void> {
    if (!this.playerPosition || !this.portals.length) return;

    // Find the closest portal
    let closestPortal: THREE.Mesh | null = null;
    let minDistance = Infinity;

    for (const portal of this.portals) {
      const distance = this.playerPosition.distanceTo(portal.position);
      if (distance < this.TELEPORT_DISTANCE && distance < minDistance) {
        minDistance = distance;
        closestPortal = portal;
      }
    }

    if (closestPortal) {
      const destinationMap = closestPortal.userData['destinationMap'];
      if (destinationMap) {
        await this.hubService.send('requestTeleport', {
          destinationMap: destinationMap,
        });
      }
    }
  }

  private async logEntities() {
    await this.hubService.send('logEntities', null);
  }

  async setScene(scene: THREE.Scene | undefined) {
    if (scene) {
      this.scene = scene;
    }
  }

  setPlayerPosition(position: THREE.Vector3) {
    this.playerPosition = position;
  }

  addPortal(portal: THREE.Mesh) {
    this.portals.push(portal);
  }

  clearPortals() {
    this.portals = [];
  }
}
