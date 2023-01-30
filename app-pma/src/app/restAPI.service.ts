import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { concat, merge } from 'rxjs';

import { LocalStorageService } from './localStorage.service';
import { ErrorHandlerService } from './errorHandler.service';
import { AppControlService } from './app-control.service'

import { TokenObj, UserApiObj, NewBoardObj, ApiBoardObj, ColumnApiObj, TaskApiObj,
        NewColumnOption, NewColumnApiObj, DeletedColumnOption, NewTaskObj, TaskSetApiObj, DeletedTask, TaskDeletionOptions, EditableTask, NewUserObj, } from './app.interfeces';

//  const REST_URL = 'https://pmabackend-exixixs.up.railway.app/';

const REST_URL = 'http://localhost:3000/';

@Injectable()
export class RestDataService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private localStorageService: LocalStorageService,
    private errorHandlerService: ErrorHandlerService,
    private appControlService: AppControlService,
  ) {}


  getToken(login: string, pass: string) {
    const singInObj = {
      login: login,
      password: pass,
    }

    return this.http.post<TokenObj>(REST_URL + 'auth/signin', singInObj);
  }

  autoSignIn() {
    const autoSingInObserver = {
      next: (users: UserApiObj[]) => {
        this.router.navigate(['main']);
        this.localStorageService.apiUsers = users;
        this.localStorageService.updateCurrentUserId();
       },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    };

    this.getUsers().subscribe(autoSingInObserver);
  }

  signIn(login: string, pass: string, ): void {
    const singInObserver = {
      next: (obj: TokenObj) => {
        const currentUser = {
          login,
          token: obj.token
        }
        this.localStorageService.currentUser = currentUser;
        this.autoSignIn();
       },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    this.getToken(login, pass)
      .subscribe(singInObserver);
  };

  signUp(name: string, login: string, pass: string): void {
    const singUpObj: NewUserObj = {
      name: name,
      login: login,
      password: pass,
    }

    const singUpObserver = {
      next: () => {
        this.signIn(login, pass);
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

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
    const updateApiUsersObserver = {
      next: (users: UserApiObj[]) => {
        this.localStorageService.apiUsers = users;
        console.log('Users updated')
       },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    };

    this.getUsers()
      .subscribe(updateApiUsersObserver);
  }

  createBoard(newBoard: NewBoardObj) {
    const createBoardObserver = {
      next: (boardObj: ApiBoardObj) => {
        console.log('Board poasted');
        console.log(boardObj);
        this.updateBoardsStorage();
        this.router.navigateByUrl(`boards/${boardObj._id}`);;
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    this.http
      .post<ApiBoardObj>(REST_URL + 'boards', newBoard, this.getHttpOptions())
      .subscribe(createBoardObserver);
  }

  updateBoardsStorage(completeCallBack?: Function) {
    let isBoardsTime = true;
    const updateBoardsStorageObserver = {
      next: (objArr: ApiBoardObj[] | UserApiObj[]) => {
        if (isBoardsTime) {
          this.localStorageService.apiBoards = objArr as ApiBoardObj[];
          isBoardsTime = false;
        } else {
          this.localStorageService.apiUsers = objArr  as UserApiObj[];
        }

      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
      complete: () => {
        console.log('Boards and user storage updated');
        this.localStorageService.updateBoardsStorage();
        if (completeCallBack) {
          completeCallBack();
        }
      }
    }

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
    const deleteBoardObserver = {
      next: () => {
        this.localStorageService.deleteBoard(boardId);
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    this.http
      .delete<ApiBoardObj>(REST_URL + 'boards/' + boardId, this.getHttpOptions())
      .subscribe(deleteBoardObserver);
  }

  getHttpOptions(type: string = 'default') {
    switch(type) {
      case 'nonDefault':
        return;
      default:
        return {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: `Bearer ${this.localStorageService.currentUser.token}`
          })
        };;
    }
  }

  deleteCurentUser(): void {
    const deleteUserObserver = {
      next: () => {
        console.log('User removed');
        this.appControlService.logOut();
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

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
    const createColumnObserver = {
      next: (columnObj: ColumnApiObj) => {
        console.log('Column created');
        console.log(columnObj);
        this.localStorageService.addColumn(columnObj);
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    const boardId = columnOption.boardID;
    const newColumn: NewColumnApiObj = {
      title: columnOption.columnTitle,
      order: columnOption.columnOrder,
    }

    this.http
      .post<ColumnApiObj>(`${REST_URL}boards/${boardId}/columns/`, newColumn, this.getHttpOptions())
      .subscribe(createColumnObserver);
  }

  deleteColumn(deletedColumn: DeletedColumnOption): void {
    const deleteColumnObserver = {
      next: (columnObj: ColumnApiObj) => {
        console.log('Column removed');
        this.localStorageService.deleteApiColumn(columnObj);
        this.updateColumnsOrder(true);
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    if (deletedColumn) {
      this.http
        .delete<ColumnApiObj>(`${REST_URL}boards/${deletedColumn.boardId}/columns/${deletedColumn.columnId}`, this.getHttpOptions())
        .subscribe(deleteColumnObserver);
    } else {
      this.errorHandlerService.handleError(new Error('Application: "Deletion initial values error"'))
    }
  }

  updateColumnsOrder(isDeletion: boolean = false) {
    const columnsSet = (isDeletion)
      ? this.localStorageService.getColumnApiSet()
      : this.localStorageService.getColumnAppSet();

    const updateOrderObserver = {
      next: (columns: ColumnApiObj[]) => {
        console.log('Column updating started')
        this.localStorageService.apiColumns = columns;
        this.localStorageService.updateBoardAppColumns();
        if (isDeletion) {
          this.localStorageService.updateBoardAppColumns();
        }
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err);
        //  this.appControlService.refreshPage();
      },
    }

    this.http
      .patch<ColumnApiObj[]>(`${REST_URL}columnsSet`, columnsSet, this.getHttpOptions())
      .subscribe(updateOrderObserver);
  }

  createTask(boardId: string, columnId: string, newTaskObj: NewTaskObj): void {
     const createTaskObserver = {
      next: (taskObj: TaskApiObj) => {
        console.log('Task created');
        console.log(taskObj);
        this.localStorageService.addTask(columnId, taskObj);
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    console.log(newTaskObj);

    this.http
    .post<TaskApiObj>(`${REST_URL}boards/${boardId}/columns/${columnId}/tasks`, newTaskObj, this.getHttpOptions())
    .subscribe(createTaskObserver);
  }

  updateTaskSet(tasksSetsConfig: TaskSetApiObj[]) {
    this.localStorageService.isTaskDropDisabled = true;

    console.log('TaskDrop Disabled');
    console.log('Api Tasks before REST updating -->');
    console.log(JSON.parse(JSON.stringify(this.localStorageService.apiTasks)));
    console.log('Update tasksets -->');
    console.log(tasksSetsConfig);

    if (tasksSetsConfig.length) {
      const updateOrderObserver = {
        next: (tasks: TaskApiObj[]) => {
          console.log(`Tasks updated`);
          console.log(tasks);

          if (tasks.length) {
            this.localStorageService.updateBoardTasks(tasks);
          }
          this.localStorageService.isTaskDropDisabled = false;
            console.log('TaskDrop Enabled');

        },
        error: (err: Error) => {
          this.errorHandlerService.handleError(err);
          //  this.appControlService.refreshPage();
        },
      }

      this.http
        .patch<TaskApiObj[]>(`${REST_URL}tasksSet`, tasksSetsConfig, this.getHttpOptions())
        .subscribe(updateOrderObserver);

      }

  }

  deleteTask(deletionOptions: TaskDeletionOptions): void {
    const deletedTask = deletionOptions.deletedTask;
    const updatedTasks = deletionOptions.updatedTasks;

    const deleteTaskObserver = {
      next: (taskObj: TaskApiObj) => {
        console.log('Task removed');
        this.localStorageService.deleteTask(taskObj);
        if (updatedTasks) {
          this.updateTaskSet(updatedTasks);
        }
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    if (deletedTask) {
      this.http
        .delete<TaskApiObj>(`${REST_URL}boards/${deletedTask.boardId}/columns/${deletedTask.columnId}/tasks/${deletedTask.taskId}`, this.getHttpOptions())
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
    const updateColumnObserver = {
      next: (column: ColumnApiObj) => {
        console.log('Column updated');
        console.log(column);
        this.localStorageService.updateColumnTitle(column);
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    this.updateColumn(boardId, columnId, newColumn)
      .subscribe(updateColumnObserver);
  }

  updateTask(boardId: string, taskId: string, taskObj: EditableTask) {
    const updateTaskObserver = {
      next: (task: TaskApiObj) => {
        console.log('Task updated');
        console.log(task);
        this.localStorageService.updateBoardTasks([task]);
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    this.http
    .put<TaskApiObj>(`${REST_URL}boards/${boardId}/columns/${taskObj.columnId}/tasks/${taskId}`, taskObj, this.getHttpOptions())
    .subscribe(updateTaskObserver);
  }

  updateUser(newUser: NewUserObj, additionalHandler: Function) {
    const userId = this.localStorageService.currentUserId;

    const updateUserObserver = {
      next: (user: UserApiObj) => {
        console.log('User updated');
        console.log(user);
        additionalHandler(user.name, user.login);
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    this.http
    .put<UserApiObj>(`${REST_URL}users/${userId}`, newUser, this.getHttpOptions())
    .subscribe(updateUserObserver);
  }

}
