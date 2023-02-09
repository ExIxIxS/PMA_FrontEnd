import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { FormConrolTypes, TaskRestObj, UserRestObj } from './app.interfeces';


type FormGroupTypes = 'taskForm'
                    | 'singIn'
                    | 'singUp'
                    | 'editUser'
                    | 'columnTitle'
                    | 'newBoard';

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
    private translateService: TranslateService,
  ) { }

  currentLanguage = this.translateService.currentLang;

  passwordOption = {
    title: 'password',
    minLength: 8,
    maxLength: 96,
    pattern: /^[\w\d!@#/$%/^&/*/?]+$/,
    patternError: 'password',
  }

  validOptions = {
    columnTitle: {
      title: 'column title',
      minLength: 2,
      maxLength: 30,
      pattern: /^[\p{L}\d'"\+]+[\p{L}\d\s\-\.\+'"]*[\p{L}\d'"\+]+$/u,
      patternError: 'title',
    },
    boardTitle: {
      title: 'board title',
      minLength: 5,
      maxLength: 30,
      pattern: /^[\p{L}\d'"\+]+[\p{L}\d\s\-\.\+'"]*[\p{L}\d'"\+]+$/u,
      patternError: 'title',
    },
    taskTitle: {
      title: 'task title',
      minLength: 2,
      maxLength: 30,
      pattern: /^[\p{L}\d'"\+]+[\p{L}\d\s\-\.\+'"]*[\p{L}\d'"\+]+$/u,
      patternError: 'title',
    },
    taskDescription: {
      title: 'task description',
      minLength: 0,
      maxLength: 200,
      pattern: /^[\p{L}\d'"\+]+[\p{L}\d\s\-\.\+'"]*[\p{L}\d'"\+\.]+$/u,
      patternError: 'title',
    },
    userName: {
      title: 'name',
      minLength: 2,
      maxLength: 30,
      pattern: /^[A-Z]+[\w\d\s\-\."]*[\w\d]+$/,
      patternError: 'userName',
    },
    login: {
      title: 'login',
      minLength: 4,
      maxLength: 30,
      pattern: /^[\w\d]+[\w\d\-]*[\w\d]+$/,
      patternError: 'login',
    },
    password: this.passwordOption,
    newPassword: this.passwordOption,
    repeatedPassword: this.passwordOption,
    searchRequest: {
      title: 'search request',
      minLength: 1, maxLength: 20,
      pattern: /^[\p{L}\d\s\-\.\+"]+$/u,
      patternError: 'searchRequest',
    }
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

  getNewFormGroup(groupArgs: {type: FormGroupTypes, sourceTask?: TaskRestObj | null, executorName?: string, editableUser?: UserRestObj, columnTitle?: string}): FormGroup {
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
      case 'columnTitle': {
        const title = (groupArgs.columnTitle)
        ? groupArgs.columnTitle
        : '';

        return new FormGroup({
          columnTitle: this.getNewFormControl('columnTitle', title, true),
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
      case 'newBoard': {
        return new FormGroup({
          boardTitle: this.getNewFormControl('boardTitle'),
          participants: new FormControl(''),
        });
      }
    }
  }

  translate(localeKey: string): string {
    const localizedValue = this.translateService.instant(localeKey)

    return (localizedValue) ? localizedValue : localeKey;
  }

  getErrorMessage(controlObj: FormControl | FormGroup, formControlType: FormConrolTypes): string {
    const controlOption = this.validOptions[formControlType as keyof typeof this.validOptions];
    const localizedTitle = this.translate(`formErrors.${formControlType}`);
    const formControlErrors = (controlObj instanceof FormControl)
      ? controlObj.errors
      : controlObj.controls[formControlType].errors;

    switch(true) {
      case (!!formControlErrors?.['required']):
        return `${this.translate('formErrors.required')} ${localizedTitle}`;
      case (!!formControlErrors?.['minlength']):
        return `${this.translate('formErrors.minLength')} ${localizedTitle} - ${controlOption.minLength} ${this.translate('formErrors.chars')}`;
      case (!!formControlErrors?.['maxlength']):
        return `${this.translate('formErrors.maxLength')} ${localizedTitle} - ${controlOption.maxLength} ${this.translate('formErrors.chars')}`;
      case (!!formControlErrors?.['pattern']):
        return `${this.translate('formErrors.allowedSymbols')} ${localizedTitle} - "${this.translate('formErrors.patternNote.' + controlOption.patternError)}"`;
      case (!!formControlErrors?.['passwordsMatch']):
        return `${this.translate('formErrors.doNotMatch')}`;
      default:
        return `${this.translate('formErrors.notValid')} ${localizedTitle}`;
    };

  }

}
