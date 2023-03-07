import { Component, OnInit } from '@angular/core';

import { AppControlService } from 'src/app/services/app-control.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { RestDataService } from 'src/app/services/restAPI.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  constructor(
    private appControlService: AppControlService,
    private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
    private restApiService: RestDataService,
    ) { }

  public ngOnInit(): void {
    if (!this.isUserLoggedIn) {
      this.logOut();
    }
  }

  public get isInProgress(): boolean {
    return this.restApiService.isInProgress;
  }

  public get isUserLoggedIn(): boolean {
    return this.localStorageService.isUserLoggedIn;
  }

  public get isSmallScreen(): boolean {
    return this.appControlService.isSmallScreen;
  }

  public createNewBoard(): void {
    this.confirmationService.openDialog({type: 'createBoard'});
  }

  public logOut(): void {
    this.appControlService.logOut()
  }

  public navigateToRoot(): void {
    this.appControlService.navigateToRoot();
  }

}
