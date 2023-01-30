import { Injectable } from '@angular/core';

import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { FormConrolTypes, TaskApiObj, UserApiObj } from './app.interfeces';

type FormGroupTypes = 'taskForm'
                    | 'singIn'
                    | 'singUp'
                    | 'editUser';

function repeatedPasswordValidator(sourcePasswordControl: FormControl | AbstractControl<any, any>): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return (sourcePasswordControl.value !== control.value) ? {passwordsMatch: {value: control.value}} : null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppFormsService {

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  validOptions = {
    columnTitle: {title: 'column title', minLength: 2, maxLength: 30, pattern: '[a-zA-Z_\. ]*'},
    boardTitle: {title: 'board title', minLength: 2, maxLength: 30, pattern: '[a-zA-Z_\. ]*'},
    taskTitle: {title: 'task title', minLength: 2, maxLength: 30, pattern: '[a-zA-Z0-9_\.]*'},
    taskDescription: {title: 'task description', minLength: 0, maxLength: 200, pattern: '[a-zA-Z0-9_\.]*'},
    userName: {title: 'name', minLength: 2, maxLength: 30, pattern: '[a-zA-Z_\. ]*'},
    login: {title: 'login', minLength: 4, maxLength: 30, pattern: '[a-zA-Z0-9_\.]*'},
    password: {title: 'password', minLength: 8, maxLength: 96, pattern: '[a-zA-Z0-9_\.]*'},
    newPassword: {title: 'password', minLength: 8, maxLength: 96, pattern: '[a-zA-Z0-9_\.]*'},
    repeatedPassword: {title: 'password', minLength: 8, maxLength: 96, pattern: '[a-zA-Z0-9_\.]*'},
  }

  getValidators(type: FormConrolTypes, sourceControl?: AbstractControl<any, any>): ValidatorFn[] {
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
      case 'newPassword':
        return [
            Validators.minLength(this.validOptions[type].minLength),
            Validators.maxLength(this.validOptions[type].maxLength),
            Validators.pattern(this.validOptions[type].pattern),
          ];
      case 'repeatedPassword':
            return (sourceControl)
              ? [
                  Validators.required,
                  repeatedPasswordValidator(sourceControl)
                ]
              : [];
      case 'taskExecutor':
        return [Validators.required];
      default:
        return [];
    }
  }

  getNewFormControl(type: FormConrolTypes, initValue: string = '', disabled: boolean = false, sourceControl?: AbstractControl<any, any>) {
    const validators = (sourceControl)
      ? this.getValidators(type, sourceControl)
      : this.getValidators(type);
    const formControl = new FormControl(initValue, validators);
    if (disabled) {
      formControl.disable()
    }

    return formControl;
  }

  getNewFormGroup(groupArgs: {type: FormGroupTypes, sourceTask?: TaskApiObj | null, executorName?: string, editableUser?: UserApiObj}): FormGroup {
    switch(groupArgs.type) {
      case 'taskForm': {
        const title = (groupArgs.sourceTask)
          ? groupArgs.sourceTask.title
          : '';
        const description = (groupArgs.sourceTask)
          ? groupArgs.sourceTask.description
          : '';
        const executor = (groupArgs.executorName)
          ? groupArgs.executorName
          : '';
        return new FormGroup({
          taskTitle: this.getNewFormControl('taskTitle', title),
          taskDescription: this.getNewFormControl('taskDescription', description),
          taskExecutor: this.getNewFormControl('taskExecutor', executor),
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
      case 'editUser': {
        const formGroup: FormGroup<any> = new FormGroup({
          userName: this.getNewFormControl('userName', '', true),
          login: this.getNewFormControl('login', '', true),
          password: this.getNewFormControl('password'),
          newPassword: this.getNewFormControl('newPassword'),
        });

        const repeatedPasswordControl = this.getNewFormControl('repeatedPassword', '', true, formGroup.controls['newPassword'])
        formGroup.addControl('repeatedPassword', repeatedPasswordControl);
        return formGroup;
      }
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
        case (!!formControlErrors?.['passwordsMatch']):
            return 'Passwords do not match';
        default:
          return `Not valid ${controlOptionTitle}`;
      };

  }

}
