import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-theme-picker',
  standalone: true,
  imports: [],
  templateUrl: './theme-picker.component.html',
  styleUrl: './theme-picker.component.scss',
})
export class ThemePickerComponent {
  @Input() themes: string[] = [];
  @Input() selectedTheme = '';
  @Output() themeChange = new EventEmitter<string>();

  onThemeChange(event: Event) {
    const theme = (event.target as HTMLInputElement).value;
    this.themeChange.emit(theme);
  }
}
