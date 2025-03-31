import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe } from '@angular/common';
import { MainMenuComponent } from '../main-menu/main-menu.component';
import { UserCredentialsLoginRequest } from '../../models/auth/UserCredentialsLoginRequest';
import { GithubTimelineComponent } from '../github-timeline/github-timeline.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, AsyncPipe, MainMenuComponent, GithubTimelineComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  authService = inject(AuthService);
  authState$ = this.authService.authState$;

  showPatchInfo = false;

  logOut() {
    this.authService.logOut();
  }

  toggleLogin($event: UserCredentialsLoginRequest) {
    this.authService.logIn($event).subscribe({
      next: (response) => {
        this.authService.fetchUserAfterSuccessfulLogin(response);
      },
      error: (err) => {
        throw err;
      },
    });
  }

  togglePatchInfo() {
    this.showPatchInfo = !this.showPatchInfo;
  }


  // TODO: remove too many divs (move css classes around)
  // TODO: position absolute for timeline component
  // TODO: edit colors in github-timeline component to use theme colors
  // TODO: rework github-timeline component to use native daisyui components and update tsc code
}
