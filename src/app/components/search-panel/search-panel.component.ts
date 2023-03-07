import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { AppFormsService } from 'src/app/services/app-forms.service';
import { RestDataService } from 'src/app/services/restAPI.service';
import { ErrorHandlerService } from 'src/app/services/errorHandler.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { AppControlService } from 'src/app/services/app-control.service';

import { FormConrolTypes, SearchTask, UserRest } from '../../app.interfeces';

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss']
})
export class SearchPanelComponent implements OnInit, OnDestroy {
  private lastSearchRequest: string | undefined;
  private subscribtions: Subscription[] = [];

  public foundTasks: SearchTask[] = [];
  public allUsers: UserRest[] = [];
  public isNoResult = false;
  public isSearchInProgress = false;
  public searchFormControl = this.formsService.getNewFormControl('searchRequest', '', true);

  constructor(
              private formsService: AppFormsService,
              private restRest: RestDataService,
              private errorHandlerService: ErrorHandlerService,
              private confirmationService: ConfirmationService,
              private appControlService: AppControlService
  ) { }

  public ngOnInit(): void {
    this.observeInputChanges();
  }

  public ngOnDestroy(): void {
    this.subscribtions.forEach((subscr) => subscr.unsubscribe());
  }

  @HostListener('body: click', ['$event']) onClick(e: Event) {
    if (e.target && this.searchFormControl.enabled) {
      let targetElement = e.target as HTMLElement;
      let isSearchedElement = false;

      while(targetElement.localName !== 'body') {
        if (targetElement.classList.contains('search-panel')) {
          isSearchedElement = true;
          break;
        }
        targetElement = targetElement.parentElement!;
      }

      if (!isSearchedElement) {
        this.disableInput();
      }
    }

  }

  public clearInput(input?: HTMLInputElement): void {
    this.searchFormControl.setValue('');
    if (input) {
      input.focus();
    }

  }

  private findUserNameById(userId: string): string {
    const targetUser = this.allUsers.find((user) => user._id === userId);
    if (targetUser) {
      return targetUser.name;
    }

    return 'user unknown';
  }

  public startSearch(value: string): void {
    if (value !== this.searchFormControl.value) {
      return;
    }

    this.isNoResult = false;
    this.isSearchInProgress = true;
    this.appControlService.checkChanges();
    const subscr = this.restRest.search(value)
      .subscribe(
        { next: (tasks) => {
          this.lastSearchRequest = value;
          this.foundTasks = [];
          tasks.map((task) => {
            const searchTask: SearchTask = {
              restTask: task,
              description: (task.description !== 'without description' ? task.description : ''),
              owner: this.findUserNameById(task.userId),
              executor: this.findUserNameById(task.users[0]),
            };

            this.foundTasks.push(searchTask);
          })
          },
          complete: () => {
            this.isSearchInProgress = false;

            if (!this.foundTasks.length) {
              this.isNoResult = true;
            }

            this.appControlService.checkChanges();
          }
        });

    this.subscribtions.push(subscr);

  }

  public enableInput(input: HTMLInputElement): void {
    const enableAndFocus = () => {
      this.searchFormControl.enable();
      input.focus();
    }

    const getUsersObserver = {
      next: (users: UserRest[]) => {
        this.allUsers = users;
        enableAndFocus();
       },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    };

    if (this.allUsers.length) {
      enableAndFocus();
    } else {
      const subscr = this.restRest.getUsers().subscribe(getUsersObserver);
      this.subscribtions.push(subscr);
    }
  }

  public disableInput(): void {
    this.clearInput();
    this.foundTasks = [];
    this.isNoResult = false;
    this.searchFormControl.disable();
  }

  public observeInputChanges(del = 1000): void {
    const changesObserver = {
      next: (value: string | null) => {
        if (value && this.searchFormControl.valid) {
          const subscr = of(value)
            .pipe(delay(del))
            .subscribe((result) => this.startSearch(result));

          this.subscribtions.push(subscr);
        }
      }
    }

    const subscr = this.searchFormControl.valueChanges
      .subscribe(changesObserver);

    this.subscribtions.push(subscr);
  }

  public getErrorMessage(type: FormConrolTypes): string {
    return this.formsService.getErrorMessage(this.searchFormControl, type);
  }

  public editTask(task: SearchTask): void {
    this.confirmationService.openDialog({
      type: 'editTask',
      editableTask: task.restTask,
    });
  }

  public repeatSearch(): void {
    if (this.lastSearchRequest) {
      this.startSearch(this.lastSearchRequest);
    }
  }

}
