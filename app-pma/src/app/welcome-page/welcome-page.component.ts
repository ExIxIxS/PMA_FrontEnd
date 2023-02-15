import { Component } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';

import { RestDataService } from '../restAPI.service'
import { LocalStorageService } from '../localStorage.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { AppControlService } from '../app-control.service';

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
  animationDuration = '1000';

  firstFormGroup = this.formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this.formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  thirdFormGroup = this.formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private restAPI: RestDataService,
    private localStorageService: LocalStorageService,
    private appControlService: AppControlService,
    ) {
      if (this.localStorageService.isUserLoggedIn) {
        console.log('storage --> User is Logged In')
        this.restAPI.autoSignIn()
      } else {
        console.log('storage --> User is Logged Out')
      }
    }

  get navigation() {
    return window.Navigator
  }

  get isSmallScreen() {
    return this.appControlService.isSmallScreen;
  }

  scrollToUp() {
    this.appControlService.scrollToUp();
  }
}
