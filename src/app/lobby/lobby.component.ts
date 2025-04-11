import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemePickerComponent } from '../components/theme-picker/theme-picker.component';

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
    const playerData = this.authService.getPlayerData();
    if (!playerData) {
      console.error('No username found');
    } else {
      const username = playerData!.username;
      const url = `/game?username=${username}`;
      void window.open(url, '_blank');
    }
  }
}
