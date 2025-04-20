import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  imports: [RouterLink],
  styleUrl: './main-menu.component.scss',
  standalone: true
})
export class MainMenuComponent {
  @Output() menuItemClick = new EventEmitter<void>();
  
  openItem: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  closeTimeout: any;

  toggleItem(item: string) {
    this.openItem = this.openItem === item ? null : item;
  }

  openItemOnHover(item: string) {
    clearTimeout(this.closeTimeout);
    this.openItem = item;
  }

  closeAllItems() {
    this.closeTimeout = setTimeout(() => {
      this.openItem = null;
    }, 300);
  }

  onMenuItemClick() {
    this.menuItemClick.emit();
  }
}
