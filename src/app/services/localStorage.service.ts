import { ChangeDetectorRef, EventEmitter, Injectable, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { CurUser, RestBoard, UserRest, AppBoard, ColumnApp,
        ColumnRest, TaskRest, ColumnSetRest,
} from '../app.interfeces';

import { AppFormsService } from './app-forms.service';

const emptyUserStr = JSON.stringify({login: '', token: '',});

@Injectable()
export class LocalStorageService {
  @Output() currentAppBoardsEmitter = new EventEmitter<AppBoard[]>();

  private _avalibleLanguages = ['en', 'pl', 'be', 'ru'];
  private _currentUser: CurUser = this.getInitialCurrentUser();
  private _currentUserId: string = this.getInitialcurrentUserId();
  private _currentLanguage: string = this.getInitialcurrentUserId();
  private _currentColorTheme: string = this.getInitialColorTheme();
  private _currentTypography: string = this.getInitialTypography();
  private html: HTMLElement = document.documentElement;
  private _currentAppBoards: AppBoard[] = [];

  public body: HTMLElement = document.body;
  public isBoards = false;
  public restBoards: RestBoard[] = [];
  public currentRestBoard: RestBoard | undefined;
  public restUsers: UserRest[] = [];
  public currentBoardUsers: UserRest[] = [];
  public currentBoardColumns: ColumnApp[] = [];
  public restColumns: ColumnRest[] = [];
  public restTasks: TaskRest[] = [];
  public isTaskDropDisabled = false;
  public changeDetector: ChangeDetectorRef | undefined;

  constructor(
    private formsService: AppFormsService,
    private translateService: TranslateService,
  ) {
    this.setLanguages();
    this.setInitialColorTheme();
    this.setInitialTypography();
  }

  public get currentAppBoards(): AppBoard[] {
    return this._currentAppBoards;
  }

  public set currentAppBoards(appBoards: AppBoard[]) {
    this._currentAppBoards = appBoards;
    this.currentAppBoardsEmitter.emit();
  }

  public set currentLanguage(lang: string) {
    if (lang !== this._currentLanguage) {
      localStorage.setItem('currentLanguage', lang);
      this._currentLanguage = lang;
      this.changeHtmlLang(lang);
    }
  }

  public get currentLanguage(): string {
    return this._currentLanguage;
  }

  public get currentUser(): CurUser {
    return this._currentUser;
  }

  public set currentUser(userObj: CurUser) {
    this._currentUser = userObj;
    localStorage.setItem('currentUser', JSON.stringify(userObj));
  }

  public get currentUserId(): string {
    return this._currentUserId
  }

  public set currentUserId(userId: string) {
    this._currentUserId = userId;
    localStorage.setItem('currentUserId', userId);
  }

  public get isUserLoggedIn(): boolean {
    return !!(this._currentUser.token);
  }

  public get currentBoardUsersId(): string[] {
    return this.currentBoardUsers.map((user) => user._id);
  }

  public get currentBoardUsersNames(): string[] {
    return this.currentBoardUsers.map((user) => user.name);
  }

  public get currentColorTheme(): string {
    return this._currentColorTheme;
  }

  private changeBodyColorTheme(colorTheme: string): void {
    if (this._currentColorTheme !== 'default') {
      this.body.classList.remove(`${this._currentColorTheme}-theme`);
    }

    if (colorTheme !== 'default') {
      this.body.classList.add(`${colorTheme}-theme`);
    }
  }

  public set currentColorTheme(colorTheme: string) {
    if (colorTheme !== this._currentColorTheme) {
      this.changeBodyColorTheme(colorTheme);
      this._currentColorTheme = colorTheme;
      localStorage.setItem('currentColorTheme', colorTheme);
    }
  }

  private setInitialColorTheme(): void {
    this.changeBodyColorTheme(this._currentColorTheme);
  }

  private getInitialColorTheme(): string {
    const currentColorTheme = localStorage.getItem('currentColorTheme');

    return (currentColorTheme) ? currentColorTheme : 'default';
  }

  private setInitialTypography(): void {
    this.changeTypography(this._currentTypography);
  }

  private getInitialTypography(): string {
    const currentTypography = localStorage.getItem('currentTypography');

    return (currentTypography) ? currentTypography : 'default';
  }

  private changeTypography(typography: string): void {
    if (this._currentTypography !== 'default') {
      this.body.classList.remove(`${this._currentTypography}-typography`);
    }

    if (typography !== 'default') {
      this.body.classList.add(`${typography}-typography`);
    }

  }

  public set currentTypography(typography: string) {
    if (typography !== this._currentTypography) {
      this.changeTypography(typography);
      this._currentTypography = typography;
      localStorage.setItem('currentTypography', typography);
    }
  }

  public get currentTypography(): string {
    return this._currentTypography;
  }

  public getInitialCurrentUser(): CurUser {
    const localCurrentUser = localStorage.getItem('currentUser');

    return (localCurrentUser)
      ? JSON.parse(localCurrentUser)
      : JSON.parse(emptyUserStr);
  }

  public getInitialcurrentUserId(): string {
    const currentUserId = localStorage.getItem('currentUserId');

    return (currentUserId)
      ? currentUserId
      : '';
  }

  private setLanguages(): void {
    this.translateService.addLangs(this._avalibleLanguages);
    this.translateService.setDefaultLang('en');

    const localCurrentLanguage = localStorage.getItem('currentLanguage');
    this._currentLanguage = (localCurrentLanguage)
      ? localCurrentLanguage
      : 'en';

    this.translateService.use(this._currentLanguage);
    this.changeHtmlLang(this._currentLanguage);
  }

  private changeHtmlLang(lang: string): void {
    if (this.html && this._avalibleLanguages.includes(lang)) {
      this.html.lang = lang;
    }
  }

  public getCurrentBoardUserById(userId: string): UserRest | undefined {
    if (this.currentBoardUsers.length) {
      return this.currentBoardUsers.find((user) => user._id === userId);
    }
    return;
  }

  public updateCurrentBoardUsers(boardId: string): void {
    this.currentBoardUsers = (this.currentAppBoards.length)
      ? this.getCurrentBoardAppUsers(boardId)
      : this.getCurrentBoardRestUsers()
  }

  private getCurrentBoardAppUsers(boardId: string): UserRest[] {
    const currentBoard = this.currentAppBoards
      .find((board) => board._id === boardId);

    return (currentBoard)
      ? [...currentBoard.users, currentBoard.owner]
      : [];
  }

  private getCurrentBoardRestUsers(): UserRest[]  {
    return (this.restUsers.length && this.currentRestBoard)
      ? [...this.currentRestBoard.users, this.currentRestBoard.owner]
          .map((userId) => this.restUsers
            .find((user) => user._id === userId))
          .filter((user) => user) as UserRest[]
      : [];
  }

  public updateBoardsStorage(): void {
    const storageBoards = this.restBoards
      .map((boardObj) => this.createStorageBoard(boardObj));

    this.currentAppBoards = storageBoards;
    this.updateCurrentUserId();
    this.isBoards = (!!storageBoards.length)

  }

  private createStorageBoard(boardObj: RestBoard): AppBoard {
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

  public clearColumns(): void {
    this.currentBoardColumns = [];
    this.restColumns = [];
    this.restTasks = [];
  }

  public updateCurrentUserId(): void {
    if (this.restUsers.length !== 0 && this.currentUser.login) {
      const currentUserId = this.restUsers
        .find((userObj) => userObj.login === this.currentUser.login)
        ?._id;

      this.currentUserId = (currentUserId) ? currentUserId : '';
    }
  }

  public logOutUser(): void {
    this.currentUser = JSON.parse(emptyUserStr);
    this.currentUserId = '';
  }

  public deleteBoard(boardId: string): void {
    const boardIndex = this.currentAppBoards.findIndex((boardObj) => boardObj._id === boardId);
    this.currentAppBoards.splice(boardIndex, 1);
    this.currentAppBoardsEmitter.emit();
  }

  public createAppColumn(restColumn: ColumnRest): ColumnApp {
    return {
      ...restColumn,
      tasks: [],
      titleForm: this.formsService.getNewFormGroup({type: 'columnTitle', columnTitle: restColumn.title})
    }
  }

  public addColumn(restColumn: ColumnRest, additionalHandler?: () => void): void {
    const appColumn = this.createAppColumn(restColumn);

    this.restColumns.push(restColumn);
    this.currentBoardColumns.push(appColumn);
    this.currentBoardColumns.sort(this.sortByOrder);
    additionalHandler?.();
  }

  public sortByOrder<T extends ColumnApp | ColumnRest | TaskRest>(a: T, b: T): number {
      return a.order - b.order;
  }

  public updateBoardAppColumns(): void {
    const appColumns: ColumnApp[] = this.restColumns
      .sort(this.sortByOrder)
      .map((restColumn) => this.createAppColumn(restColumn));

    this.fillAppBoardWithTasks(appColumns);
    this.currentBoardColumns = appColumns;
  }

  public fillAppBoardWithTasks(appColumns: ColumnApp[], columnIds: string[] = []): void {
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

  public deleteRestColumn(columnObj: ColumnRest): void {
    const columnIndex = this.restColumns.findIndex((column) => column._id === columnObj._id);

    this.restColumns.splice(columnIndex, 1);
  }

  public getColumnSet<T extends ColumnRest[] | ColumnApp[]>(columnsArr: T): ColumnSetRest[]  {
    const columnSet = columnsArr.map((columnObj, index) => {
      return {
              _id: columnObj._id,
              order: index,
            }
    })

    return columnSet;
  }

  public getColumnRestSet(): ColumnSetRest[] {
    return this.getColumnSet(this.restColumns);
  }

  public getColumnAppSet(): ColumnSetRest[] {
    return this.getColumnSet(this.currentBoardColumns);
  }

  public addTask(columnId: string, taskObj: TaskRest): void {
    this.restTasks.push(taskObj);
    this.fillAppBoardWithTasks(this.currentBoardColumns, [columnId]);
  }

  public updateBoardTasks(tasks: TaskRest[]): void {
    if (!tasks.length) {
      return;
    }

    tasks.forEach((task) => {
      const targetTaskIndex = this.restTasks
        .findIndex((restTask) => restTask._id === task._id);

      const targetTask = this.restTasks[targetTaskIndex] as TaskRest;

      if (targetTask) {
        this.updateObjValues(targetTask, task);
      } else {
        this.updateTasksInAppColumns(task);
      }
    });

  }

  private updateObjValues<T extends TaskRest>(targetObj: T, sourceObj: T): void {
    for (const key in targetObj) {
      targetObj[key as keyof T] = sourceObj[key as keyof T];
    }
  }

  private updateTasksInAppColumns (task: TaskRest): void {
    this.restTasks.push(task);
    const targetAppColumn = this.currentBoardColumns
      .find((appColumn) => appColumn.tasks
        .some((appTask) => appTask._id === task._id));

    if (targetAppColumn) {
      const targetTaskIndex = targetAppColumn.tasks
        .findIndex((appTask) => appTask._id === task._id);

      targetAppColumn.tasks[targetTaskIndex] = task;
    }
  }

  public deleteTask(taskObj: TaskRest): void {
    const taskIndex = this.restTasks.findIndex((task) => task._id === taskObj._id);

    if (taskIndex >= 0) {
      this.restTasks.splice(taskIndex, 1);
      this.fillAppBoardWithTasks(this.currentBoardColumns, [taskObj.columnId]);
    }
  }

  public updateColumnTitle(column: ColumnRest): void {
    const newTitle = column.title;
    const restColumn = this.findColumnById(column, this.restColumns);
    const appColumn = this.findColumnById(column, this.currentBoardColumns);

    if (restColumn && appColumn && newTitle) {
      this.changeColumnTitle(restColumn, newTitle);
      this.changeColumnTitle(appColumn, newTitle);
    }
  }

  private findColumnById<T extends ColumnRest | ColumnApp>(column: T, columns: T[]): T | undefined {
    return columns.find((currentColumn) => currentColumn._id === column._id)
  }

  private changeColumnTitle(currentColumn: ColumnRest | ColumnApp, title: string): void {
    currentColumn.title = title;
  }

}
