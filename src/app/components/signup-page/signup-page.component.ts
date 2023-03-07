import { Component } from '@angular/core';

import { RestDataService } from 'src/app/services/restAPI.service';
import { AppFormsService } from 'src/app/services/app-forms.service';

import { FormConrolTypes } from '../../app.interfeces';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})

export class SignupPageComponent {
  public hide = true;
  public checkoutForm: FormGroup = this.formService.getNewFormGroup({type: 'singUp'});

  constructor(
    private restAPI : RestDataService,
    private formService: AppFormsService,
  ) {}

  public getErrorMessage(type: FormConrolTypes): string {
    return this.formService.getErrorMessage(this.checkoutForm, type);
  }

  public submitSignUp(): void {
    if (this.checkoutForm.valid) {
      const formControls = this.checkoutForm.controls;
      const name = formControls['userName'].value;
      const login = formControls['login'].value;
      const pass = formControls['password'].value;

      this.restAPI.signUp(name, login, pass);
    }
  }

}
