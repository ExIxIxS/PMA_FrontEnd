import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observer, concat, merge } from 'rxjs';

import { LocalStorageService } from './localStorage.service';
import { ErrorHandlerService } from './errorHandler.service';
import { AppControlService } from './app-control.service'

import { TokenObj, UserRestObj, NewBoardObj, RestBoardObj, ColumnRestObj, TaskRestObj,
        NewColumnOption, NewColumnRestObj, DeletedColumnOption, NewTaskObj, TaskSetRestObj,
        TaskDeletionOptions, EditableTask, NewUserObj, ObserverTemplate,
      } from '../app.interfeces';
import { TranslateService } from '@ngx-translate/core';

const REST_URL = 'https://pmabackend-exixixs.up.railway.app/';
//  const REST_URL = 'http://localhost:3000/';

@Injectable()
export class RestDataService {
  public isInProgress: boolean = false;
  public isNewBoard: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private localStorageService: LocalStorageService,
    private errorHandlerService: ErrorHandlerService,
    private appControlService: AppControlService,
    private translateService: TranslateService,
  ) {}

  startProgress() {
    this.isInProgress = true;
  }

  stopProgress() {
    this.isInProgress = false;
  }

  translate(localeKey: string): string {
    const localizedValue = this.translateService.instant(localeKey)

    return (localizedValue) ? localizedValue : localeKey;
  }

  getRestObserver<T>(options: ObserverTemplate = {}): Observer<T> {
    return {
      next: (options.next)
        ? options.next
        : (value: T) => {},
      error: (options.error)
        ? options.error
        : (err: Error) => {
        this.errorHandlerService.handleError(err);
        this.stopProgress();
      },
      complete: (options.complete)
        ? options.complete
        : () => {},
    };
  }

  getToken(login: string, pass: string) {
    const singInObj = {
      login: login,
      password: pass,
    }

    return this.http.post<TokenObj>(REST_URL + 'auth/signin', singInObj);
  }

  autoSignIn() {
    const autoSingInObserver = this.getRestObserver<UserRestObj[]>({
      next: (users: UserRestObj[]) => {
        this.router.navigate(['main']);
        this.localStorageService.restUsers = users;
        this.localStorageService.updateCurrentUserId();
      }
    });

    this.getUsers().subscribe(autoSingInObserver);
  }

  signIn(login: string, pass: string): void {
    const singInObserver = this.getRestObserver<TokenObj>({
      next: (obj: TokenObj) => {
        const currentUser = {
          login,
          token: obj.token
        };
        this.localStorageService.currentUser = currentUser;
        this.autoSignIn();
      }
    });

    this.getToken(login, pass)
      .subscribe(singInObserver);
  };

  signUp(name: string, login: string, pass: string): void {
    const singUpObj: NewUserObj = {
      name: name,
      login: login,
      password: pass,
    }

    const singUpObserver = this.getRestObserver<UserRestObj>({
      next: () => {
        this.signIn(login, pass);
      },
    });

    this.http
      .post<UserRestObj>(REST_URL + 'auth/signup', singUpObj)
      .subscribe(singUpObserver);
  }

  getUser(userId: string) {
    return  this.http.get<UserRestObj>(`${REST_URL}users/${userId}`, this.getHttpOptions());
  }

  getUsers() {
    return  this.http.get<UserRestObj[]>(REST_URL + 'users', this.getHttpOptions());
  }

  updateRestUsers() {
    const updateRestUsersObserver = this.getRestObserver<UserRestObj[]>({
      next: (users: UserRestObj[]) => {
        this.localStorageService.restUsers = users;
      }
    });

    this.getUsers()
      .subscribe(updateRestUsersObserver);
  }

  createBoard(newBoard: NewBoardObj, templateName?: string) {
    this.startProgress();
    const createBoardObserver = this.getRestObserver<RestBoardObj>({
      next: (boardObj: RestBoardObj) => {
        this.isNewBoard = true;
        this.localStorageService.restBoards.push(boardObj);
        this.localStorageService.updateBoardsStorage();
        this.router.navigateByUrl(`boards/${boardObj._id}`);

        if (templateName) {
          this._createColumnsFromTemplate(templateName, boardObj._id);
        }
        this.stopProgress();
      }
    });

    this.http
      .post<RestBoardObj>(REST_URL + 'boards', newBoard, this.getHttpOptions())
      .subscribe(createBoardObserver);
  }

  private _createColumnsFromTemplate(templateName: string, boardId: string) {
    const boardTemplates = this.appControlService.boardTemplates;
    const template = boardTemplates.find((temp) => temp.name === templateName);
    if (template) {
      template.columns.forEach((columnName, index) => {
        const newColumnOption = {
          boardId: boardId,
          columnOrder: index,
          columnTitle: this.translate('boardTemplates.' + template.name + '.columns.' + columnName),
        }
        this.createColumn(newColumnOption);
      })
    }
  }

  updateBoardsStorage(completeCallBack?: Function) {
    let isBoardsTime = true;
    this.startProgress();

    const updateBoardsStorageObserver = this.getRestObserver<RestBoardObj[] | UserRestObj[]>({
      next: (objArr: RestBoardObj[] | UserRestObj[]) => {
        if (isBoardsTime) {
          this.localStorageService.restBoards = objArr as RestBoardObj[];
          isBoardsTime = false;
        } else {
          this.localStorageService.restUsers = objArr  as UserRestObj[];
        }
      },
      complete: () => {
        this.localStorageService.updateBoardsStorage();
        if (completeCallBack) {
          completeCallBack();
        }
        this.stopProgress();
      }
    });

    concat(this.getBoards(), this.getUsers())
      .subscribe(updateBoardsStorageObserver);

  }

  getBoard(boardId: string) {
    return  this.http.get<RestBoardObj>(REST_URL + 'boards/' + boardId, this.getHttpOptions());
  }

  getBoards() {
    return  this.http.get<RestBoardObj[]>(REST_URL + 'boards', this.getHttpOptions());
  }

  deleteBoard(boardId: string) {
    this.startProgress();

    const deleteBoardObserver = this.getRestObserver<RestBoardObj>({
      next: () => {
        this.localStorageService.deleteBoard(boardId);
        this.stopProgress();
      }
    });

    this.http
      .delete<RestBoardObj>(REST_URL + 'boards/' + boardId, this.getHttpOptions())
      .subscribe(deleteBoardObserver);
  }

  getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${this.localStorageService.currentUser.token}`
      })
    };
  }

  deleteCurentUser(): void {
    this.startProgress();

    const deleteUserObserver = this.getRestObserver<UserRestObj>({
      next: () => {
        this.appControlService.logOut();
        this.stopProgress();
      },
    });

    const userId = this.localStorageService.currentUserId;

    if (userId) {
      this.http
        .delete<UserRestObj>(REST_URL + 'users/' + userId, this.getHttpOptions())
        .subscribe(deleteUserObserver);
    } else {
      this.errorHandlerService.handleError(new Error('Local Storage: "User does not exist!"'));
      this.stopProgress();
    }
  }

  getBoardColumns(boardId: string) {
    return  this.http
      .get<ColumnRestObj[]>(`${REST_URL}boards/${boardId}/columns/`, this.getHttpOptions());
  }

  getColumnTasks(boardId: string, columnId: string) {
    return  this.http
      .get<TaskRestObj[]>(`${REST_URL}boards/${boardId}/columns/${columnId}/tasks`, this.getHttpOptions());
  }

  createColumn(columnOption: NewColumnOption): void {
    this.startProgress();

    const createColumnObserver = this.getRestObserver<ColumnRestObj>({
      next: (columnObj: ColumnRestObj) => {
        this.localStorageService.addColumn(columnObj);
        this.stopProgress();
      },
    });

    const boardId = columnOption.boardId;
    const newColumn: NewColumnRestObj = {
      title: columnOption.columnTitle,
      order: columnOption.columnOrder,
    }

    this.http
      .post<ColumnRestObj>(`${REST_URL}boards/${boardId}/columns/`, newColumn, this.getHttpOptions())
      .subscribe(createColumnObserver);
  }

  deleteColumn<T extends ColumnRestObj>(deletedColumn: DeletedColumnOption): void {
    this.startProgress();

    const deleteColumnObserver = this.getRestObserver<T>({
      next: (columnObj: T) => {
        this.localStorageService.deleteRestColumn(columnObj);
        this.updateColumnsOrder(true);
        this.stopProgress();
      },
    });

    if (deletedColumn) {
      this.http
        .delete<T>(`${REST_URL}boards/${deletedColumn.boardId}/columns/${deletedColumn.columnId}`, this.getHttpOptions())
        .subscribe(deleteColumnObserver);
    } else {
      this.errorHandlerService.handleError(new Error('Application: "Deletion initial values error"'));
      this.stopProgress();
    }
  }

  updateColumnsOrder<T extends ColumnRestObj[]>(isDeletion: boolean = false) {
    this.startProgress();

    const columnsSet = (isDeletion)
      ? this.localStorageService.getColumnRestSet()
      : this.localStorageService.getColumnAppSet();

    const updateOrderObserver = this.getRestObserver<T>({
      next: (columns: T) => {
        this.localStorageService.restColumns = columns;
        this.localStorageService.updateBoardAppColumns();
        this.stopProgress();
      },
      error: (err: Error) => {
        this.appControlService.reloadPage();
        this.errorHandlerService.handleError(err);
        this.stopProgress();
      },
    });

    if (columnsSet.length) {
      this.http
        .patch<T>(`${REST_URL}columnsSet`, columnsSet, this.getHttpOptions())
        .subscribe(updateOrderObserver);
    } else {
      this.localStorageService.updateBoardAppColumns();
      this.stopProgress();
    }

  }

  createTask<T extends TaskRestObj>(boardId: string, columnId: string, newTaskObj: NewTaskObj): void {
    this.startProgress();

     const createTaskObserver = this.getRestObserver<T>({
      next: (taskObj: T) => {
        this.localStorageService.addTask(columnId, taskObj);
        this.stopProgress();
      },
    });

    this.http
    .post<T>(`${REST_URL}boards/${boardId}/columns/${columnId}/tasks`, newTaskObj, this.getHttpOptions())
    .subscribe(createTaskObserver);
  }

  updateTaskSet<T extends TaskRestObj[]>(tasksSetsConfig: TaskSetRestObj[]) {
    if (tasksSetsConfig.length) {
      this.localStorageService.isTaskDropDisabled = true;
      this.startProgress();

      const updateOrderObserver = this.getRestObserver<T>({
        next: (tasks: T) => {
          if (tasks.length) {
            this.localStorageService.updateBoardTasks(tasks);
          }
          this.localStorageService.isTaskDropDisabled = false;
          this.stopProgress();
        },
      });

      this.http
        .patch<T>(`${REST_URL}tasksSet`, tasksSetsConfig, this.getHttpOptions())
        .subscribe(updateOrderObserver);

    }

  }

  deleteTask<T extends TaskRestObj>(deletionOptions: TaskDeletionOptions): void {
    const deletedTask = deletionOptions.deletedTask;
    const updatedTasks = deletionOptions.updatedTasks;
    this.startProgress();

    const deleteTaskObserver = this.getRestObserver<T>({
      next: (taskObj: T) => {
        this.localStorageService.deleteTask(taskObj);
        if (updatedTasks) {
          this.updateTaskSet(updatedTasks);
        }
        this.stopProgress();
      },
    });

    if (deletedTask) {
      this.http
        .delete<T>(`${REST_URL}boards/${deletedTask.boardId}/columns/${deletedTask.columnId}/tasks/${deletedTask.taskId}`, this.getHttpOptions())
        .subscribe(deleteTaskObserver);
    } else {
      this.errorHandlerService.handleError(new Error('Application: "Deletion initial values error"'));
      this.stopProgress();
    }
  }

  updateColumn(boardId: string, columnId: string, newColumn: NewColumnRestObj) {
    return this.http
      .put<ColumnRestObj>(`${REST_URL}boards/${boardId}/columns/${columnId}`, newColumn, this.getHttpOptions());
  }

  updateColumnTitle(boardId: string, columnId: string, newColumn: NewColumnRestObj) {
    this.startProgress();

    const updateColumnObserver = this.getRestObserver<ColumnRestObj>({
      next: (column: ColumnRestObj) => {
        this.localStorageService.updateColumnTitle(column);
        this.stopProgress();
      },
    });

    this.updateColumn(boardId, columnId, newColumn)
      .subscribe(updateColumnObserver);
  }

  updateTask<T extends TaskRestObj>(boardId: string, taskId: string, taskObj: EditableTask, additionalHandler?: Function) {
    this.startProgress();

    const updateTaskObserver = this.getRestObserver<T>({
      next: (task: T) => {
        this.localStorageService.updateBoardTasks([task]);
        if (additionalHandler) {
          additionalHandler();
        }
        this.stopProgress();
      },
    });

    this.http
    .put<T>(`${REST_URL}boards/${boardId}/columns/${taskObj.columnId}/tasks/${taskId}`, taskObj, this.getHttpOptions())
    .subscribe(updateTaskObserver);
  }

  updateUser<T extends UserRestObj>(updatedUser: NewUserObj, additionalHandler: Function) {
    this.startProgress();
    const userId = this.localStorageService.currentUserId;

    const updateUserObserver = this.getRestObserver<T>({
      next: (user: T) => {
        additionalHandler(user.name, user.login);
        this.stopProgress();
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err);
        this.stopProgress();
      },
    });

    this.http
    .put<T>(`${REST_URL}users/${userId}`, updatedUser, this.getHttpOptions())
    .subscribe(updateUserObserver);
  }

  search(rawRequest: string) {
    const searchRequest = this._getSearchRequest(rawRequest);

    return this.http
      .get<TaskRestObj[]>(`${REST_URL}tasksSet?search=${searchRequest}`, this.getHttpOptions());
  }

  private _getSearchRequest(str: string) {
    const request = str
      .trim()
      .split(' ')
      .filter((word) => !!word)
      .join('%20');

    return request;
  }

  getBoardUsers(boardId: string, completeCallBack: Function) {
    if (boardId) {
      let boardObj: RestBoardObj;
      let users: UserRestObj[];
      this.startProgress();

      const getBoardUsersObserver = this.getRestObserver<RestBoardObj | UserRestObj[]>({
        next: (result: RestBoardObj | UserRestObj[]) => {
          if (result.hasOwnProperty('length')) {
            users = result as UserRestObj[];
          } else {
            boardObj = result as RestBoardObj;
          }
        },
        complete: () => {
          if (completeCallBack) {
            const boardUsersId = [boardObj.owner, ...boardObj.users];
            const boardUsers = users.filter((user) => boardUsersId.includes(user._id));
            completeCallBack(boardUsers);
            this.stopProgress();
          }
        }
      });

      merge(this.getBoard(boardId), this.getUsers())
        .subscribe(getBoardUsersObserver);
    }
  }

}
