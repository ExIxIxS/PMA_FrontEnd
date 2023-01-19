import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { concat } from 'rxjs';

import { LocalStorageService } from './localStorage.service';
import { ErrorHandlerService } from './errorHandler.service';
import { AppControlService } from './app-control.service'

import { TokenObj, UserObj, NewBoardObj, BoardObj, ColumnApiObj, TaskApiObj, PointApiObj, NewColumnOption, NewColumnApiObj, DeletedColumnOption, } from './app.interfeces';

const REST_URL = 'https://pmabackend-exixixs.up.railway.app/';

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
      next: (users: UserObj[]) => {
        this.router.navigate(['main']);
        this.localStorageService.currentUsers = users;
        this.localStorageService.updateCurrentUserId();
       },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    };

    this.getUsers().subscribe(autoSingInObserver);
  }

  signIn(login: string, pass: string): void {
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
    const singUpObj = {
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
      .post<UserObj>(REST_URL + 'auth/signup', singUpObj)
      .subscribe(singUpObserver);
  }

  getUsers() {
    return  this.http.get<UserObj[]>(REST_URL + 'users', this.getHttpOptions());
  }

  createBoard(newBoard: NewBoardObj) {
    const createBoardObserver = {
      next: (boardObj: BoardObj) => {
        console.log('Board poasted');
        console.log(boardObj);
        this.updateBoardsStorage();
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    this.http
      .post<BoardObj>(REST_URL + 'boards', newBoard, this.getHttpOptions())
      .subscribe(createBoardObserver);
  }

  updateBoardsStorage() {
    let isBoardsTime = true;
    const updateBoardsStorageObserver = {
      next: (objArr: BoardObj[] | UserObj[]) => {
        if (isBoardsTime) {
          this.localStorageService.currentBoards = objArr as BoardObj[];
          isBoardsTime = false;
        } else {
          this.localStorageService.currentUsers = objArr  as UserObj[];
        }

      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
      complete: () => {
        console.log('Boards and user storage updated');
        this.localStorageService.updateBoardsStorage()
      }
    }

    concat(this.getBoards(), this.getUsers())
      .subscribe(updateBoardsStorageObserver);

  }

  getBoards() {
    return  this.http.get<BoardObj[]>(REST_URL + 'boards', this.getHttpOptions());
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
      .delete<BoardObj>(REST_URL + 'boards/' + boardId, this.getHttpOptions())
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
        .delete<UserObj>(REST_URL + 'users/' + userId, this.getHttpOptions())
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

}
