import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  imports: [],
  styleUrl: './lobby.component.scss',
})
export class LobbyComponent {
  authService = inject(AuthService);

  constructor(private router: Router) {}

  openGame(): void {
    this.authService.authState$.subscribe(state => {
      if (!state.username) {
        console.error('No username found');
      } else {
        const url = `/game?username=${state.username}`;
        void window.open(url, '_blank');
      }
    });
  }
}
