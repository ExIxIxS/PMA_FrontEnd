import { Component } from '@angular/core';
import { AppFormsService } from '../app-forms.service';
import { RestDataService } from '../restAPI.service';
import { ErrorHandlerService } from '../errorHandler.service';
import { ConfirmationService } from '../confirmation.service';

import { FormConrolTypes, SearchTaskObj, UserApiObj } from '../app.interfeces';


@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss']
})
export class SearchPanelComponent {
  foundTasks: SearchTaskObj[] = [];
  allUsers: UserApiObj[] = [];
  private _lastSearchRequest: string | undefined;

  searchFormControl = this.formsService.getNewFormControl('searchRequest', '', true)

  constructor(private formsService: AppFormsService,
              private restApi: RestDataService,
              private errorHandlerService: ErrorHandlerService,
              private confirmationService: ConfirmationService,
              ) {
    this.observeInputChanges();
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
      console.log(`start search for ${value}`);
      this.restApi.search(value)
        .subscribe(
          { next: (tasks) => {
              this._lastSearchRequest = value;
              this.foundTasks = [];
              tasks.map((task) => {
                const searchTask: SearchTaskObj = {
                  apiTask: task,
                  description: (task.description !== 'without description' ? task.description : ''),
                  owner: this._findUserNameById(task.userId),
                  executor: this._findUserNameById(task.users[0]),
                };
                this.foundTasks.push(searchTask);
              })
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
      next: (users: UserApiObj[]) => {
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
      this.restApi.getUsers().subscribe(getUsersObserver);
    }
  }

  disableInput() {
    this.clearInput();
    this.foundTasks = [];
    this.searchFormControl.disable();
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

  openBoard(boardId: string) {
    console.log(`open board with ID: ${boardId}`)
  }

  editTask(task: SearchTaskObj) {
    this.confirmationService.openDialog({
      type: 'editTask',
      editableTask: task.apiTask,
      additionalHandler: this.repeatSearch.bind(this)
    });
  }

  repeatSearch() {
    if (this._lastSearchRequest) {
      this.startSearch(this._lastSearchRequest);
    }
  }
}
