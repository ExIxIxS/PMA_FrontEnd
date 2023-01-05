import { Component } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';

import { RestDataService } from '../restAPI.service'
import { LocalStorageService } from '../localStorage.service';

@Component({
  selector: 'app-content-welcome',
  templateUrl: './content-welcome.component.html',
  styleUrls: ['./content-welcome.component.scss']
})
export class ContentWelcomeComponent {
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
