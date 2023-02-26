import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { LocalStorageService } from 'src/app/services/localStorage.service';
import { AppControlService } from 'src/app/services/app-control.service';

@Component({
  selector: 'app-lanquage-menu',
  templateUrl: './lanquage-menu.component.html',
  styleUrls: ['./lanquage-menu.component.scss']
})
export class LanquageMenuComponent {
  public avalibleLanguages = this.translate.langs;

  constructor(
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private appControlService: AppControlService,
  ) {};

  get currentLanguage() {
    return this.localStorageService.currentLanguage;
  }

  get isSmallScreen() {
    return this.appControlService.isSmallScreen;
  }

  changeLanguage(lang: string) {
    if (this.avalibleLanguages.includes(lang)) {
      this.translate.use(lang);
      this.localStorageService.currentLanguage = lang;
    }
  }

}
