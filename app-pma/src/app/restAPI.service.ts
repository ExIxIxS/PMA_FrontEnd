import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { concat } from 'rxjs';

import { LocalStorageService } from './localStorage.service';
import { ErrorHandlerService } from './errorHandler.service';

import { TokenObj, UserObj, NewBoardObj, BoardObj } from './app.interfeces';

const REST_URL = 'https://pmabackend-exixixs.up.railway.app/';

@Injectable()
export class RestDataService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private localStorageService: LocalStorageService,
    private errorHandlerService: ErrorHandlerService,
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
      next: () => {
        this.router.navigate(['main']);
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
    return  this.http.get<UserObj[]>(REST_URL + 'users', this.getHttpOptions('getUsers'));
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
      .post<BoardObj>(REST_URL + 'boards', newBoard, this.getHttpOptions('createBoard'))
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
    return  this.http.get<BoardObj[]>(REST_URL + 'boards', this.getHttpOptions('getBoards'));
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
      .delete<BoardObj>(REST_URL + 'boards/' + boardId, this.getHttpOptions('deleteBoards'))
      .subscribe(deleteBoardObserver);
  }

  getHttpOptions(type: string) {
    switch(type) {
      case 'getUsers':
      case 'createBoard':
      case 'getBoards':
      case 'deleteBoards':
        return {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: `Bearer ${this.localStorageService.currentUser.token}`
          })
        };
      default: return;
    }
  }

  deleteUser(userId: string): void {
    const deleteUserObserver = {
      next: () => {
        console.log('User removed');
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    this.http
      .delete<UserObj>(REST_URL + 'users/' + userId, this.getHttpOptions('deleteUser'))
      .subscribe(deleteUserObserver);
  }

}
