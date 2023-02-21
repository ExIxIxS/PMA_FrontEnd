import { Component } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
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
export class WelcomePageComponent {
  public animationDuration = '1000';

  public firstFormGroup = this.formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  public secondFormGroup = this.formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  public thirdFormGroup = this.formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private restAPI: RestDataService,
    private localStorageService: LocalStorageService,
    private appControlService: AppControlService,
    ) { }

  ngOnInit() {
    if (this.localStorageService.isUserLoggedIn) {
      this.restAPI.autoSignIn();
    }
  }

  get navigation() {
    return window.Navigator;
  }

  get isSmallScreen() {
    return this.appControlService.isSmallScreen;
  }

  scrollToUp() {
    this.appControlService.scrollToUp();
  }
}
