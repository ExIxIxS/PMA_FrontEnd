import { Component } from '@angular/core';
import { LocalStorageService } from '../localStorage.service';

@Component({
  selector: 'app-menu-header',
  templateUrl: './menu-header.component.html',
  styleUrls: ['./menu-header.component.scss']
})
export class MenuHeaderComponent {

  colorThemes = [
    { name:'default', isDark: false },
    { name:'dark-pink', isDark: true },
  ];

  constructor(
    private localStorageService: LocalStorageService
  ) { }

  setColorTheme(colorTheme: string) {
    this.localStorageService.currentColorTheme = colorTheme;
  }

}
