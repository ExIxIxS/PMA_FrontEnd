import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { AvalibleLanguages, FormConrolTypes, TaskApiObj, UserApiObj } from './app.interfeces';
import { localizationLibrary } from './localizationLibrary';

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
  constructor() { }

  currentLanguage: AvalibleLanguages | undefined;

  passwordOption = {
    title: 'password',
    minLength: 8,
    maxLength: 96,
    pattern: /^[\w\d!@#/$%/^&/*/?]+$/,
    patternNote: 'latin letters, digits and !@#$%^&*?',
  }

  validOptions = {
    columnTitle: {
      title: 'column title',
      minLength: 2,
      maxLength: 30,
      pattern: /^[\p{L}\d"\+]+[\p{L}\d\s\-\.\+"]*[\p{L}\d"\+]+$/u,
      patternNote: 'unicode letters, digits, ", +, spaces or -. (in the middle)',
    },
    boardTitle: {
      title: 'board title',
      minLength: 5,
      maxLength: 30,
      pattern: /^[\p{L}\d"\+]+[\p{L}\d\s\-\.\+"]*[\p{L}\d"\+]+$/u,
      patternNote: 'unicode letters, digits, ", +, spaces or -. (in the middle)',
    },
    taskTitle: {
      title: 'task title',
      minLength: 2,
      maxLength: 30,
      pattern: /^[\p{L}\d"\+]+[\p{L}\d\s\-\.\+"]*[\p{L}\d"\+]+$/u,
      patternNote: 'unicode letters, digits, ", +, spaces or -. (in the middle)',
    },
    taskDescription: {
      title: 'task description',
      minLength: 0,
      maxLength: 200,
      pattern: /^[\p{L}\d"\+]+[\p{L}\d\s\-\.\+"]*[\p{L}\d"\+\.]+$/u,
      patternNote: 'unicode letters, digits, ", +, . and spaces or - (in the middle)',
    },
    userName: {
      title: 'name',
      minLength: 2,
      maxLength: 30,
      pattern: /^[A-Z]+[\w\d\s\-\."]*[\w\d]+$/,
      patternNote: 'latin letters, digits and spaces or -. (in the middle)',
    },
    login: {
      title: 'login',
      minLength: 4,
      maxLength: 30,
      pattern: /^[\w\d]+[\w\d\-]*[\w\d]+$/,
      patternNote: 'latin letters, digits and - (in the middle)',
    },
    password: this.passwordOption,
    newPassword: this.passwordOption,
    repeatedPassword: this.passwordOption,
    searchRequest: {
      title: 'search request',
      minLength: 1, maxLength: 20,
      pattern: /^[\p{L}\d\s\-\.\+"]+$/u,
      patternNote: 'unicode letters, digits, spaces and .+-',
    }
  }

  localize(value: string, ...args: unknown[]): unknown {
    let localizedValue;
    if (this.currentLanguage) {
      const contentType = (args.length) ? 'articles' : 'strings';
      localizedValue = localizationLibrary[this.currentLanguage][contentType][value];
    }
      return (localizedValue) ? localizedValue : value;

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
      case 'searchRequest':
        return [
          Validators.maxLength(this.validOptions[type].maxLength),
          Validators.pattern(this.validOptions[type].pattern),
        ];
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

      const localizedTitle = this.localize(controlOptionTitle.toString());


      const formControlErrors = (controlObj instanceof FormControl)
        ? controlObj.errors
        : controlObj.controls[formControlType].errors;

      switch(true) {
        case (!!formControlErrors?.['required']):
          return `${this.localize('You must enter a')} ${localizedTitle}`;
        case (!!formControlErrors?.['minlength']):
          return `${this.localize('Min length of')} ${localizedTitle} - ${controlOption.minLength} ${this.localize('chars')}`;
        case (!!formControlErrors?.['maxlength']):
          return `${this.localize('Max length of')} ${localizedTitle} - ${controlOption.maxLength} ${this.localize('chars')}`;
        case (!!formControlErrors?.['pattern']):
          return `${this.localize('Allowed symbols for')} ${localizedTitle} - "${controlOption.patternNote}"`;
        case (!!formControlErrors?.['passwordsMatch']):
            return `${this.localize('Passwords do not match')}`;
        default:
          return `${this.localize('Not valid')} ${localizedTitle}`;
      };

  }

}
