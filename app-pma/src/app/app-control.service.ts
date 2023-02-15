import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { LocalStorageService } from './localStorage.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Injectable()
export class AppControlService {
  public isSmallScreen = this.breakpointObserver.isMatched('(max-width: 539px)');

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private breakpointObserver: BreakpointObserver,
  ) {
    this._observeLayoutChanges(539);
  }

  logOut() {
    this.localStorageService.logOutUser();
    this.router.navigate(['']);
  }

  reloadPage() {
    this.router.navigate([this.router.url]);
  }

  refreshPage() {
    window.location.reload();
  }

  private _observeLayoutChanges(maxWidth: number) {
    const breakPoint = `(max-width: ${maxWidth}px)`;
    const layoutChangesObservable = this.breakpointObserver.observe([
      breakPoint,
    ]);

    layoutChangesObservable.subscribe(() => {
      this.isSmallScreen = this.breakpointObserver.isMatched(breakPoint);
    });
  }

  scrollToUp() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }


}
