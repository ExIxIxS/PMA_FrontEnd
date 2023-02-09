import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observer, concat, merge } from 'rxjs';

import { LocalStorageService } from './localStorage.service';
import { ErrorHandlerService } from './errorHandler.service';
import { AppControlService } from './app-control.service'

import { TokenObj, UserApiObj, NewBoardObj, ApiBoardObj, ColumnApiObj, TaskApiObj,
        NewColumnOption, NewColumnApiObj, DeletedColumnOption, NewTaskObj, TaskSetApiObj,
        TaskDeletionOptions, EditableTask, NewUserObj,
      } from './app.interfeces';

//  const REST_URL = 'https://pmabackend-exixixs.up.railway.app/';

const REST_URL = 'http://localhost:3000/';

interface ObserverTemplate {
  next?: (value: any) => void,
  error?: (error: Error) => void,
  complete?: () => void,
}

@Injectable()
export class RestDataService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private localStorageService: LocalStorageService,
    private errorHandlerService: ErrorHandlerService,
    private appControlService: AppControlService,
  ) {}

  getRestObserver<T>(options: ObserverTemplate = {}): Observer<T> {
    return {
      next: (options.next)
        ? options.next
        : (value: T) => {},
      error: (options.error)
        ? options.error
        : (err: Error) => {
        this.errorHandlerService.handleError(err)
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
    const autoSingInObserver = this.getRestObserver<UserApiObj[]>({
      next: (users: UserApiObj[]) => {
        this.router.navigate(['main']);
        this.localStorageService.apiUsers = users;
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

    const singUpObserver = this.getRestObserver<UserApiObj>({
      next: () => {
        this.signIn(login, pass);
      },
    });

    this.http
      .post<UserApiObj>(REST_URL + 'auth/signup', singUpObj)
      .subscribe(singUpObserver);
  }

  getUser(userId: string) {
    return  this.http.get<UserApiObj>(`${REST_URL}users/${userId}`, this.getHttpOptions());
  }

  getUsers() {
    return  this.http.get<UserApiObj[]>(REST_URL + 'users', this.getHttpOptions());
  }

  updateApiUsers() {
    const updateApiUsersObserver = this.getRestObserver<UserApiObj[]>({
      next: (users: UserApiObj[]) => {
        this.localStorageService.apiUsers = users;
        console.log('Users updated')
      }
    });

    this.getUsers()
      .subscribe(updateApiUsersObserver);
  }

  createBoard(newBoard: NewBoardObj) {
    const createBoardObserver = this.getRestObserver<ApiBoardObj>({
      next: (boardObj: ApiBoardObj) => {
        console.log('Board poasted');
        console.log(boardObj);
        this.updateBoardsStorage();
        this.router.navigateByUrl(`boards/${boardObj._id}`);
      }
    });

    this.http
      .post<ApiBoardObj>(REST_URL + 'boards', newBoard, this.getHttpOptions())
      .subscribe(createBoardObserver);
  }

  updateBoardsStorage(completeCallBack?: Function) {
    let isBoardsTime = true;

    const updateBoardsStorageObserver = this.getRestObserver<ApiBoardObj[] | UserApiObj[]>({
      next: (objArr: ApiBoardObj[] | UserApiObj[]) => {
        if (isBoardsTime) {
          this.localStorageService.apiBoards = objArr as ApiBoardObj[];
          isBoardsTime = false;
        } else {
          this.localStorageService.apiUsers = objArr  as UserApiObj[];
        }
      },
      complete: () => {
        console.log('Boards and user storage updated');
        this.localStorageService.updateBoardsStorage();
        if (completeCallBack) {
          completeCallBack();
        }
      }
    });

    concat(this.getBoards(), this.getUsers())
      .subscribe(updateBoardsStorageObserver);

  }

  getBoard(boardId: string) {
    return  this.http.get<ApiBoardObj>(REST_URL + 'boards/' + boardId, this.getHttpOptions());
  }

  getBoards() {
    return  this.http.get<ApiBoardObj[]>(REST_URL + 'boards', this.getHttpOptions());
  }

  deleteBoard(boardId: string) {
    const deleteBoardObserver = this.getRestObserver<ApiBoardObj>({
      next: () => {
        this.localStorageService.deleteBoard(boardId);
      }
    });

    this.http
      .delete<ApiBoardObj>(REST_URL + 'boards/' + boardId, this.getHttpOptions())
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
    const deleteUserObserver = this.getRestObserver<UserApiObj>({
      next: () => {
        console.log('User removed');
        this.appControlService.logOut();
      },
    });

    const userId = this.localStorageService.currentUserId;

    if (userId) {
      this.http
        .delete<UserApiObj>(REST_URL + 'users/' + userId, this.getHttpOptions())
        .subscribe(deleteUserObserver);
    } else {
      this.errorHandlerService.handleError(new Error('Local Storage: "User does not exist!"'))
    }
  }

  getBoardColumns(boardId: string) {
    return  this.http
      .get<ColumnApiObj[]>(`${REST_URL}boards/${boardId}/columns/`, this.getHttpOptions());
  }

  getColumnTasks(boardId: string, columnId: string) {
    return  this.http
      .get<TaskApiObj[]>(`${REST_URL}boards/${boardId}/columns/${columnId}/tasks`, this.getHttpOptions());
  }

  createColumn(columnOption: NewColumnOption): void {
    const createColumnObserver = this.getRestObserver<ColumnApiObj>({
      next: (columnObj: ColumnApiObj) => {
        console.log('Column created');
        console.log(columnObj);
        this.localStorageService.addColumn(columnObj);
      },
    });

    const boardId = columnOption.boardID;
    const newColumn: NewColumnApiObj = {
      title: columnOption.columnTitle,
      order: columnOption.columnOrder,
    }

    this.http
      .post<ColumnApiObj>(`${REST_URL}boards/${boardId}/columns/`, newColumn, this.getHttpOptions())
      .subscribe(createColumnObserver);
  }

  deleteColumn<T extends ColumnApiObj>(deletedColumn: DeletedColumnOption): void {
    const deleteColumnObserver = this.getRestObserver<T>({
      next: (columnObj: T) => {
        console.log('Column removed');
        this.localStorageService.deleteApiColumn(columnObj);
        this.updateColumnsOrder(true);
      },
    });

    if (deletedColumn) {
      this.http
        .delete<T>(`${REST_URL}boards/${deletedColumn.boardId}/columns/${deletedColumn.columnId}`, this.getHttpOptions())
        .subscribe(deleteColumnObserver);
    } else {
      this.errorHandlerService.handleError(new Error('Application: "Deletion initial values error"'))
    }
  }

  updateColumnsOrder<T extends ColumnApiObj[]>(isDeletion: boolean = false) {
    const columnsSet = (isDeletion)
      ? this.localStorageService.getColumnApiSet()
      : this.localStorageService.getColumnAppSet();

    const updateOrderObserver = this.getRestObserver<T>({
      next: (columns: T) => {
        console.log('Column updating started')
        this.localStorageService.apiColumns = columns;
        this.localStorageService.updateBoardAppColumns();
      },
      error: (err: Error) => {
        this.appControlService.reloadPage();
        this.errorHandlerService.handleError(err);
      },
    });

    if (columnsSet.length) {
      this.http
        .patch<T>(`${REST_URL}columnsSet`, columnsSet, this.getHttpOptions())
        .subscribe(updateOrderObserver);
    } else {
      this.localStorageService.updateBoardAppColumns();
    }

  }

  createTask<T extends TaskApiObj>(boardId: string, columnId: string, newTaskObj: NewTaskObj): void {
     const createTaskObserver = this.getRestObserver<T>({
      next: (taskObj: T) => {
        console.log('Task created');
        console.log(taskObj);
        this.localStorageService.addTask(columnId, taskObj);
      },
    });

    console.log(newTaskObj);

    this.http
    .post<T>(`${REST_URL}boards/${boardId}/columns/${columnId}/tasks`, newTaskObj, this.getHttpOptions())
    .subscribe(createTaskObserver);
  }

  updateTaskSet<T extends TaskApiObj[]>(tasksSetsConfig: TaskSetApiObj[]) {
    console.log('Api Tasks before REST updating -->');
    console.log(JSON.parse(JSON.stringify(this.localStorageService.apiTasks)));
    console.log('Update tasksets -->');
    console.log(tasksSetsConfig);

    if (tasksSetsConfig.length) {
      this.localStorageService.isTaskDropDisabled = true;
      console.log('TaskDrop Disabled');

      const updateOrderObserver = this.getRestObserver<T>({
        next: (tasks: T) => {
          console.log(`Tasks updated`);
          console.log(tasks);

          if (tasks.length) {
            this.localStorageService.updateBoardTasks(tasks);
          }
          this.localStorageService.isTaskDropDisabled = false;
            console.log('TaskDrop Enabled');
        },
      });

      this.http
        .patch<T>(`${REST_URL}tasksSet`, tasksSetsConfig, this.getHttpOptions())
        .subscribe(updateOrderObserver);

    }

  }

  deleteTask<T extends TaskApiObj>(deletionOptions: TaskDeletionOptions): void {
    const deletedTask = deletionOptions.deletedTask;
    const updatedTasks = deletionOptions.updatedTasks;

    const deleteTaskObserver = this.getRestObserver<T>({
      next: (taskObj: T) => {
        console.log('Task removed');
        this.localStorageService.deleteTask(taskObj);
        if (updatedTasks) {
          this.updateTaskSet(updatedTasks);
        }
      },
    });

    if (deletedTask) {
      this.http
        .delete<T>(`${REST_URL}boards/${deletedTask.boardId}/columns/${deletedTask.columnId}/tasks/${deletedTask.taskId}`, this.getHttpOptions())
        .subscribe(deleteTaskObserver);
    } else {
      this.errorHandlerService.handleError(new Error('Application: "Deletion initial values error"'))
    }
  }

  updateColumn(boardId: string, columnId: string, newColumn: NewColumnApiObj) {
    return this.http
      .put<ColumnApiObj>(`${REST_URL}boards/${boardId}/columns/${columnId}`, newColumn, this.getHttpOptions());
  }

  updateColumnTitle(boardId: string, columnId: string, newColumn: NewColumnApiObj) {
    console.log(newColumn);
    const updateColumnObserver = this.getRestObserver<ColumnApiObj>({
      next: (column: ColumnApiObj) => {
        console.log('Column updated');
        console.log(column);
        this.localStorageService.updateColumnTitle(column);
      },
    });

    this.updateColumn(boardId, columnId, newColumn)
      .subscribe(updateColumnObserver);
  }

  updateTask<T extends TaskApiObj>(boardId: string, taskId: string, taskObj: EditableTask, additionalHandler?: Function) {
    const updateTaskObserver = this.getRestObserver<T>({
      next: (task: T) => {
        console.log('Task updated');
        console.log(task);
        this.localStorageService.updateBoardTasks([task]);
        if (additionalHandler) {
          additionalHandler();
        }
      },
    });

    this.http
    .put<T>(`${REST_URL}boards/${boardId}/columns/${taskObj.columnId}/tasks/${taskId}`, taskObj, this.getHttpOptions())
    .subscribe(updateTaskObserver);
  }

  updateUser<T extends UserApiObj>(newUser: NewUserObj, additionalHandler: Function) {
    const userId = this.localStorageService.currentUserId;

    const updateUserObserver = this.getRestObserver<T>({
      next: (user: T) => {
        console.log('User updated');
        console.log(user);
        additionalHandler(user.name, user.login);
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    });

    this.http
    .put<T>(`${REST_URL}users/${userId}`, newUser, this.getHttpOptions())
    .subscribe(updateUserObserver);
  }

  search(rawRequest: string) {
    const searchRequest = this._getSearchRequest(rawRequest);

    return this.http
      .get<TaskApiObj[]>(`${REST_URL}tasksSet?search=${searchRequest}`, this.getHttpOptions());
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
      let boardObj: ApiBoardObj;
      let users: UserApiObj[];

      const getBoardUsersObserver = this.getRestObserver<ApiBoardObj | UserApiObj[]>({
        next: (result: ApiBoardObj | UserApiObj[]) => {
          if (result.hasOwnProperty('length')) {
            users = result as UserApiObj[];
          } else {
            boardObj = result as ApiBoardObj;
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

}
