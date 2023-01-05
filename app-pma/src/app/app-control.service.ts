import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { LocalStorageService } from './localStorage.service';

@Injectable()
export class AppControlService {


  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
  ) { }

  logOut() {
    this.localStorageService.logOutUser();
    this.router.navigate(['']);
  }

}
