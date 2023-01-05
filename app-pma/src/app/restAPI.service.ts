import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

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
      next: () => {
        console.log('Board poasted');
        this.getBoards().subscribe((boards) => console.log(boards))
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    this.http
      .post<BoardObj>(REST_URL + 'boards', newBoard, this.getHttpOptions('createBoard'))
      .subscribe(createBoardObserver);
  }

  getBoards() {
    return  this.http.get<BoardObj[]>(REST_URL + 'boards', this.getHttpOptions('getBoards'));
  }

  getHttpOptions(type: string) {
    switch(type) {
      case 'getUsers':
      case 'createBoard':
      case 'getBoards':
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

}
