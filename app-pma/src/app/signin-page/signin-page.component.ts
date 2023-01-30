import { Component } from '@angular/core';

import { RestDataService } from '../restAPI.service'
import { AppFormsService } from '../app-forms.service';
import { FormConrolTypes } from '../app.interfeces';

@Component({
  selector: 'app-singin-page',
  templateUrl: './signin-page.component.html',
  styleUrls: ['./signin-page.component.scss']
})

export class SigninPageComponent {
  hide = true;
  checkoutForm = this.formService.getNewFormGroup({type: 'singIn'});

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
