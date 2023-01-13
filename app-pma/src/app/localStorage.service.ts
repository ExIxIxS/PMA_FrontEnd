import { Injectable } from '@angular/core';

import { CurUserObj, BoardObj, UserObj, BoardObjStorage } from './app.interfeces';

const emptyUserStr = JSON.stringify(
  {
    login: '',
    token: '',
  }
);

@Injectable()
export class LocalStorageService {
  private _currentUser: CurUserObj = JSON.parse(emptyUserStr);
  public currentUserId: string | undefined;
  public currentStorageBoards: BoardObjStorage[] = [];
  public currentBoards: BoardObj[] = [];
  public currentUsers: UserObj[] = [];
  public isBoards: boolean = false;

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

  updateBoardsStorage() {
    const createStorageBoard = (boardObj: BoardObj) => {
      const ownerObj = this.currentUsers
        .find((userObj) => boardObj.owner === userObj._id);

      const participantsObj = this.currentUsers
        .filter((userObj) => boardObj.users.includes(userObj._id));

      const storageBoard: BoardObjStorage = {
        _id: boardObj._id,
        title: boardObj.title,
        owner: ownerObj!,
        users: participantsObj,
      };

      return storageBoard;
    }

    const storageBoards = this.currentBoards.map((boardObj) => createStorageBoard(boardObj));

    this.currentStorageBoards = storageBoards;
    this.updateCurrentUserId();
    this.isBoards = (storageBoards.length !== 0)
  }

  updateCurrentUserId() {
    if (this.currentUsers.length !== 0) {
      this.currentUserId = this.currentUsers
        .find((userObj) => userObj.login === this.currentUser.login)
        ?._id;
    }

  }

  logOutUser() {
    this.currentUser = JSON.parse(emptyUserStr);
    console.log('User logged out');
  }

  deleteBoard(boardId: string) {
    const boardIndex = this.currentStorageBoards.findIndex((boardObj) => boardObj._id === boardId);
    this.currentStorageBoards.splice(boardIndex, 1);
  }

}
