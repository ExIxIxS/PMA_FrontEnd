import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { LocalStorageService } from './localStorage.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Injectable()
export class AppControlService {
  public isSmallScreen = this.breakpointObserver.isMatched('(max-width: 539px)');
  public boardTemplates = [
    {name: 'weekPlan', columns: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']},
    {name: 'kanban', columns: ['backlog', 'design', 'toDo', 'doing', 'codeReview', 'testing', 'done']},
    {name: 'projectManagment', columns: ['projectResources', 'questionsForMeeting', 'toDo', 'pending', 'blocked', 'done']},
    {name: 'designHuddle', columns: ['concept', 'notes', 'positives', 'negatives', 'questions', 'potentialBlockers']},
  ]

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

  refactorForOutput(str: string, lengthLimit = 20): string {
    return str
      .split(' ')
      .map((word) => this._limitSpacer(word, lengthLimit))
      .join(' ');
  }

  private _limitSpacer(str: string, lengthLimit: number): string {
    const spacedArr = [];
    let subStr = '';
    if (str.length > lengthLimit) {
      for (let i = 0, j = 0; i < str.length; i++) {
        subStr += str[i];
        j++;
        if (i+1 === str.length || j === lengthLimit) {
          spacedArr.push(subStr);
          subStr = '';
          j = 0;
        }
      }
      return spacedArr.join(' ');
    } else {
      return str;
    }
  }

}
