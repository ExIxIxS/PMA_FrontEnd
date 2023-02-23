import { Component } from '@angular/core';

import { AppControlService } from 'src/app/services/app-control.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { RestDataService } from 'src/app/services/restAPI.service';

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
    private restApiService: RestDataService,
    ) { }

  ngOnInit() {
    if (!this.isUserLoggedIn) {
      this.logOut();
    }
  }

  get isInProgress() {
    return this.restApiService.isInProgress;
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


