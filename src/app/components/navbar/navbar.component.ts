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
import { ThemePickerComponent } from '../theme-picker/theme-picker.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faCog, faInfoCircle, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { SettingsComponent } from '../settings/settings.component';

interface GameSettings {
  showFPS: boolean;
  enableParticles: boolean;
  showGrid: boolean;
  enableSound: boolean;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
}

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
    ThemePickerComponent,
    SettingsComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  authService = inject(AuthService);
  authState$ = this.authService.authState$;

  showPatchInfo = false;
  showSettings = false;
  showMobileMenu = false;

  settings: GameSettings = {
    showFPS: false,
    enableParticles: true,
    showGrid: false,
    enableSound: true,
    graphicsQuality: 'high'
  };

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

  saveSettings(newSettings: GameSettings) {
    this.settings = newSettings;
    // TODO: Save settings to service/storage
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

  ngOnInit() {
    // Load saved settings
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }
}
