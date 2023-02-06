import { Injectable } from '@angular/core';

import { CurUserObj, ApiBoardObj, UserApiObj, AppBoardObj, ColumnAppObj,
        ColumnApiObj, TaskApiObj, ColumnSetApiObj, AvalibleLanguages
} from './app.interfeces';

import { AppFormsService } from './app-forms.service';
import { localizationLibrary } from './localizationLibrary';

const emptyUserStr = JSON.stringify({login: '', token: '',});

@Injectable()
export class LocalStorageService {
  private _currentUser: CurUserObj = this.getInitialCurrentUser();
  private _currentUserId: string = this.getInitialcurrentUserId();
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
  ) {
    this.formsService.currentLanguage = this.getInitialLanguage();
  }

  set currentLanguage(lang: AvalibleLanguages) {
    if (lang !== this._currentLanguage) {
      this._currentLanguage = lang;
      this.formsService.currentLanguage = lang;
      localStorage.setItem('currentLanguage', lang);
    }
  }

  get currentLanguage(): AvalibleLanguages {
    return this._currentLanguage;
  }

  get currentUser(): CurUserObj {
    return this._currentUser;
  }

  set currentUser(userObj: CurUserObj) {
    this._currentUser = userObj;
    localStorage.setItem('currentUser', JSON.stringify(userObj));
  }

  get currentUserId(): string {
    return this._currentUserId
  }

  set currentUserId(userId: string) {
    this._currentUserId = userId;
    localStorage.setItem('currentUserId', userId);
  }

  get isUserLoggedIn(): boolean {
    return !!(this._currentUser.token);
  }

  get currentBoardUsersId(): string[] {
    return this.currentBoardUsers.map((user) => user._id);
  }

  get currentBoardUsersNames(): string[] {
    return this.currentBoardUsers.map((user) => user.name);
  }

  getInitialCurrentUser(): CurUserObj {
    const localCurrentUser = localStorage.getItem('currentUser');

    if (localCurrentUser) {
      return JSON.parse(localCurrentUser);
    }

    return JSON.parse(emptyUserStr);
  }

  getInitialcurrentUserId(): string {
    const currentUserId = localStorage.getItem('currentUserId');

    return (currentUserId) ? currentUserId : '';
  }

  getInitialLanguage(): AvalibleLanguages {
    const localCurrentLanguage = localStorage.getItem('currentLanguage');

    return (localCurrentLanguage)
      ? localCurrentLanguage as AvalibleLanguages
      : 'en';
  }

  getCurrentBoardUserById(userId: string): UserApiObj | undefined {
    if (this.currentBoardUsers.length) {
      return this.currentBoardUsers.find((user) => user._id === userId);
    }
    return;
  }

  updateCurrentBoardUsers(boardId: string): void {
    this.currentBoardUsers = (this.currentAppBoards.length)
      ? this._getCurrentBoardAppUsers(boardId)
      : this._getCurrentBoardApiUsers()
  }

  private _getCurrentBoardAppUsers(boardId: string): UserApiObj[] {
    const currentBoard = this.currentAppBoards
      .find((board) => board._id === boardId);

    return (currentBoard)
      ? [...currentBoard.users, currentBoard.owner]
      : [];
  }

  private _getCurrentBoardApiUsers(): UserApiObj[]  {
    return (this.apiUsers.length && this.currentApiBoard)
      ? [...this.currentApiBoard.users, this.currentApiBoard.owner]
          .map((userId) => this.apiUsers.find((user) => user._id === userId))
          .filter((user) => user) as UserApiObj[]
      : [];
  }


  updateBoardsStorage():void {
    const storageBoards = this.apiBoards.map((boardObj) => this._createStorageBoard(boardObj));

    this.currentAppBoards = storageBoards;
    this.updateCurrentUserId();
    this.isBoards = (!!storageBoards.length)
  }

  private _createStorageBoard(boardObj: ApiBoardObj): AppBoardObj {
    const ownerObj = this.apiUsers
      .find((userObj) => boardObj.owner === userObj._id);

    const participantsObj = this.apiUsers
      .filter((userObj) => boardObj.users.includes(userObj._id));

    return {
      _id: boardObj._id,
      title: boardObj.title,
      owner: ownerObj!,
      users: participantsObj,
    };
  }

  clearColumns(): void {
    this.currentBoardColumns = [];
    this.apiColumns = [];
    this.apiTasks = [];
  }

  updateCurrentUserId(): void {
    if (this.apiUsers.length !== 0 && this.currentUser.login) {
      const currentUserId = this.apiUsers
        .find((userObj) => userObj.login === this.currentUser.login)
        ?._id;

      this.currentUserId = (currentUserId) ? currentUserId : '';
    }
  }

  logOutUser(): void {
    this.currentUser = JSON.parse(emptyUserStr);
    this.currentUserId = '';
    console.log('User logged out');
  }

  deleteBoard(boardId: string): void {
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

  addColumn(apiColumn: ColumnApiObj): void {
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

  deleteApiColumn(columnObj: ColumnApiObj): void {
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

  addTask(columnId: string, taskObj: TaskApiObj): void {
    this.apiTasks.push(taskObj);
    this.fillAppBoardWithTasks(this.currentBoardColumns, [columnId]);
  }

  updateBoardTasks(tasks: TaskApiObj[]): void {
    if (tasks.length) {
      tasks.forEach((task) => {
        const targetTaskIndex = this.apiTasks
            .findIndex((apiTask) => apiTask._id === task._id);

        const targetTask = this.apiTasks[targetTaskIndex] as TaskApiObj;

        if (targetTask) {
          this._updateObjValues(targetTask, task);

          console.log('Task updated in ApiTasks');
          console.log(task.title);
        } else {
          this._updateTasksInAppColumns(task);
        }
      });
    }

    console.log('Updating ended');
  }

  private _updateObjValues<T extends TaskApiObj>(targetObj: T, sourceObj: T): void {
    for (let key in targetObj) {
      targetObj[key as keyof T] = sourceObj[key as keyof T];
    }
  }

  private _updateTasksInAppColumns (task: TaskApiObj): void {
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

  deleteTask(taskObj: TaskApiObj): void {
    const taskIndex = this.apiTasks.findIndex((task) => task._id === taskObj._id);

    if (taskIndex >= 0) {
      this.apiTasks.splice(taskIndex, 1);
      this.fillAppBoardWithTasks(this.currentBoardColumns, [taskObj.columnId]);
    }
  }

  updateColumnTitle(column: ColumnApiObj) {
    const newTitle = column.title;
    const apiColumn = this._findColumnById(column, this.apiColumns);
    const appColumn = this._findColumnById(column, this.currentBoardColumns);

    if (apiColumn && appColumn && newTitle) {
      this._changeColumnTitle(apiColumn, newTitle);
      this._changeColumnTitle(appColumn, newTitle);
    }
  }

  private _findColumnById<T extends ColumnApiObj | ColumnAppObj>(column: T, columns: T[]): T | undefined {
    return columns.find((currentColumn) => currentColumn._id === column._id)
  };

  private _changeColumnTitle(currentColumn: ColumnApiObj | ColumnAppObj, title: string): void {
    currentColumn.title = title;
  }

}
