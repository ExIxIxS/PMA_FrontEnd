import { Injectable } from '@angular/core';

import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { FormConrolTypes } from './app.interfeces';

type FormGroupTypes = 'newTask'
                    | 'singIn'
                    | 'singUp';

@Injectable({
  providedIn: 'root'
})
export class AppFormsService {

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  /*

  */

  validOptions = {
    columnTitle: {title: 'column title', minLength: 2, maxLength: 30, pattern: '[a-zA-Z_\. ]*'},
    boardTitle: {title: 'board title', minLength: 2, maxLength: 30, pattern: '[a-zA-Z_\. ]*'},
    taskTitle: {title: 'task title', minLength: 2, maxLength: 30, pattern: '[a-zA-Z0-9_\.]*'},
    taskDescription: {title: 'task description', minLength: 0, maxLength: 200, pattern: '[a-zA-Z0-9_\.]*'},
    userName: {title: 'name', minLength: 2, maxLength: 30, pattern: '[a-zA-Z_\. ]*'},
    login: {title: 'login', minLength: 4, maxLength: 30, pattern: '[a-zA-Z0-9_\.]*'},
    password: {title: 'password', minLength: 8, maxLength: 96, pattern: '[a-zA-Z0-9_\.]*'},
  }

  getValidators(type: FormConrolTypes): ValidatorFn[] {
    switch(type) {
      case 'columnTitle':
      case 'taskTitle':
      case 'boardTitle':
      case 'userName':
      case 'login':
      case 'password':
        return [
            Validators.required,
            Validators.minLength(this.validOptions[type].minLength),
            Validators.maxLength(this.validOptions[type].maxLength),
            Validators.pattern(this.validOptions[type].pattern),
          ];
      case 'taskDescription':
        return [
          Validators.minLength(this.validOptions[type].minLength),
          Validators.maxLength(this.validOptions[type].maxLength),
          Validators.pattern(this.validOptions[type].pattern),
        ];
      case 'taskExecutor':
        return [Validators.required];
      default:
        return [];
    }
  }

  getNewFormControl(type: FormConrolTypes, initValue: string = '', disabled: boolean = false): FormControl {
    const validators = this.getValidators(type);
    const formControl = new FormControl(initValue, validators);
    if (disabled) {
      formControl.disable()
    }

    return formControl;
  }

  getNewFormGroup(type: FormGroupTypes): FormGroup {
    switch(type) {
      case 'newTask': {
        return new FormGroup({
          taskTitle: this.getNewFormControl('taskTitle'),
          taskDescription: this.getNewFormControl('taskDescription'),
          taskExecutor: this.getNewFormControl('taskExecutor'),
        })
      }
      case 'singIn': {
        return new FormGroup({
          login: this.getNewFormControl('login'),
          password: this.getNewFormControl('password'),
        })
      }
      case 'singUp': {
        return new FormGroup({
          userName: this.getNewFormControl('userName'),
          login: this.getNewFormControl('login'),
          password: this.getNewFormControl('password'),
        })
      }
      default:
        return new FormGroup(this.getNewFormControl);
    }
  }

  getErrorMessage(controlObj: FormControl | FormGroup, formControlType: FormConrolTypes): string {
    const controlOption = this.validOptions[formControlType as keyof typeof this.validOptions];
    const controlOptionTitle = (controlObj instanceof FormControl)
      ? controlOption.title
      : controlOption.title as keyof typeof controlObj.controls;

    const formControlErrors = (controlObj instanceof FormControl)
      ? controlObj.errors
      : controlObj.controls[formControlType].errors;

    switch(true) {
      case (!!formControlErrors?.['required']):
        return `You must enter a ${controlOptionTitle}`;
      case (!!formControlErrors?.['minlength']):
        return `Min length of ${controlOptionTitle} is ${controlOption.minLength} chars`;
      case (!!formControlErrors?.['maxlength']):
        return `Max length of ${controlOptionTitle} is ${controlOption.maxLength} chars`;
      case (!!formControlErrors?.['pattern']):
        return `Allowed symbols for ${controlOptionTitle} are "${controlOption.pattern}"`;
      default:
        return `Not a valid ${controlOptionTitle}`;
    };
  }

}
