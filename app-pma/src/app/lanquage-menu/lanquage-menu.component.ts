import { Component } from '@angular/core';

import { LocalStorageService } from '../localStorage.service';
import { AvalibleLanguages } from '../app.interfeces';
import { AppControlService } from '../app-control.service';

@Component({
  selector: 'app-lanquage-menu',
  templateUrl: './lanquage-menu.component.html',
  styleUrls: ['./lanquage-menu.component.scss']
})
export class LanquageMenuComponent {
  avalibleLanguages = this.localStorageService.avalibleLanguages;

  get currentLanguage() {
    return this.localStorageService.currentLanguage;
  }

  constructor(
    private localStorageService: LocalStorageService,
    private appControlService: AppControlService,
  ) {};

  changeLanguage(language: AvalibleLanguages) {
    this.localStorageService.currentLanguage = language;
    this.appControlService.refreshPage();
  }

}
