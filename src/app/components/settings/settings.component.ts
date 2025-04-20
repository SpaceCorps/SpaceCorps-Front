import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameSettings } from '../../models/game-settings.model';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SettingsComponent implements OnInit, OnDestroy {
  @Input() set isOpen(value: boolean) {
    this._isOpen = value;
    // Control body overflow
    document.body.style.overflow = value ? 'hidden' : '';
    // When modal opens, ensure we have the latest settings
    if (value) {
      this.settings = { ...this.settingsService.getSettings()() };
      this.selectedTheme = this.settingsService.getTheme()();
    }
  }
  get isOpen(): boolean {
    return this._isOpen;
  }
  private _isOpen = false;

  @Output() isOpenChange = new EventEmitter<boolean>();

  private settingsService = inject(SettingsService);
  settings: GameSettings = { ...this.settingsService.getSettings()() };
  selectedTheme = this.settingsService.getTheme()();
  availableThemes = this.settingsService.getAvailableThemes();

  ngOnInit() {
    // Apply initial settings
    this.settingsService.applyCurrentSettings();
  }

  ngOnDestroy() {
    // Ensure body overflow is restored when component is destroyed
    document.body.style.overflow = '';
  }

  onThemeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedTheme = select.value;
    this.settingsService.saveTheme(select.value);
  }

  onSettingChange() {
    // Auto-save settings as they change
    this.settingsService.saveSettings(this.settings);
  }

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  save() {
    this.settingsService.saveSettings(this.settings);
    this.close();
  }
}
