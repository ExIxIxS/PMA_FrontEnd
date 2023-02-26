import { Component } from '@angular/core';

import { FormConrolTypes } from '../../app.interfeces';

import { RestDataService } from 'src/app/services/restAPI.service';
import { AppFormsService } from 'src/app/services/app-forms.service';


@Component({
  selector: 'app-singin-page',
  templateUrl: './signin-page.component.html',
  styleUrls: ['./signin-page.component.scss']
})

export class SigninPageComponent {
  public hide = true;
  public checkoutForm = this.formService.getNewFormGroup({type: 'singIn'});

  constructor(
    private restAPI : RestDataService,
    private formService: AppFormsService,
  ) {}

  getSignInErrorMessage(type: FormConrolTypes) {
    return this.formService.getErrorMessage(this.checkoutForm, type);
  }

  submitSignIn(): void {
    if (this.checkoutForm.valid) {
      const formControls = this.checkoutForm.controls;
      const login = formControls['login'].value as string;
      const pass = formControls['password'].value as string;

      this.restAPI.signIn(login, pass);
    }
  };

}
