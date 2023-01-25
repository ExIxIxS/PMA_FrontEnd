import { Injectable } from '@angular/core';

import { CurUserObj, ApiBoardObj, UserApiObj, AppBoardObj, ColumnAppObj, ColumnApiObj, TaskApiObj, ColumnSetApiObj } from './app.interfeces';
import { AppFormsService } from './app-forms.service';

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
  public apiTasks: TaskApiObj[][] = [];
  public isTaskDropDisabled: boolean = false;

  constructor(
    private formsService: AppFormsService,
  ) {}

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
      titleFormControl: this.formsService.getNewFormControl('columnTitle', apiColumn.title, true)
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

    this.updateBoardAppTasks(appColumns);

    this.currentBoardColumns = appColumns;
    console.log(this.apiColumns);
    console.log(this.currentBoardColumns);
  }

  updateBoardAppTasks(appColumns: ColumnAppObj[], columnIds: string[] = []): void {
    function fillTasks(apiTasks: TaskApiObj[]) {
      const currentColumn = appColumns
        .find((column) => column._id === apiTasks[0].columnId);

      if (currentColumn) {
        currentColumn.tasks = apiTasks;
      }
    }

    this.trimApiTasks();

    this.apiTasks
      .forEach((apiTasks) => apiTasks
        .sort(this.sortByOrder));

    const apiTasksArr = (columnIds.length)
      ? this.apiTasks.filter((apiTasks) => columnIds.includes(apiTasks[0].columnId))
      : this.apiTasks;

    apiTasksArr.forEach((apiTasks) => fillTasks(apiTasks));
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
    const columnTasks = this.apiTasks
      .find((tasksColumn) => tasksColumn
        .find((tasks) => tasks.columnId === columnId));

    if (columnTasks) {
      columnTasks.push(taskObj);
    } else {
      this.apiTasks.push([taskObj]);
    }
    this.updateBoardAppTasks(this.currentBoardColumns, [columnId]);

  }

  updateApiTasks(columnId: string, tasks: TaskApiObj[]): void {
    if (tasks.length) {
      const columnTasksIndex = this.apiTasks
        .findIndex((columnTasks) => columnTasks[0].columnId === columnId);
      if (columnTasksIndex >= 0) {
        this.apiTasks.splice(columnTasksIndex, 1, tasks);
      } else {
        this.apiTasks.push(tasks);
      }

    } else {
      this.apiTasks = this.apiTasks
        .map((columnTasks) => columnTasks
          .filter((task) => task.columnId !== columnId));
    }

    this.trimApiTasks();
  }

  trimApiTasks() {
    this.apiTasks = this.apiTasks.filter((columnTasks) => columnTasks.length);
  }

  deleteTask(taskObj: TaskApiObj): void {
    const tasksColumn = this.apiTasks.find((tasks) => tasks[0].columnId === taskObj.columnId);
    const taskIndex = tasksColumn?.findIndex((task) => task._id === taskObj._id);

    if (taskIndex !== undefined && taskIndex >= 0) {
      tasksColumn?.splice(taskIndex, 1);
      this.updateBoardAppTasks(this.currentBoardColumns, [taskObj.columnId]);
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
