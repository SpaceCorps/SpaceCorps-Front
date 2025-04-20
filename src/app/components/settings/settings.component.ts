import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemePickerComponent } from '../theme-picker/theme-picker.component';

interface GameSettings {
  showFPS: boolean;
  enableParticles: boolean;
  showGrid: boolean;
  enableSound: boolean;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemePickerComponent]
})
export class SettingsComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() settingsChange = new EventEmitter<GameSettings>();

  settings: GameSettings = {
    showFPS: false,
    enableParticles: true,
    showGrid: false,
    enableSound: true,
    graphicsQuality: 'high'
  };

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  save() {
    this.settingsChange.emit(this.settings);
    this.close();
  }
} 