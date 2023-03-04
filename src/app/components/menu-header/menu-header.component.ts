import { Component } from '@angular/core';
import { AppControlService } from 'src/app/services/app-control.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';

@Component({
  selector: 'app-menu-header',
  templateUrl: './menu-header.component.html',
  styleUrls: ['./menu-header.component.scss']
})
export class MenuHeaderComponent {
  public colorThemes = this.appControlService.colorThemes;
  public typographies = this.appControlService.typographies;

  constructor(
    private localStorageService: LocalStorageService,
    private appControlService: AppControlService,
  ) { }

  public setColorTheme(colorTheme: string): void {
    this.localStorageService.currentColorTheme = colorTheme;
  }

  public setTypography(typography: string): void {
    this.localStorageService.currentTypography = typography;
  }

}
