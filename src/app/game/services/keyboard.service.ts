import { Injectable } from '@angular/core';
import { HubService } from './hub.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class KeyboardService {
  private scene?: THREE.Scene;

  constructor(private hubService: HubService) {
    this.initializeKeyboardListeners();
  }

  private initializeKeyboardListeners(): void {
    window.addEventListener('keydown', (event) => this.handleKeyPress(event));
  }

  private async handleKeyPress(event: KeyboardEvent): Promise<void> {
    switch (event.key) {
      case 'o':
        await this.logEntities();
        console.log(this.scene!.children);
        break;
      default:
        break;
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
}
