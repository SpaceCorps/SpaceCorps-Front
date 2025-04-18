import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  HostListener,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe, CommonModule } from '@angular/common'; // Import CommonModule here
import { MainMenuComponent } from '../main-menu/main-menu.component';
import { GithubTimelineComponent } from '../github-timeline/github-timeline.component';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    AsyncPipe,
    CommonModule,
    MainMenuComponent,
    GithubTimelineComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  authService = inject(AuthService);
  authState$ = this.authService.authState$;

  showPatchInfo = false;

  @ViewChild('patchInfoContainer', { static: false })
  patchInfoContainer!: ElementRef;

  protected readonly faUsers = faUsers;

  logOut() {
    this.authService.logOut();
  }

  togglePatchInfo() {
    this.showPatchInfo = !this.showPatchInfo;
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
