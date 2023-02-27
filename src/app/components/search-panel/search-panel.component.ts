import { Component, HostListener } from '@angular/core';

import { FormConrolTypes, SearchTaskObj, UserRestObj } from '../../app.interfeces';

import { AppFormsService } from 'src/app/services/app-forms.service';
import { RestDataService } from 'src/app/services/restAPI.service';
import { ErrorHandlerService } from 'src/app/services/errorHandler.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { AppControlService } from 'src/app/services/app-control.service';


@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss']
})
export class SearchPanelComponent {
  private _lastSearchRequest: string | undefined;
  public foundTasks: SearchTaskObj[] = [];
  public allUsers: UserRestObj[] = [];
  public isNoResult: boolean = false;
  public isSearchInProgress: boolean = false;
  public searchFormControl = this.formsService.getNewFormControl('searchRequest', '', true);

  constructor(
              private formsService: AppFormsService,
              private restRest: RestDataService,
              private errorHandlerService: ErrorHandlerService,
              private confirmationService: ConfirmationService,
              private appControlService: AppControlService
  ) { }

  ngOnInit() {
    this.observeInputChanges();
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

  clearInput(input?: HTMLInputElement) {
    this.searchFormControl.setValue('');
    if (input) {
      input.focus();
    }

  }

  private _findUserNameById(userId: string) {
    const targetUser = this.allUsers.find((user) => user._id === userId);
    if (targetUser) {
      return targetUser.name;
    }

    return 'user unknown';
  }

  startSearch(value: string) {
    if (value === this.searchFormControl.value) {
      this.isNoResult = false;
      this.isSearchInProgress = true;
      this.restRest.search(value)
        .subscribe(
          { next: (tasks) => {
              this._lastSearchRequest = value;
              this.foundTasks = [];
              tasks.map((task) => {
                const searchTask: SearchTaskObj = {
                  restTask: task,
                  description: (task.description !== 'without description' ? task.description : ''),
                  owner: this._findUserNameById(task.userId),
                  executor: this._findUserNameById(task.users[0]),
                };
                this.foundTasks.push(searchTask);
              })
            },
            complete: () => {
              this.isSearchInProgress = false;

              if (!this.foundTasks.length) {
                this.isNoResult = true;
              }
            }
          });
    }

  }

  enableInput(input: HTMLInputElement) {
    const enableAndFocus = () => {
      this.searchFormControl.enable();
      input.focus();
    }

    const getUsersObserver = {
      next: (users: UserRestObj[]) => {
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
      this.restRest.getUsers().subscribe(getUsersObserver);
    }
  }

  disableInput() {
    this.clearInput();
    this.foundTasks = [];
    this.isNoResult = false;
    setTimeout(() => this.searchFormControl.disable(), 100);
  }

  observeInputChanges(delay: number = 1000) {
    const changesObserver = {
      next: (value: string | null) => {
        if (value && this.searchFormControl.valid) {
          setTimeout(this.startSearch.bind(this), delay, value);
        }
      }
    }

    this.searchFormControl.valueChanges
      .subscribe(changesObserver);
  }

  getErrorMessage(type: FormConrolTypes) {
    return this.formsService.getErrorMessage(this.searchFormControl, type);
  };

  editTask(task: SearchTaskObj) {
    this.confirmationService.openDialog({
      type: 'editTask',
      editableTask: task.restTask,
    });
  }

  repeatSearch() {
    if (this._lastSearchRequest) {
      this.startSearch(this._lastSearchRequest);
    }
  }

  refactorForOutput(str: string): string {
    return this.appControlService.refactorForOutput(str);
  }

}
