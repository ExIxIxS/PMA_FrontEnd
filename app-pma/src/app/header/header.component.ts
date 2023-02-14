import { Component } from '@angular/core';

import { AppControlService } from '../app-control.service';
import { LocalStorageService } from '../localStorage.service';
import { ErrorHandlerService } from '../errorHandler.service'
import { ConfirmationService } from '../confirmation.service';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {
  constructor(
    private appControlService: AppControlService,
    private localStorageService: LocalStorageService,
    private errorHandlerService: ErrorHandlerService,
    private confirmationService: ConfirmationService,
    ) {
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


