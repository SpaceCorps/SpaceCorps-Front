import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { HubService } from './services/hub.service';
import { ActivatedRoute } from '@angular/router';
import { PlayerDto, SpaceMapData } from './types/SpaceMapData';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {
  initializeThreeJs,
  loadNewSpacemap,
  loadPlayers,
  updateSpacemap,
} from './game.utils';
import { KeyboardService } from './services/keyboard.service';
import { PlayerData } from '../models/player/PlayerData';
import { AlienManager } from './AlienManager';
import { PlayerManager } from './PlayerManager';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
  public camera?: THREE.PerspectiveCamera;
  public renderer?: THREE.WebGLRenderer;
  public scene?: THREE.Scene;
  public controls?: OrbitControls;
  public entities: Map<string, PlayerDto> = new Map();
  public alienManager?: AlienManager;
  public playerManager?: PlayerManager;
  public stats?: Stats;
  public currentMapName?: string;
  public playerData: PlayerData | undefined;
  public ups: number = 0;
  public drawCalls: number = 0;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private updateCount: number = 0;
  public isLoadingSpacemap: boolean = false;
  public labelRenderer?: CSS2DRenderer;

  constructor(
    private hubService: HubService,
    private route: ActivatedRoute,
    private keyboardService: KeyboardService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      const username = params['username'];
      await this.hubService.initializeSignalR(username);
      this.setupSignalREvents(this.hubService);
      await this.initializeGame();
      await this.keyboardService.setScene(this.scene);
    });

    document.body.style.overflow = 'hidden';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  public setupSignalREvents(hubService: HubService): void {
    hubService.on('server-side-log', (data) => {
      console.log('Server-side log:', data);
    });

    hubService.on('server-side-error', (error) => {
      console.warn('HubMessage: Received error:', error);
    });

    hubService.on('loginSuccessful', (response: PlayerData) => {
      console.log('HubMessage: Login successful:', response);
      this.playerData = response;
    });

    hubService.on('loginFailed', (response: string) => {
      console.error('HubMessage: Login failed:', response);
    });

    hubService.on('logEntities', (entities) => {
      console.log('HubMessage: Entities:', entities);
    });

    hubService.on('moveFailed', (reason: string) => {
      console.error('HubMessage: Movement failed:', reason);
      // Here you could add UI feedback, like a toast notification
    });

    hubService.on('spacemapUpdate', async (spaceMapData: SpaceMapData) => {
      // Update UPS counter
      this.updateCount++;
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;
      
      if (deltaTime >= 1000) {
        this.ups = Math.round((this.updateCount * 1000) / deltaTime);
        this.updateCount = 0;
        this.lastTime = currentTime;
      }

      if (this.currentMapName != spaceMapData.mapName) {
        await loadNewSpacemap(this, spaceMapData);
        // Reset orbit controls to origin when switching maps
        if (this.controls) {
          this.controls.target.set(0, 0, 0);
          this.camera!.position.set(0, 50, 0);
        }
      } else {
        await updateSpacemap(this, spaceMapData);
      }

      // Update orbit controls to follow player if available
      if (this.playerData && this.playerManager) {
        const playerShip = this.playerManager.getPlayerShip(this.playerData.id);
        if (playerShip && this.controls) {
          // Calculate the offset from the current camera position to the target
          const cameraOffset = new THREE.Vector3().subVectors(
            this.camera!.position,
            this.controls.target
          );
          
          // Update the target to the player's position
          this.controls.target.copy(playerShip.position);
          
          // Update the camera position to maintain the same relative offset
          this.camera!.position.copy(playerShip.position).add(cameraOffset);
        }
      }
    });
  }

  public async initializeGame(): Promise<void> {
    await initializeThreeJs(this);
    this.playerManager = new PlayerManager(this.scene!);
    this.alienManager = new AlienManager(this.scene!);
    this.setupPerformanceMeters();
    this.animate();
  }

  private setupPerformanceMeters(): void {
    this.stats = new Stats();
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.bottom = '0';
    this.stats.dom.style.left = '0';
    document.body.appendChild(this.stats.dom);
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    // Update player and alien animations
    if (this.playerManager) {
      this.playerManager.animate();
    }
    if (this.alienManager) {
      this.alienManager.animate();
    }

    // Update orbit controls to follow player if available
    if (this.playerData && this.playerManager && this.controls) {
      const playerPosition = this.playerManager.getPlayerPosition(this.playerData.id);
      if (playerPosition) {
        // Calculate the offset from the current camera position to the target
        const cameraOffset = new THREE.Vector3().subVectors(
          this.camera!.position,
          this.controls.target
        );
        
        // Update the target to the player's position
        this.controls.target.copy(playerPosition);
        
        // Update the camera position to maintain the same relative offset
        this.camera!.position.copy(playerPosition).add(cameraOffset);
      }
    }

    // Update controls and render
    if (this.controls) {
      this.controls.update();
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
      if (this.labelRenderer) {
        this.labelRenderer.render(this.scene, this.camera);
      }
    }

    // Update performance metrics
    this.updatePerformanceMeters();
  };

  private updatePerformanceMeters(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    this.frameCount++;
    if (deltaTime >= 1000) {
      this.drawCalls = this.renderer!.info.render.calls;
      this.frameCount = 0;
    }

    if (this.stats) {
      this.stats.update();
    }
  }

  ngOnDestroy(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.scene) {
      this.scene.clear();
    }
  }

  // Public method to handle player movement
  public async movePlayerTo(position: { x: number; y: number; z: number }): Promise<void> {
    if (this.playerData) {
      await this.hubService.send('requestMove', {
        username: this.playerData.username,
        position: position
      });
    }
  }
}
