import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

import { RestDataService } from 'src/app/services/restAPI.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { AppControlService } from 'src/app/services/app-control.service';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {displayDefaultIndicatorType: false},
    },
  ],
})
export class WelcomePageComponent implements OnInit {
  public firstFormGroup: FormGroup = this.formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  public secondFormGroup: FormGroup = this.formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  public thirdFormGroup: FormGroup = this.formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private restAPI: RestDataService,
    private localStorageService: LocalStorageService,
    private appControlService: AppControlService,
    ) { }

  public ngOnInit(): void {
    if (this.localStorageService.isUserLoggedIn) {
      this.restAPI.autoSignIn();
    }
  }

  public get navigation() {
    return window.Navigator;
  }

  public get isSmallScreen(): boolean {
    return this.appControlService.isSmallScreen;
  }

  public scrollToUp(): void {
    this.appControlService.scrollToUp();
  }

}
