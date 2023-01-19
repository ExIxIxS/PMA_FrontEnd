import { Injectable } from '@angular/core';

import { CurUserObj, BoardObj, UserObj, BoardObjStorage, ColumnAppObj, ColumnApiObj, TaskApiObj, ColumnSetApiObj } from './app.interfeces';

const emptyUserStr = JSON.stringify(
  {
    login: '',
    token: '',
  }
);

@Injectable()
export class LocalStorageService {
  private _currentUser: CurUserObj = JSON.parse(emptyUserStr);
  private _currentUserId: string = '';
  public currentStorageBoards: BoardObjStorage[] = [];
  public currentBoards: BoardObj[] = [];
  public currentUsers: UserObj[] = [];
  public isBoards: boolean = false;
  public currentBoardColumns: ColumnAppObj[] = [];
  public apiColumns: ColumnApiObj[] = [];
  public apiTasks: TaskApiObj[][] = [];

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

  get currentUserId() {
    const currentUserId = localStorage.getItem('currentUserId');

    if (currentUserId) {
      this._currentUserId = currentUserId;
    }
    return this._currentUserId
  }

  set currentUserId(userId: string) {
    this._currentUserId = userId;
    localStorage.setItem('currentUserId', userId);
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
      const currentUserId = this.currentUsers
        .find((userObj) => userObj.login === this.currentUser.login)
        ?._id;

      this.currentUserId = (currentUserId) ? currentUserId : '';
    }
  }

  logOutUser() {
    this.currentUser = JSON.parse(emptyUserStr);
    this.currentUserId = '';
    console.log('User logged out');
  }

  deleteBoard(boardId: string) {
    const boardIndex = this.currentStorageBoards.findIndex((boardObj) => boardObj._id === boardId);
    this.currentStorageBoards.splice(boardIndex, 1);
  }

  addColumn(apiColumn: ColumnApiObj) {
    const appColumn = {
      ...apiColumn,
      tasks: [],
    }

    this.apiColumns.push(apiColumn);
    this.currentBoardColumns.push(appColumn);
  }

  updateBoardAppColumns(): void {
    const appColumns: ColumnAppObj[] = this
      .apiColumns.map((apiColumn) => {
        return {
        ...apiColumn,
        tasks: [],
      }})
      .sort(sortByOrder);

    function fillTasks(apiTasks: TaskApiObj[]) {
      const currentColumn = appColumns
        .find((column) => column._id === apiTasks[0].columnId);

      if (currentColumn) {
        currentColumn.tasks = apiTasks;
      }
    }

    function sortByOrder<T extends ColumnAppObj | TaskApiObj>(a: T, b: T) {
      return a.order - b.order;
    }

    this.apiTasks
      .filter((apiTasks) => apiTasks.length)
      .map((apiTasks) => apiTasks.sort(sortByOrder))
      .forEach(fillTasks);

    this.currentBoardColumns = appColumns;
    console.log(this.currentBoardColumns);
  }

  deleteApiColumn(columnObj: ColumnApiObj) {
    const columnIndex = this.apiColumns.findIndex((column) => column._id === columnObj._id);
    this.apiColumns.splice(columnIndex, 1);
  }

  getColumnSet(): ColumnSetApiObj[] {
    const columnSet = this.apiColumns.map((columnObj, index) => {
      return {
        _id: columnObj._id,
        order: index,
      }
    })

    return columnSet;
  }

}
