import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  imports: [RouterLink],
  styleUrl: './main-menu.component.scss',
})
export class MainMenuComponent {
  openItem: string | null = null;
  closeTimeout: ReturnType<typeof setTimeout> | null = null;

  toggleItem(item: string) {
    this.openItem = this.openItem === item ? null : item;
  }

  openItemOnHover(item: string) {
    if (this.openItem === item) {
      return;
    }
    if (!this.closeTimeout) {
      return;
    }
    clearTimeout(this.closeTimeout);
    this.openItem = item;
  }

  closeAllItems() {
    this.closeTimeout = setTimeout(() => {
      this.openItem = null;
    }, 300);
  }
}
