import { Component } from '@angular/core';

import { RestDataService } from 'src/app/services/restAPI.service';
import { AppFormsService } from 'src/app/services/app-forms.service';

import { FormConrolTypes } from '../../app.interfeces';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-singin-page',
  templateUrl: './signin-page.component.html',
  styleUrls: ['./signin-page.component.scss']
})

export class SigninPageComponent {
  public hide = true;
  public checkoutForm: FormGroup = this.formService.getNewFormGroup({type: 'singIn'});

  constructor(
    private restAPI : RestDataService,
    private formService: AppFormsService,
  ) {}

  public getSignInErrorMessage(type: FormConrolTypes): string {
    return this.formService.getErrorMessage(this.checkoutForm, type);
  }

  public submitSignIn(): void {
    if (this.checkoutForm.valid) {
      const formControls = this.checkoutForm.controls;
      const login = formControls['login'].value as string;
      const pass = formControls['password'].value as string;

      this.restAPI.signIn(login, pass);
    }
  }

}
