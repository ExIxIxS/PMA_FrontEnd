import { Component } from '@angular/core';
import { LocalStorageService } from '../localStorage.service';

@Component({
  selector: 'app-menu-header',
  templateUrl: './menu-header.component.html',
  styleUrls: ['./menu-header.component.scss']
})
export class MenuHeaderComponent {

  colorThemes = [
    { className:'default', title: 'Indigo', isDark: false },
    { className:'dark-peace', title: 'Eclectic Peace', isDark: true },
    { className:'light-teal', title: 'Tea Party', isDark: false },
    { className:'dark-green', title: 'Fresh Apple', isDark: true },
    { className:'light-desert', title: 'Desert Morning', isDark: false },
    { className:'dark-pink', title: 'Night Pink', isDark: true },
  ];

  typographies = [
    { className:'default', title: 'Roboto', },
    { className:'shantell-sans', title: 'Shantell Sans', },
    { className:'comfortaa', title: 'Comfortaa', },
  ];

  constructor(
    private localStorageService: LocalStorageService
  ) { }

  setColorTheme(colorTheme: string) {
    this.localStorageService.currentColorTheme = colorTheme;
  }

  setTypography(typography: string) {
    this.localStorageService.currentTypography = typography;
  }

}
