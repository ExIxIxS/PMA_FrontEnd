import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { CurUserObj, RestBoardObj, UserRestObj, AppBoardObj, ColumnAppObj,
        ColumnRestObj, TaskRestObj, ColumnSetRestObj,
} from './app.interfeces';

import { AppFormsService } from './app-forms.service';

const emptyUserStr = JSON.stringify({login: '', token: '',});

@Injectable()
export class LocalStorageService {
  private _currentUser: CurUserObj = this.getInitialCurrentUser();
  private _currentUserId: string = this.getInitialcurrentUserId();
  private _currentLanguage: string = this.getInitialcurrentUserId();
  private _avalibleLanguages = ['en', 'ru'];
  private _currentColorTheme: string = this._getInitialColorTheme();
  private _currentTypography: string = this._getInitialTypography();
  private _html = document.documentElement;
  private _body = document.body;

  public isBoards: boolean = false;
  public restBoards: RestBoardObj[] = [];
  public currentAppBoards: AppBoardObj[] = [];
  public currentRestBoard: RestBoardObj | undefined;
  public restUsers: UserRestObj[] = [];
  public currentBoardUsers: UserRestObj[] = [];
  public currentBoardColumns: ColumnAppObj[] = [];
  public restColumns: ColumnRestObj[] = [];
  public restTasks: TaskRestObj[] = [];
  public isTaskDropDisabled: boolean = false;

  constructor(
    private formsService: AppFormsService,
    private translateService: TranslateService,
  ) {
    this._setLanguages();
    this._setInitialColorTheme();
    this._setInitialTypography();
  }

  set currentLanguage(lang: string) {
    if (lang !== this._currentLanguage) {
      localStorage.setItem('currentLanguage', lang);
      this._currentLanguage = lang;
      this._changeHtmlLang(lang);
    }
  }

