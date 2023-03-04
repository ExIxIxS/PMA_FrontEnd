import { Injectable, ChangeDetectorRef } from '@angular/core';
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
  ];

  public colorThemes = [
    { className:'default', title: 'Indigo', isDark: false },
    { className:'dark-peace', title: 'Eclectic Peace', isDark: true },
    { className:'light-teal', title: 'Tea Party', isDark: false },
    { className:'dark-green', title: 'Fresh Apple', isDark: true },
    { className:'light-desert', title: 'Desert Morning', isDark: false },
    { className:'dark-pink', title: 'Night Pink', isDark: true },
  ];

  public typographies = [
    { className:'default', title: 'Roboto', },
    { className:'shantell-sans', title: 'Shantell Sans', },
    { className:'comfortaa', title: 'Comfortaa', },
  ];

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.observeLayoutChanges(539);
  }

  public get changeDetector(): ChangeDetectorRef | undefined {
    return this.localStorageService.changeDetector;
  }

  public set changeDetector(ref) {
    this.localStorageService.changeDetector = ref;
  }

  public checkChanges() {
    this.changeDetector?.markForCheck();
  }

  public logOut(): void {
    this.localStorageService.logOutUser();
    this.router.navigate(['']);
  }

  public navigateToRoot(): void {
    if (this.localStorageService.isUserLoggedIn) {
      this.router.navigate(['/main']);
    } else {
      this.router.navigate(['']);
    }
  }

  public reloadPage(): void {
    this.router.navigate([this.router.url]);
  }

  public refreshPage(): void {
    window.location.reload();
  }

  private observeLayoutChanges(maxWidth: number): void {
    const breakPoint = `(max-width: ${maxWidth}px)`;
    const layoutChangesObservable = this.breakpointObserver.observe([
      breakPoint,
    ]);

    layoutChangesObservable.subscribe(() => {
      this.isSmallScreen = this.breakpointObserver.isMatched(breakPoint);
      this.checkChanges();
    });
  }

  public scrollToUp(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

}
