import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { RestDataService } from '../restAPI.service'
import { LocalStorageService } from '../localStorage.service';
import { ErrorHandlerService } from '../errorHandler.service';

@Component({
  selector: 'app-singin-page',
  templateUrl: './signin-page.component.html',
  styleUrls: ['./signin-page.component.scss']
})

export class SigninPageComponent {
  hide = true;

  validOptions = {
    login: {name: 'login', minLength: 4, maxLength: 30, pattern: '0-9a-zA-Z_.'},
    password: {name: 'password', minLength: 8, maxLength: 96, pattern: '0-9a-zA-Z_.'}
  }

  checkoutForm = this.formBuilder.group({
    login: ["",
      [
        Validators.required,
        Validators.minLength(this.validOptions.login.minLength),
        Validators.maxLength(this.validOptions.login.maxLength),
        Validators.pattern('[a-zA-Z0-9_\.]*'),
      ]
    ],
    password:  ["",
      [
        Validators.required,
        Validators.minLength(this.validOptions.password.minLength),
        Validators.maxLength(this.validOptions.password.maxLength),
        Validators.pattern('[a-zA-Z0-9_\.]*'),
      ]
    ],
  });

  constructor(
    private formBuilder: FormBuilder,
    private restAPI : RestDataService,
    private localStorageService: LocalStorageService,
    private errorHandlerService: ErrorHandlerService,
  ) {}

  getSignInErrorMessage(optionName: string) {
    const controlOption = this.validOptions[optionName as keyof typeof this.validOptions];
    const controlOptionName = controlOption.name as keyof typeof this.checkoutForm.controls;
    const formControlErrors = this.checkoutForm.controls[controlOptionName].errors;

    switch(true) {
      case (!!formControlErrors?.['required']):
        return `You must enter a ${optionName}`;
      case (!!formControlErrors?.['minlength']):
        return `Min length of ${optionName} is ${controlOption.minLength} chars`;
      case (!!formControlErrors?.['maxlength']):
        return `Max length of ${optionName} is ${controlOption.maxLength} chars`;
      case (!!formControlErrors?.['pattern']):
        return `Allowed symbols for ${optionName} are "${controlOption.pattern}"`;
      default:
        return `Not a valid ${optionName}`;
    }

    ;
  }

  submitSignIn(): void {
    const formControls = this.checkoutForm.controls;
    const login = formControls.login.value as string;
    const pass = formControls.password.value as string;

    this.restAPI.signIn(login, pass);
  };

}
