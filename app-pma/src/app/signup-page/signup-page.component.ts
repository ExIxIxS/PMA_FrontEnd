import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { RestDataService } from '../restAPI.service'

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent {
  hide = true;

  validOptions = {
    name: {name: 'name', minLength: 2, maxLength: 30, pattern: 'a-zA-Z" "-'},
    login: {name: 'login', minLength: 4, maxLength: 30, pattern: '0-9a-zA-Z_.'},
    password: {name: 'password', minLength: 8, maxLength: 96, pattern: '0-9a-zA-Z_.'}
  }

  checkoutForm = this.formBuilder.group({
    name: ["",
      [
        Validators.required,
        Validators.minLength(this.validOptions.login.minLength),
        Validators.maxLength(this.validOptions.login.maxLength),
        Validators.pattern('[a-zA-Z_\.]*'),
      ]
    ],
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
  ) {}

  getErrorMessage(optionName: string) {
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
    };

  };

  submitSignUp(): void {
    const formControls = this.checkoutForm.controls;
    const name = formControls.name.value as string;
    const login = formControls.login.value as string;
    const pass = formControls.password.value as string;

    this.restAPI.signUp(name, login, pass);
  };

}
