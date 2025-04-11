import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { filter } from 'rxjs';
import { FooterComponent } from './components/footer/footer.component';

interface ElectronWindow extends Window {
  electron?: {
    on: (channel: string, listener: (url: string) => void) => void;
  };
}

declare const window: ElectronWindow;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  showNavbar = true;

  constructor(private router: Router) {
    // Check if we're running in Electron
    if (window.electron) {
      // Listen for new tab requests from Electron
      window.electron.on('open-new-tab', (url: string) => {
        // Navigate to the URL in the current window
        this.router.navigateByUrl(url);
      });
    }
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNavbar = !event.url.includes('/game');
      });
  }
}
