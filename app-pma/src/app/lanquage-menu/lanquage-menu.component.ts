import { Component } from '@angular/core';

import { LocalStorageService } from '../localStorage.service';
import { TranslateService } from '@ngx-translate/core';
import { AppControlService } from '../app-control.service';

@Component({
  selector: 'app-lanquage-menu',
  templateUrl: './lanquage-menu.component.html',
  styleUrls: ['./lanquage-menu.component.scss']
})
export class LanquageMenuComponent {
  avalibleLanguages = this.translate.langs;

  get currentLanguage() {
    return this.localStorageService.currentLanguage;
  }

  get isSmallScreen() {
    return this.appControlService.isSmallScreen;
  }

  constructor(
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private appControlService: AppControlService,
  ) {};

  changeLanguage(lang: string) {
    if (this.avalibleLanguages.includes(lang)) {
      this.translate.use(lang);
      this.localStorageService.currentLanguage = lang;
    }
  }

}
