import { Injectable } from '@angular/core';

import { CurUserObj } from './app.interfeces';

const emptyUserStr = JSON.stringify(
  {
    login: '',
    token: '',
  }
);

@Injectable()
export class LocalStorageService {
  private _currentUser: CurUserObj = JSON.parse(emptyUserStr);

  constructor() {}

  get currentUser() {
    const localCurrentUser = localStorage.getItem('currentUser');

    if (localCurrentUser) {
      this._currentUser = JSON.parse(localCurrentUser);
    }
    return this._currentUser
  }

  set currentUser(userObj) {
    this._currentUser = userObj;
    localStorage.setItem('currentUser', JSON.stringify(userObj));
  }

  get isUserLoggedIn() {
    return !!(this.currentUser.token)
  }

  logOutUser() {
    this.currentUser = JSON.parse(emptyUserStr);
    console.log('User logged out')
  }

}
