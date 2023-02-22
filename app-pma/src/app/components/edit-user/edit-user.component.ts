import { Component } from '@angular/core';
import { Location } from '@angular/common';

import { ConfirmationService } from 'src/app/services/confirmation.service';
import { RestDataService } from 'src/app/services/restAPI.service';
import { AppFormsService } from 'src/app/services/app-forms.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ErrorHandlerService } from 'src/app/services/errorHandler.service';

import { FormConrolTypes, NewUserObj, TokenObj, UserRestObj } from '../../app.interfeces';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent {

  public hidePass: boolean = true;
  public hideNewPass: boolean = true;
  public initialName: string = '';
  public initialLogin: string = '';

  public checkoutForm = this.formService.getNewFormGroup({type: 'editUser'});

  public passwordFormControls = [
    this.checkoutForm.controls['password'],
    this.checkoutForm.controls['newPassword'],
    this.checkoutForm.controls['repeatedPassword'],
  ]

  constructor(private confirmationService: ConfirmationService,
              private restAPI : RestDataService,
              private localStorageService: LocalStorageService,
              private formService: AppFormsService,
              private errorHandlerService: ErrorHandlerService,
              private location: Location,
            ) { }

  ngOnInit() {
    this.fillFormWithUserValues();
    this.observeNewPasswordChanges()
  }

  fillFormWithUserValues() {
    const getCurrentUserObserver = {
      next: (user: UserRestObj) => {
        const nameFormControl = this.checkoutForm.controls['userName'];
        const loginFormControl = this.checkoutForm.controls['login'];
        nameFormControl.setValue(user.name);
        loginFormControl.setValue(user.login);
        nameFormControl.enable();
        loginFormControl.enable()
        this.initialName = user.name;
        this.initialLogin = user.login;
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err);
      },
    }

    this.restAPI.getUser(this.localStorageService.currentUserId)
      .subscribe(getCurrentUserObserver);
  }

  deleteUser() {
    this.confirmationService.openDialog({type: 'deleteUser'})
  }

  getErrorMessage(type: FormConrolTypes) {
    return this.formService.getErrorMessage(this.checkoutForm, type);
  };

  saveChanges(): void {
    if (this.checkoutForm.valid) {
      const currentPass = this.checkoutForm.controls['password'].value;
      const userName = this.checkoutForm.controls['userName'].value;
      const login = this.checkoutForm.controls['login'].value;
      const newPass = this.checkoutForm.controls['newPassword'].value;

      const singInObserver = {
        next: (token: TokenObj) => {
          this.localStorageService.currentUser = {
            login: this.initialLogin,
            token: token.token
          };

          const updatedUser: NewUserObj = {
            name: userName,
            login: login,
            password: (newPass) ? newPass : currentPass,
          }

          this.restAPI.updateUser(updatedUser, this._updateCurentUser.bind(this));
          this.endEditing();
         },
        error: (err: Error) => {
          this.errorHandlerService.handleError(err)
        },
      }

      this.restAPI.getToken(this.initialLogin, currentPass)
        .subscribe(singInObserver);
    }
  };

  private _updateCurentUser = (name: string, login: string) => {
    this.initialName = name;
    this.initialLogin = login;
    this.localStorageService.currentUser.login = login;
  }

  observeNewPasswordChanges() {
    const changesObserver = {
      next: (value: string) => {
        const repeatedPasswordFormControl = this.checkoutForm.controls['repeatedPassword'];

        if (!value && repeatedPasswordFormControl.enabled) {
          repeatedPasswordFormControl.disable();
        }

        if (value && repeatedPasswordFormControl.disabled) {
          repeatedPasswordFormControl.enable();
        }
      }
    }

    this.checkoutForm.controls['newPassword'].valueChanges
      .subscribe(changesObserver);
  }

  endEditing() {
    this.location.back();
  }

  isNameChanged() {
    return this.checkoutForm.controls['userName'].value !== this.initialName;
  }

  isLoginChanged() {
    return this.checkoutForm.controls['login'].value !== this.initialLogin;
  }

  isSubmitDisabled() {
    return !(this.checkoutForm.valid
            && (this.isNameChanged()
                || this.isLoginChanged()
                || this.checkoutForm.controls['newPassword'].value));
  }

}
