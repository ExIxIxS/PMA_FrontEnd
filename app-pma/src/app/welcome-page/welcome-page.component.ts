import { Component } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';

import { RestDataService } from '../restAPI.service'
import { LocalStorageService } from '../localStorage.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

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

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });


  constructor(
    private _formBuilder: FormBuilder,
    private restAPI: RestDataService,
    private localStorageService: LocalStorageService
    ) {
      if (this.localStorageService.isUserLoggedIn) {
        console.log('storage --> User is Logged In')
        this.restAPI.autoSignIn()
      } else {
        console.log('storage --> User is Logged Out')
      }
    }
}
