import { Component } from '@angular/core';

import { AppControlService } from 'src/app/services/app-control.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(
    private appControlService: AppControlService,
    private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
    ) { }

  ngOnInit() {
    if (!this.isUserLoggedIn) {
      this.logOut();
    }
  }

  get isUserLoggedIn() {
    return this.localStorageService.isUserLoggedIn;
  }

  get isSmallScreen() {
    return this.appControlService.isSmallScreen;
  }

  createNewBoard() {
    this.confirmationService.openDialog({type: 'createBoard'});
  }

  logOut() {
    this.appControlService.logOut()
  }

}


