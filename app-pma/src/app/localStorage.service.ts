import { Injectable } from '@angular/core';

import { CurUserObj, ApiBoardObj, UserApiObj, AppBoardObj, ColumnAppObj, ColumnApiObj, TaskApiObj, ColumnSetApiObj, LocalizationLibrary, AvalibleLanguages } from './app.interfeces';
import { AppFormsService } from './app-forms.service';
import { localizationLibrary } from './localizationLibrary';

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
  public isBoards: boolean = false;
  public apiBoards: ApiBoardObj[] = [];
  public currentAppBoards: AppBoardObj[] = [];
  public currentApiBoard: ApiBoardObj | undefined;
  public apiUsers: UserApiObj[] = [];
  public currentBoardUsers: UserApiObj[] = [];
  public currentBoardColumns: ColumnAppObj[] = [];
  public apiColumns: ColumnApiObj[] = [];
  public apiTasks: TaskApiObj[] = [];
  public isTaskDropDisabled: boolean = false;
  public avalibleLanguages = Object.keys(localizationLibrary) as AvalibleLanguages[];
  private _currentLanguage: AvalibleLanguages = this.getInitialLanguage();

  constructor(
    private formsService: AppFormsService,
  ) {this.formsService.currentLanguage = this.getInitialLanguage();}

  set currentLanguage(lang: AvalibleLanguages) {
    if (lang !== this._currentLanguage) {
      this._currentLanguage = lang;
      localStorage.setItem('currentLanguage', lang);
      this.formsService.currentLanguage = lang;
    }
  }

  get currentLanguage() {
    return this._currentLanguage;
  }

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

  get currentBoardUsersId() {
    return this.currentBoardUsers.map((user) => user._id);
  }

  get currentBoardUsersNames() {
    return this.currentBoardUsers.map((user) => user.name);
  }

  getInitialLanguage() {
    const localCurrentLanguage = localStorage.getItem('currentLanguage');

    return (localCurrentLanguage)
      ? localCurrentLanguage as AvalibleLanguages
      : 'en';
  }

  getCurrentBoardUserById(userId: string) {
    if (this.currentBoardUsers.length) {
      return this.currentBoardUsers.find((user) => user._id === userId);
    }
    return;
  }

  updateCurrentBoardUsers(boardId: string) {
    let users: UserApiObj[] = [];

    if (this.currentAppBoards.length) {
      const currentBoard = this.currentAppBoards
        .find((board) => board._id === boardId);

      if (currentBoard) {
        users = [...currentBoard?.users];
        users?.push(currentBoard.owner);
      }
    } else {
      if (this.apiUsers.length && this.currentApiBoard) {
        const usersIds = [...this.currentApiBoard.users, this.currentApiBoard.owner];
        users = usersIds
          .map((userId) => this.apiUsers.find((user) => user._id === userId))
          .filter((user) => user) as UserApiObj[];
      }
    }

      this.currentBoardUsers = users as UserApiObj[];
  }

  updateBoardsStorage() {
    const createStorageBoard = (boardObj: ApiBoardObj) => {
      const ownerObj = this.apiUsers
        .find((userObj) => boardObj.owner === userObj._id);

      const participantsObj = this.apiUsers
        .filter((userObj) => boardObj.users.includes(userObj._id));

      const storageBoard: AppBoardObj = {
        _id: boardObj._id,
        title: boardObj.title,
        owner: ownerObj!,
        users: participantsObj,
      };

      return storageBoard;
    }

    const storageBoards = this.apiBoards.map((boardObj) => createStorageBoard(boardObj));

    this.currentAppBoards = storageBoards;
    this.updateCurrentUserId();
    this.isBoards = (storageBoards.length !== 0)
  }

  clearColumns(): void {
    this.currentBoardColumns = [];
    this.apiColumns = [];
    this.apiTasks = [];
  }

  updateCurrentUserId() {
    if (this.apiUsers.length !== 0) {
      const currentUserId = this.apiUsers
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
    const boardIndex = this.currentAppBoards.findIndex((boardObj) => boardObj._id === boardId);
    this.currentAppBoards.splice(boardIndex, 1);
  }

  createAppColumn(apiColumn: ColumnApiObj): ColumnAppObj {
    return {
      ...apiColumn,
      tasks: [],
      titleForm: this.formsService.getNewFormGroup({type: 'columnTitle', columnTitle: apiColumn.title})
    }
  }

  addColumn(apiColumn: ColumnApiObj) {
    const appColumn = this.createAppColumn(apiColumn);

    this.apiColumns.push(apiColumn);
    this.currentBoardColumns.push(appColumn);
  }

  sortByOrder<T extends ColumnAppObj | ColumnApiObj | TaskApiObj>(a: T, b: T): number {
      return a.order - b.order;
  }

  updateBoardAppColumns(): void {
    const appColumns: ColumnAppObj[] = this.apiColumns
      .sort(this.sortByOrder)
      .map((apiColumn) => this.createAppColumn(apiColumn));

    this.fillAppBoardWithTasks(appColumns);

    this.currentBoardColumns = appColumns;
    console.log('Board columns updated');
  }

  fillAppBoardWithTasks(appColumns: ColumnAppObj[], columnIds: string[] = []): void {
    const fillableColumns = (columnIds.length)
      ? appColumns.filter((column) => columnIds.includes(column._id))
      : appColumns;

    fillableColumns.forEach((column) => {
      const columnTasks = this.apiTasks.filter((apiTask) => apiTask.columnId === column._id);

      if (columnTasks.length) {
        columnTasks.sort(this.sortByOrder);
      }

      column.tasks = columnTasks;
    });
  }

  deleteApiColumn(columnObj: ColumnApiObj) {
    const columnIndex = this.apiColumns.findIndex((column) => column._id === columnObj._id);
    this.apiColumns.splice(columnIndex, 1);
  }

  getColumnSet<T extends ColumnApiObj[] | ColumnAppObj[]>(columnsArr: T): ColumnSetApiObj[]  {
    const columnSet = columnsArr.map((columnObj, index) => {
      return {
              _id: columnObj._id,
              order: index,
            }
    })

    return columnSet;
  }

  getColumnApiSet(): ColumnSetApiObj[] {
    return this.getColumnSet(this.apiColumns);
  }

  getColumnAppSet(): ColumnSetApiObj[] {
    return this.getColumnSet(this.currentBoardColumns);
  }

  addTask(columnId: string, taskObj: TaskApiObj) {
    this.apiTasks.push(taskObj);
    this.fillAppBoardWithTasks(this.currentBoardColumns, [columnId]);

  }

  updateBoardTasks(tasks: TaskApiObj[]): void {
    function updateObjValues<T extends TaskApiObj>(targetObj: T, sourceObj: T) {
      for (let key in targetObj) {
        targetObj[key as keyof T] = sourceObj[key as keyof T];
      }
    }

    if (tasks.length) {
      tasks.forEach((task) => {
        const targetTaskIndex = this.apiTasks
            .findIndex((apiTask) => apiTask._id === task._id);

        const targetTask = this.apiTasks[targetTaskIndex] as TaskApiObj;

        if (targetTask) {
          updateObjValues(targetTask, task);

          console.log('Task updated in ApiTasks');
          console.log(task.title);
        } else {
          this.apiTasks.push(task);
          const targetAppColumn = this.currentBoardColumns
            .find((appColumn) => appColumn.tasks
              .some((appTask) => appTask._id === task._id));

          if (targetAppColumn) {
            const targetTaskIndex = targetAppColumn.tasks
              .findIndex((appTask) => appTask._id === task._id);

            targetAppColumn.tasks[targetTaskIndex] = task;
            console.log('Task updated in AppColumns');
            console.log(task.title);
          }
        }
      });
    }

    console.log('Updating ended');
  }

  deleteTask(taskObj: TaskApiObj): void {
    const taskIndex = this.apiTasks.findIndex((task) => task._id === taskObj._id);

    if (taskIndex >= 0) {
      this.apiTasks.splice(taskIndex, 1);
      this.fillAppBoardWithTasks(this.currentBoardColumns, [taskObj.columnId]);
    }
  }

  updateColumnTitle(column: ColumnApiObj) {
    const newTitle = column.title;

    const findColumnById = function(columns: ColumnApiObj[] | ColumnAppObj[]) {
      return columns.find((currentColumn) => currentColumn._id === column._id)
    };

    const changeColumnTitle = function(currentColumn: ColumnApiObj | ColumnAppObj | undefined) {
      if (currentColumn) {
        currentColumn.title = newTitle;
      }
    }

    const apiColumn = findColumnById(this.apiColumns);
    const appColumn = findColumnById(this.currentBoardColumns);

    changeColumnTitle(apiColumn);
    changeColumnTitle(appColumn);
  }

}
