import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
  public pageIndex: number = 0;

  constructor(
    private router: Router,
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

  get isError() {
    return this.errorHandlerService.isError;
  }

  get errorAmount() {
    return this.errorHandlerService.currentErrors.length;
  }

  get currentError() {
    return this.errorHandlerService.currentErrors[this.pageIndex];
  }

  cleanErrors() {
    this.errorHandlerService.clearErrors();
    this.pageIndex = 0;
  }

  createNewBoard() {
    this.confirmationService.openDialog({type: 'createBoard'});
  }

  logOut() {
    this.appControlService.logOut()
  }
}
