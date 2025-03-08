import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-theme-picker',
  imports: [],
  templateUrl: './theme-picker.component.html',
  styleUrl: './theme-picker.component.scss'
})
export class ThemePickerComponent implements OnInit {
  themes = [
    "sc-default",
    "dark",
    "light",
    "abyss",
    "acid",
    "black",
    "dracula",
    "night",
    "sunset",
    "business",
    "winter"
  ]

  selectedTheme = "dark";


  ngOnInit() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if(savedTheme) {
      this.selectedTheme = savedTheme;
      this.applyTheme(savedTheme);
    } else {
      this.applyTheme(this.selectedTheme);
    }
  }

  onThemeChange(event: Event) {
    const theme = (event.target as HTMLInputElement).value;
    this.selectedTheme = theme;
    localStorage.setItem('selectedTheme', theme);
    this.applyTheme(theme);
  }

  applyTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
