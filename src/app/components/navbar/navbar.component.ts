import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  HostListener,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainMenuComponent } from '../main-menu/main-menu.component';
import { GithubTimelineComponent } from '../github-timeline/github-timeline.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faCog, faInfoCircle, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { SettingsComponent } from '../settings/settings.component';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    AsyncPipe,
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    MainMenuComponent,
    GithubTimelineComponent,
    SettingsComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private settingsService = inject(SettingsService);
  
  authState$ = this.authService.authState$;
  settings = this.settingsService.getSettings();

  showPatchInfo = false;
  showSettings = false;
  showMobileMenu = false;

  protected readonly faUsers = faUsers;
  protected readonly faCog = faCog;
  protected readonly faInfoCircle = faInfoCircle;
  protected readonly faSignOutAlt = faSignOutAlt;
  protected readonly faTimes = faTimes;

  @ViewChild('patchInfoContainer', { static: false })
  patchInfoContainer!: ElementRef;

  logOut() {
    this.authService.logOut();
  }

  togglePatchInfo() {
    this.showPatchInfo = !this.showPatchInfo;
  }

  toggleSettings() {
    this.showSettings = !this.showSettings;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.patchInfoContainer &&
      !this.patchInfoContainer.nativeElement.contains(event.target)
    ) {
      this.showPatchInfo = false;
    }
  }
}
