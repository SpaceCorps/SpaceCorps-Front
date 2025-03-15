import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

@Component({
  selector: 'app-ship-model',
  templateUrl: './ship-model.component.html',
  styleUrls: ['./ship-model.component.scss']
})
export class ShipModelComponent implements OnInit {
  @ViewChild('rendererContainer', {static: true}) rendererContainer: ElementRef | undefined;

  @Input({
    required: true
  }) shipModelName: string | undefined;

  private scene!: THREE.Scene | undefined;
  private camera!: THREE.PerspectiveCamera | undefined;
  private renderer!: THREE.WebGLRenderer | undefined;
  private model: any;

  ngOnInit(): void {
    this.initThreeJS();
  }

  private initThreeJS(): void {
    if (!this.rendererContainer) {
      console.error('Renderer container not found', this.rendererContainer);
      return;
    }

    if(!this.shipModelName) {
      console.warn('Ship model name not found, loading default one!', this.shipModelName);
      this.shipModelName = 'Protos';
    }

    this.scene = new THREE.Scene();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    this.scene.add(new THREE.DirectionalLight(0xffffff, 0.5));

    this.camera = new THREE.PerspectiveCamera(75, this.getAspectRatio(), 0.1, 1000);
    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    this.renderer.setSize(this.getContainerWidth(), this.getContainerHeight());
    this.renderer.setClearColor(0x000000, 0);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.loadModel(this.shipModelName);

    this.animate();
  }

  private animate = (): void => {
    if (!this.renderer || !this.scene || !this.camera) {
      console.error('Renderer, scene, camera or cube not found');
      return;
    }

    requestAnimationFrame(this.animate);

    if (this.model) {
      this.model.rotation.x += 0.001;
      this.model.rotation.y += 0.001;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private getAspectRatio(): number {
    return this.getContainerWidth() / this.getContainerHeight();
  }

  private getContainerWidth(): number {
    if (!this.rendererContainer) {
      console.error('Renderer container not found');
      return 0;
    }
    return this.rendererContainer.nativeElement.clientWidth;
  }

  private getContainerHeight(): number {
    if (!this.rendererContainer) {
      console.error('Renderer container not found');
      return 0;
    }
    return this.rendererContainer.nativeElement.clientHeight;
  }

  private loadModel(modelName: string): void {
    const loader = new GLTFLoader();

    loader.load(
      `models/ships/${modelName}/${modelName}.glb`,
      (gltf) => {
        this.model = gltf.scene;
        this.scene!.add(this.model);
      },
      undefined,
      (error) => {
        console.warn('An error occurred while loading the model', error);
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.model = new THREE.Mesh(geometry, material);
        this.scene!.add(this.model);
      }
    );
  }
}
