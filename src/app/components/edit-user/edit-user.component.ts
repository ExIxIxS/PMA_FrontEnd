import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { ConfirmationService } from 'src/app/services/confirmation.service';
import { RestDataService } from 'src/app/services/restAPI.service';
import { AppFormsService } from 'src/app/services/app-forms.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ErrorHandlerService } from 'src/app/services/errorHandler.service';

import { FormConrolTypes, NewUser, Token, UserRest } from '../../app.interfeces';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Observer, Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit, OnDestroy {
  private subscribtions: Subscription[] = [];

  public hidePass: boolean = true;
  public hideNewPass: boolean = true;
  public initialName: string = '';
  public initialLogin: string = '';
  public checkoutForm: FormGroup = this.formService.getNewFormGroup({type: 'editUser'});
  public passwordFormControls: AbstractControl[] = [
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

  public ngOnInit(): void {
    this.fillFormWithUserValues();
    this.observeNewPasswordChanges();
  }

  public ngOnDestroy(): void {
    this.subscribtions.forEach((subscr) => subscr.unsubscribe());
  }

  public fillFormWithUserValues(): void {
    const getCurrentUserObserver: Observer<UserRest> = {
      next: (user: UserRest) => {
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
      complete: () => {},
    }

    const subscr = this.restAPI.getUser(this.localStorageService.currentUserId)
      .subscribe(getCurrentUserObserver);

    this.subscribtions.push(subscr);
  }

  public deleteUser(): void {
    this.confirmationService.openDialog({type: 'deleteUser'})
  }

  public getErrorMessage(type: FormConrolTypes): string {
    return this.formService.getErrorMessage(this.checkoutForm, type);
  };

  public saveChanges(): void {
    if (!this.checkoutForm.valid) {
      return;
    }

    const currentPass = this.checkoutForm.controls['password'].value;
    const userName = this.checkoutForm.controls['userName'].value;
    const login = this.checkoutForm.controls['login'].value;
    const newPass = this.checkoutForm.controls['newPassword'].value;

    const singInObserver = {
      next: (token: Token) => {
        this.localStorageService.currentUser = {
          login: this.initialLogin,
          token: token.token
        };

        const updatedUser: NewUser = {
          name: userName,
            login: login,
            password: (newPass) ? newPass : currentPass,
        }

        this.restAPI.updateUser(updatedUser, this.updateCurentUser.bind(this));
        this.endEditing();
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    const subscr = this.restAPI.getToken(this.initialLogin, currentPass)
      .subscribe(singInObserver);

    this.subscribtions.push(subscr);

  };

  private updateCurentUser(name: string, login: string): void {
    this.initialName = name;
    this.initialLogin = login;
    this.localStorageService.currentUser.login = login;
  }

  public observeNewPasswordChanges(): void {
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

    const subscr = this.checkoutForm.controls['newPassword'].valueChanges
      .subscribe(changesObserver);

    this.subscribtions.push(subscr);
  }

  public endEditing(): void {
    this.location.back();
  }

  public isNameChanged(): boolean {
    return this.checkoutForm.controls['userName'].value !== this.initialName;
  }

  public isLoginChanged(): boolean {
    return this.checkoutForm.controls['login'].value !== this.initialLogin;
  }

  public isSubmitDisabled(): boolean {
    return !(this.checkoutForm.valid
            && (this.isNameChanged()
                || this.isLoginChanged()
                || this.checkoutForm.controls['newPassword'].value));
  }

}