  get currentLanguage(): string {
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

  get currentColorTheme() {
    return this._currentColorTheme;
  }

  private _changeBodyColorTheme(colorTheme: string) {
    if (this._currentColorTheme !== 'default') {
      this._body.classList.remove(`${this._currentColorTheme}-theme`);
    }

    if (colorTheme !== 'default') {
      this._body.classList.add(`${colorTheme}-theme`);
    }
  }

  set currentColorTheme(colorTheme: string) {
    if (colorTheme !== this._currentColorTheme) {
      this._changeBodyColorTheme(colorTheme);
      this._currentColorTheme = colorTheme;
      localStorage.setItem('currentColorTheme', colorTheme);
    }
  }

  private _setInitialColorTheme() {
    this._changeBodyColorTheme(this._currentColorTheme);
  }

  private _getInitialColorTheme(): string {
    const currentColorTheme = localStorage.getItem('currentColorTheme');

    return (currentColorTheme) ? currentColorTheme : 'default';
  }

  private _setInitialTypography() {
    this._changeTypography(this._currentTypography);
  }

  private _getInitialTypography(): string {
    const currentTypography = localStorage.getItem('currentTypography');

    return (currentTypography) ? currentTypography : 'default';
  }

  private _changeTypography(typography: string) {
    if (this._currentTypography !== 'default') {
      this._body.classList.remove(`${this._currentTypography}-typography`);
    }

    if (typography !== 'default') {
      this._body.classList.add(`${typography}-typography`);
    }

  }

  set currentTypography(typography: string) {
    if (typography !== this._currentTypography) {
      this._changeTypography(typography);
      this._currentTypography = typography;
      localStorage.setItem('currentTypography', typography);
    }
  }

  get currentTypography() {
    return this._currentTypography;
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

  private _setLanguages(): void {
    this.translateService.addLangs(this._avalibleLanguages);
    this.translateService.setDefaultLang('en');

    const localCurrentLanguage = localStorage.getItem('currentLanguage');
    this._currentLanguage = (localCurrentLanguage)
      ? localCurrentLanguage
      : 'en';

    this.translateService.use(this._currentLanguage);
    this._changeHtmlLang(this._currentLanguage);
  }

  private _changeHtmlLang(lang: string) {
    if (this._html && this._avalibleLanguages.includes(lang)) {
      this._html.lang = lang;
    }
  }

  getCurrentBoardUserById(userId: string): UserRestObj | undefined {
    if (this.currentBoardUsers.length) {
      return this.currentBoardUsers.find((user) => user._id === userId);
    }
    return;
  }

  updateCurrentBoardUsers(boardId: string): void {
    this.currentBoardUsers = (this.currentAppBoards.length)
      ? this._getCurrentBoardAppUsers(boardId)
      : this._getCurrentBoardRestUsers()
  }

  private _getCurrentBoardAppUsers(boardId: string): UserRestObj[] {
    const currentBoard = this.currentAppBoards
      .find((board) => board._id === boardId);

    return (currentBoard)
      ? [...currentBoard.users, currentBoard.owner]
      : [];
  }

  private _getCurrentBoardRestUsers(): UserRestObj[]  {
    return (this.restUsers.length && this.currentRestBoard)
      ? [...this.currentRestBoard.users, this.currentRestBoard.owner]
          .map((userId) => this.restUsers.find((user) => user._id === userId))
          .filter((user) => user) as UserRestObj[]
      : [];
  }

  updateBoardsStorage():void {
    const storageBoards = this.restBoards.map((boardObj) => this._createStorageBoard(boardObj));

    this.currentAppBoards = storageBoards;
    this.updateCurrentUserId();
    this.isBoards = (!!storageBoards.length)
  }

  private _createStorageBoard(boardObj: RestBoardObj): AppBoardObj {
    const ownerObj = this.restUsers
      .find((userObj) => boardObj.owner === userObj._id);

    const participantsObj = this.restUsers
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
    this.restColumns = [];
    this.restTasks = [];
  }

  updateCurrentUserId(): void {
    if (this.restUsers.length !== 0 && this.currentUser.login) {
      const currentUserId = this.restUsers
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

  createAppColumn(restColumn: ColumnRestObj): ColumnAppObj {
    return {
      ...restColumn,
      tasks: [],
      titleForm: this.formsService.getNewFormGroup({type: 'columnTitle', columnTitle: restColumn.title})
    }
  }

  addColumn(restColumn: ColumnRestObj): void {
    const appColumn = this.createAppColumn(restColumn);

    this.restColumns.push(restColumn);
    this.currentBoardColumns.push(appColumn);
  }

  sortByOrder<T extends ColumnAppObj | ColumnRestObj | TaskRestObj>(a: T, b: T): number {
      return a.order - b.order;
  }

  updateBoardAppColumns(): void {
    const appColumns: ColumnAppObj[] = this.restColumns
      .sort(this.sortByOrder)
      .map((restColumn) => this.createAppColumn(restColumn));

    this.fillAppBoardWithTasks(appColumns);

    this.currentBoardColumns = appColumns;
    console.log('Board columns updated');
  }

  fillAppBoardWithTasks(appColumns: ColumnAppObj[], columnIds: string[] = []): void {
    const fillableColumns = (columnIds.length)
      ? appColumns.filter((column) => columnIds.includes(column._id))
      : appColumns;

    fillableColumns.forEach((column) => {
      const columnTasks = this.restTasks.filter((restTask) => restTask.columnId === column._id);

      if (columnTasks.length) {
        columnTasks.sort(this.sortByOrder);
      }

      column.tasks = columnTasks;
    });
  }

  deleteRestColumn(columnObj: ColumnRestObj): void {
    const columnIndex = this.restColumns.findIndex((column) => column._id === columnObj._id);
    this.restColumns.splice(columnIndex, 1);
  }

  getColumnSet<T extends ColumnRestObj[] | ColumnAppObj[]>(columnsArr: T): ColumnSetRestObj[]  {
    const columnSet = columnsArr.map((columnObj, index) => {
      return {
              _id: columnObj._id,
              order: index,
            }
    })

    return columnSet;
  }

  getColumnRestSet(): ColumnSetRestObj[] {
    return this.getColumnSet(this.restColumns);
  }

  getColumnAppSet(): ColumnSetRestObj[] {
    return this.getColumnSet(this.currentBoardColumns);
  }

  addTask(columnId: string, taskObj: TaskRestObj): void {
    this.restTasks.push(taskObj);
    this.fillAppBoardWithTasks(this.currentBoardColumns, [columnId]);
  }

  updateBoardTasks(tasks: TaskRestObj[]): void {
    if (tasks.length) {
      tasks.forEach((task) => {
        const targetTaskIndex = this.restTasks
            .findIndex((restTask) => restTask._id === task._id);

        const targetTask = this.restTasks[targetTaskIndex] as TaskRestObj;

        if (targetTask) {
          this._updateObjValues(targetTask, task);

          console.log('Task updated in RestTasks');
          console.log(task.title);
        } else {
          this._updateTasksInAppColumns(task);
        }
      });
    }

    console.log('Updating ended');
  }

  private _updateObjValues<T extends TaskRestObj>(targetObj: T, sourceObj: T): void {
    for (let key in targetObj) {
      targetObj[key as keyof T] = sourceObj[key as keyof T];
    }
  }

  private _updateTasksInAppColumns (task: TaskRestObj): void {
    this.restTasks.push(task);
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

  deleteTask(taskObj: TaskRestObj): void {
    const taskIndex = this.restTasks.findIndex((task) => task._id === taskObj._id);

    if (taskIndex >= 0) {
      this.restTasks.splice(taskIndex, 1);
      this.fillAppBoardWithTasks(this.currentBoardColumns, [taskObj.columnId]);
    }
  }

  updateColumnTitle(column: ColumnRestObj) {
    const newTitle = column.title;
    const restColumn = this._findColumnById(column, this.restColumns);
    const appColumn = this._findColumnById(column, this.currentBoardColumns);

    if (restColumn && appColumn && newTitle) {
      this._changeColumnTitle(restColumn, newTitle);
      this._changeColumnTitle(appColumn, newTitle);
    }
  }

  private _findColumnById<T extends ColumnRestObj | ColumnAppObj>(column: T, columns: T[]): T | undefined {
    return columns.find((currentColumn) => currentColumn._id === column._id)
  };

  private _changeColumnTitle(currentColumn: ColumnRestObj | ColumnAppObj, title: string): void {
    currentColumn.title = title;
  }

}
