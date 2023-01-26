import { Component } from '@angular/core';

import { RestDataService } from '../restAPI.service'
import { AppFormsService } from '../app-forms.service';
import { FormConrolTypes } from '../app.interfeces';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent {
  hide = true;

  checkoutForm = this.formService.getNewFormGroup('singUp');

  constructor(
    private restAPI : RestDataService,
    private formService: AppFormsService,
  ) {}

  getErrorMessage(type: FormConrolTypes) {
    return this.formService.getErrorMessage(this.checkoutForm, type);
  };

  submitSignUp(): void {
    if (this.checkoutForm.valid) {
      const formControls = this.checkoutForm.controls;
      const name = formControls['userName'].value;
      const login = formControls['login'].value;
      const pass = formControls['password'].value;

      this.restAPI.signUp(name, login, pass);
    }
  };

}
