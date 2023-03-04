import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, Observer, concat, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { LocalStorageService } from './localStorage.service';
import { ErrorHandlerService } from './errorHandler.service';
import { AppControlService } from './app-control.service'

import { Token, UserRest, NewBoard, RestBoard, ColumnRest, TaskRest,
        NewColumnOption, NewColumnRest, DeletedColumnOption, NewTask, TaskSetRest,
        TaskDeletionOptions, EditableTask, NewUser, ObserverTemplate, CurUser, RestHeaders,
      } from '../app.interfeces';

const REST_URL = 'https://pmabackend-exixixs.up.railway.app/';
// const REST_URL = 'http://localhost:3000/';

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

  public startProgress(): void {
    this.isInProgress = true;
    this.appControlService.checkChanges();
  }

  public stopProgress(): void {
    this.isInProgress = false;
    this.appControlService.checkChanges();
  }

  public translate(localeKey: string): string {
    const localizedValue = this.translateService.instant(localeKey)

    return (localizedValue)
      ? localizedValue
      : localeKey;
  }

  public getRestObserver<T>(options: ObserverTemplate = {}): Observer<T> {
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

  public getToken(login: string, pass: string): Observable<Token> {
    const signInObj: Pick<NewUser, 'login' | 'password'> = {
      login: login,
      password: pass,
    }

    return this.http.post<Token>(REST_URL + 'auth/signin', signInObj);
  }

  public autoSignIn(): void {
    const autoSingInObserver = this.getRestObserver<UserRest[]>({
      next: (users: UserRest[]) => {
        this.router.navigate(['main']);
        this.localStorageService.restUsers = users;
        this.localStorageService.updateCurrentUserId();
      }
    });

    this.getUsers().subscribe(autoSingInObserver);
  }

  public signIn(login: string, pass: string): void {
    const singInObserver = this.getRestObserver<Token>({
      next: (obj: Token) => {
        const currentUser: CurUser = {
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

  public signUp(name: string, login: string, pass: string): void {
    const singUpObj: NewUser = {
      name: name,
      login: login,
      password: pass,
    }

    const singUpObserver = this.getRestObserver<UserRest>({
      next: () => {
        this.signIn(login, pass);
      },
    });

    this.http
      .post<UserRest>(REST_URL + 'auth/signup', singUpObj)
      .subscribe(singUpObserver);
  }

  public getUser(userId: string): Observable<UserRest> {
    return  this.http.get<UserRest>(`${REST_URL}users/${userId}`, this.getHttpOptions());
  }

  public getUsers(): Observable<UserRest[]> {
    return  this.http.get<UserRest[]>(REST_URL + 'users', this.getHttpOptions());
  }

  public updateRestUsers(): void {
    const updateRestUsersObserver = this.getRestObserver<UserRest[]>({
      next: (users: UserRest[]) => {
        this.localStorageService.restUsers = users;
      }
    });

    this.getUsers()
      .subscribe(updateRestUsersObserver);
  }

  public createBoard(newBoard: NewBoard, templateName?: string): void {
    this.startProgress();

    const createBoardObserver = this.getRestObserver<RestBoard>({
      next: (boardObj: RestBoard) => {
        this.isNewBoard = true;
        this.localStorageService.restBoards.push(boardObj);
        this.localStorageService.updateBoardsStorage();
        this.router.navigateByUrl(`boards/${boardObj._id}`);

        if (templateName) {
          this.createColumnsFromTemplate(templateName, boardObj._id);
        }
        this.stopProgress();
      }
    });

    this.http
      .post<RestBoard>(REST_URL + 'boards', newBoard, this.getHttpOptions())
      .subscribe(createBoardObserver);
  }

  private createColumnsFromTemplate(templateName: string, boardId: string): void {
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

  public updateBoardsStorage(completeCallBack?: Function): void {
    let isBoardsTime: boolean = true;

    this.startProgress();

    const updateBoardsStorageObserver = this.getRestObserver<RestBoard[] | UserRest[]>({
      next: (objArr: RestBoard[] | UserRest[]) => {
        if (isBoardsTime) {
          this.localStorageService.restBoards = objArr as RestBoard[];
          isBoardsTime = false;
        } else {
          this.localStorageService.restUsers = objArr  as UserRest[];
        }
      },
      complete: () => {
        this.localStorageService.updateBoardsStorage();
        completeCallBack?.();
        this.stopProgress();
      }
    });

    concat(this.getBoards(), this.getUsers())
      .subscribe(updateBoardsStorageObserver);

  }

  public getBoard(boardId: string): Observable<RestBoard> {
    return  this.http.get<RestBoard>(REST_URL + 'boards/' + boardId, this.getHttpOptions());
  }

  public getBoards(): Observable<RestBoard[]> {
    return  this.http.get<RestBoard[]>(REST_URL + 'boards', this.getHttpOptions());
  }

  public deleteBoard(boardId: string): void {
    this.startProgress();

    const deleteBoardObserver = this.getRestObserver<RestBoard>({
      next: () => {
        this.localStorageService.deleteBoard(boardId);
        this.stopProgress();
      }
    });

    this.http
      .delete<RestBoard>(REST_URL + 'boards/' + boardId, this.getHttpOptions())
      .subscribe(deleteBoardObserver);
  }

  public getHttpOptions(): RestHeaders {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${this.localStorageService.currentUser.token}`
      })
    };
  }

  public deleteCurentUser(): void {
    this.startProgress();

    const deleteUserObserver = this.getRestObserver<UserRest>({
      next: () => {
        this.appControlService.logOut();
        this.stopProgress();
      },
    });

    const userId = this.localStorageService.currentUserId;

    if (userId) {
      this.http
        .delete<UserRest>(REST_URL + 'users/' + userId, this.getHttpOptions())
        .subscribe(deleteUserObserver);
    } else {
      this.errorHandlerService.handleError(new Error('Local Storage: "User does not exist!"'));
      this.stopProgress();
    }
  }

  public getBoardColumns(boardId: string): Observable<ColumnRest[]> {
    return  this.http
      .get<ColumnRest[]>(`${REST_URL}boards/${boardId}/columns/`, this.getHttpOptions());
  }

  public getColumnTasks(boardId: string, columnId: string): Observable<TaskRest[]> {
    return  this.http
      .get<TaskRest[]>(`${REST_URL}boards/${boardId}/columns/${columnId}/tasks`, this.getHttpOptions());
  }

  public createColumn(columnOption: NewColumnOption,): void {
    this.startProgress();

    const createColumnObserver = this.getRestObserver<ColumnRest>({
      next: (columnObj: ColumnRest) => {
        this.localStorageService.addColumn(columnObj, this.appControlService.checkChanges.bind(this.appControlService));
        this.stopProgress();
        this.appControlService.checkChanges();
      },
    });

    const boardId = columnOption.boardId;
    const newColumn: NewColumnRest = {
      title: columnOption.columnTitle,
      order: columnOption.columnOrder,
    }

    this.http
      .post<ColumnRest>(`${REST_URL}boards/${boardId}/columns/`, newColumn, this.getHttpOptions())
      .subscribe(createColumnObserver);
  }

  public deleteColumn<T extends ColumnRest>(deletedColumn: DeletedColumnOption, additionalHandler?: Function): void {
    this.startProgress();

    const deleteColumnObserver = this.getRestObserver<T>({
      next: (columnObj: T) => {
        this.localStorageService.deleteRestColumn(columnObj);
        this.updateColumnsOrder(true);
        this.stopProgress();
        additionalHandler?.();
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

  public updateColumnsOrder<T extends ColumnRest[]>(isDeletion: boolean = false): void {
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
      complete: () => {
        this.appControlService.checkChanges();
      }
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

  public createTask<T extends TaskRest>(boardId: string, columnId: string, newTaskObj: NewTask): void {
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

  public updateTaskSet<T extends TaskRest[]>(tasksSetsConfig: TaskSetRest[]): void {
    if (!tasksSetsConfig.length) {
      return;
    }

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

  public deleteTask<T extends TaskRest>(deletionOptions: TaskDeletionOptions): void {
    this.startProgress();

    const deletedTask = deletionOptions.deletedTask;
    const updatedTasks = deletionOptions.updatedTasks;
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

  public updateColumn(boardId: string, columnId: string, newColumn: NewColumnRest): Observable<ColumnRest> {
    return this.http
      .put<ColumnRest>(`${REST_URL}boards/${boardId}/columns/${columnId}`, newColumn, this.getHttpOptions());
  }

  public updateColumnTitle(boardId: string, columnId: string, newColumn: NewColumnRest): void {
    this.startProgress();

    const updateColumnObserver = this.getRestObserver<ColumnRest>({
      next: (column: ColumnRest) => {
        this.localStorageService.updateColumnTitle(column);
        this.stopProgress();
      },
    });

    this.updateColumn(boardId, columnId, newColumn)
      .subscribe(updateColumnObserver);
  }

  public updateTask<T extends TaskRest>(boardId: string, taskId: string, taskObj: EditableTask, additionalHandler?: Function): void {
    const updateTaskObserver = this.getRestObserver<T>({
      next: (task: T) => {
        this.localStorageService.updateBoardTasks([task]);
        additionalHandler?.();
      },
    });

    this.http
    .put<T>(`${REST_URL}boards/${boardId}/columns/${taskObj.columnId}/tasks/${taskId}`, taskObj, this.getHttpOptions())
    .subscribe(updateTaskObserver);
  }

  public updateUser<T extends UserRest>(updatedUser: NewUser, additionalHandler: Function): void {
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

  public search(rawRequest: string): Observable<TaskRest[]> {
    const searchRequest = this.getSearchRequest(rawRequest);

    return this.http
      .get<TaskRest[]>(`${REST_URL}tasksSet?search=${searchRequest}`, this.getHttpOptions());
  }

  private getSearchRequest(str: string): string {
    return str
      .trim()
      .split(' ')
      .filter((word) => !!word)
      .join('%20');
  }

  public getBoardUsers(boardId: string, completeCallBack: Function): void {
    if (!boardId) {
      return;
    }

    let boardObj: RestBoard;
    let users: UserRest[];
    const getBoardUsersObserver = this.getRestObserver<RestBoard | UserRest[]>({
      next: (result: RestBoard | UserRest[]) => {
        if (result.hasOwnProperty('length')) {
          users = result as UserRest[];
        } else {
          boardObj = result as RestBoard;
        }
      },
      complete: () => {
        if (completeCallBack) {
          const boardUsersId = [boardObj.owner, ...boardObj.users];
          const boardUsers = users.filter((user) => boardUsersId.includes(user._id));
          completeCallBack(boardUsers);
        }
      }
    });

    merge(this.getBoard(boardId), this.getUsers())
      .subscribe(getBoardUsersObserver);

  }

}
