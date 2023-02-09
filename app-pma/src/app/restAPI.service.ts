import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observer, concat, merge } from 'rxjs';

import { LocalStorageService } from './localStorage.service';
import { ErrorHandlerService } from './errorHandler.service';
import { AppControlService } from './app-control.service'

import { TokenObj, UserRestObj, NewBoardObj, RestBoardObj, ColumnRestObj, TaskRestObj,
        NewColumnOption, NewColumnRestObj, DeletedColumnOption, NewTaskObj, TaskSetRestObj,
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
        console.log('Users updated')
      }
    });

    this.getUsers()
      .subscribe(updateRestUsersObserver);
  }

  createBoard(newBoard: NewBoardObj) {
    const createBoardObserver = this.getRestObserver<RestBoardObj>({
      next: (boardObj: RestBoardObj) => {
        console.log('Board poasted');
        console.log(boardObj);
        this.updateBoardsStorage();
        this.router.navigateByUrl(`boards/${boardObj._id}`);
      }
    });

    this.http
      .post<RestBoardObj>(REST_URL + 'boards', newBoard, this.getHttpOptions())
      .subscribe(createBoardObserver);
  }

  updateBoardsStorage(completeCallBack?: Function) {
    let isBoardsTime = true;

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
    return  this.http.get<RestBoardObj>(REST_URL + 'boards/' + boardId, this.getHttpOptions());
  }

  getBoards() {
    return  this.http.get<RestBoardObj[]>(REST_URL + 'boards', this.getHttpOptions());
  }

  deleteBoard(boardId: string) {
    const deleteBoardObserver = this.getRestObserver<RestBoardObj>({
      next: () => {
        this.localStorageService.deleteBoard(boardId);
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
    const deleteUserObserver = this.getRestObserver<UserRestObj>({
      next: () => {
        console.log('User removed');
        this.appControlService.logOut();
      },
    });

    const userId = this.localStorageService.currentUserId;

    if (userId) {
      this.http
        .delete<UserRestObj>(REST_URL + 'users/' + userId, this.getHttpOptions())
        .subscribe(deleteUserObserver);
    } else {
      this.errorHandlerService.handleError(new Error('Local Storage: "User does not exist!"'))
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
    const createColumnObserver = this.getRestObserver<ColumnRestObj>({
      next: (columnObj: ColumnRestObj) => {
        console.log('Column created');
        console.log(columnObj);
        this.localStorageService.addColumn(columnObj);
      },
    });

    const boardId = columnOption.boardID;
    const newColumn: NewColumnRestObj = {
      title: columnOption.columnTitle,
      order: columnOption.columnOrder,
    }

    this.http
      .post<ColumnRestObj>(`${REST_URL}boards/${boardId}/columns/`, newColumn, this.getHttpOptions())
      .subscribe(createColumnObserver);
  }

  deleteColumn<T extends ColumnRestObj>(deletedColumn: DeletedColumnOption): void {
    const deleteColumnObserver = this.getRestObserver<T>({
      next: (columnObj: T) => {
        console.log('Column removed');
        this.localStorageService.deleteRestColumn(columnObj);
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

  updateColumnsOrder<T extends ColumnRestObj[]>(isDeletion: boolean = false) {
    const columnsSet = (isDeletion)
      ? this.localStorageService.getColumnRestSet()
      : this.localStorageService.getColumnAppSet();

    const updateOrderObserver = this.getRestObserver<T>({
      next: (columns: T) => {
        console.log('Column updating started')
        this.localStorageService.restColumns = columns;
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

  createTask<T extends TaskRestObj>(boardId: string, columnId: string, newTaskObj: NewTaskObj): void {
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

  updateTaskSet<T extends TaskRestObj[]>(tasksSetsConfig: TaskSetRestObj[]) {
    console.log('Rest Tasks before REST updating -->');
    console.log(JSON.parse(JSON.stringify(this.localStorageService.restTasks)));
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

  deleteTask<T extends TaskRestObj>(deletionOptions: TaskDeletionOptions): void {
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

  updateColumn(boardId: string, columnId: string, newColumn: NewColumnRestObj) {
    return this.http
      .put<ColumnRestObj>(`${REST_URL}boards/${boardId}/columns/${columnId}`, newColumn, this.getHttpOptions());
  }

  updateColumnTitle(boardId: string, columnId: string, newColumn: NewColumnRestObj) {
    console.log(newColumn);
    const updateColumnObserver = this.getRestObserver<ColumnRestObj>({
      next: (column: ColumnRestObj) => {
        console.log('Column updated');
        console.log(column);
        this.localStorageService.updateColumnTitle(column);
      },
    });

    this.updateColumn(boardId, columnId, newColumn)
      .subscribe(updateColumnObserver);
  }

  updateTask<T extends TaskRestObj>(boardId: string, taskId: string, taskObj: EditableTask, additionalHandler?: Function) {
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

  updateUser<T extends UserRestObj>(newUser: NewUserObj, additionalHandler: Function) {
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
          }
        }
      });

      merge(this.getBoard(boardId), this.getUsers())
        .subscribe(getBoardUsersObserver);
    }
  }

}
