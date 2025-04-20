import { Injectable, signal } from '@angular/core';
import { GameSettings } from '../models/game-settings.model';

const DEFAULT_SETTINGS: GameSettings = {
  showFPS: false,
  enableParticles: true,
  showGrid: false,
  enableSound: true,
  graphicsQuality: 'high'
};

const DEFAULT_THEME = 'sc-default';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly SETTINGS_KEY = 'gameSettings';
  private readonly THEME_KEY = 'selectedTheme';

  private settings = signal<GameSettings>(this.loadSettings());
  private theme = signal<string>(this.loadTheme());

  constructor() {
    // Initialize settings if they don't exist
    if (!localStorage.getItem(this.SETTINGS_KEY)) {
      this.saveSettings(DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(this.THEME_KEY)) {
      this.saveTheme(DEFAULT_THEME);
    }
    this.applyCurrentSettings();
  }

  getSettings() {
    return this.settings;
  }

  getTheme() {
    return this.theme;
  }

  saveSettings(newSettings: GameSettings) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(newSettings));
    this.settings.set(newSettings);
    this.applyGameSettings(newSettings);
  }

  saveTheme(newTheme: string) {
    localStorage.setItem(this.THEME_KEY, newTheme);
    this.theme.set(newTheme);
    this.applyTheme(newTheme);
  }

  applyCurrentSettings() {
    this.applyTheme(this.theme());
    this.applyGameSettings(this.settings());
  }

  private loadSettings(): GameSettings {
    const savedSettings = localStorage.getItem(this.SETTINGS_KEY);
    return savedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) } : DEFAULT_SETTINGS;
  }

  private loadTheme(): string {
    return localStorage.getItem(this.THEME_KEY) || DEFAULT_THEME;
  }

  private applyTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  private applyGameSettings(settings: GameSettings) {
    // Here you can add any game-specific settings application
    // For example, updating FPS counter visibility, particle systems, etc.
    // This will be called whenever settings change
  }

  getAvailableThemes(): string[] {
    return [
      'sc-default',
      'dark',
      'light',
      'abyss',
      'acid',
      'black',
      'dracula',
      'night',
      'sunset',
      'business',
      'winter'
    ];
  }
} 