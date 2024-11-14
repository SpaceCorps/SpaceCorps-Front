import { Component } from '@angular/core';
import * as THREE from 'three';
import * as SignalR from '@microsoft/signalr';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {

  hubConnection?: SignalR.HubConnection;

  ngOnInit(): void {
    this.initializeSignalR();
    this.initializeThreeJs();
  }

  private initializeThreeJs(): void {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();
  }

  private initializeSignalR(): void {
    this.hubConnection = new SignalR.HubConnectionBuilder()
      .withUrl('http://localhost:5274/gameHub')
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('Error while starting SignalR connection: ' + err));
  }

}
