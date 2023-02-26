import { Component } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import { FormConrolTypes, UserRestObj } from '../../app.interfeces';

import { ConfirmationService } from 'src/app/services/confirmation.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { AppFormsService } from 'src/app/services/app-forms.service';
import { RestDataService } from 'src/app/services/restAPI.service';

@Component({
  selector: 'app-form-new-task',
  templateUrl: './form-new-task.component.html',
  styleUrls: ['./form-new-task.component.scss']
})
export class FormNewTaskComponent {
  hide = true;
  checkoutForm = this.getCheckoutForm();
  _availableUsers: UserRestObj[] = [];

  constructor(
    private confirmationService: ConfirmationService,
    private localStorageService: LocalStorageService,
    private formService: AppFormsService,
    private restRest: RestDataService,
  ) { }

  ngOnInit() {
    this.disableSelect();
  }

  get availableUsers() {
    if (this.localStorageService.currentBoardUsers.length) {
      this.enableSelect();
      return this.localStorageService.currentBoardUsers;
    } else {
      if (!this._availableUsers.length && this.confirmationService.editableTask?.boardId) {
        this.restRest.getBoardUsers(
          this.confirmationService.editableTask?.boardId,
          this._getUsersHandler.bind(this)
        );
      }

      return this._availableUsers;
    }
  }

  private _getUsersHandler = (users: UserRestObj[]) => {
    this._availableUsers = users;
    this.checkoutForm.controls['taskExecutor']
      .setValue(users
        .find((user) => user._id === this.confirmationService.editableTask?.users[0])
        ?.name
      )
    this.enableSelect();
  }

  enableSelect() {
    const formControl = this.checkoutForm.controls['taskExecutor'];
    if (formControl.disabled) {
      formControl.enable();
    }
  }

  disableSelect() {
    const formControl = this.checkoutForm.controls['taskExecutor'];
    if (formControl.enabled) {
      formControl.disable();
    }
  }

  getCheckoutForm() {
    const currentTask = this.confirmationService.editableTask;

    if (currentTask) {
      const executorName = this.localStorageService
        .getCurrentBoardUserById(currentTask.users[0])?.name;

      return this.formService
        .getNewFormGroup({type: 'taskForm', sourceTask: currentTask, executorName: executorName});
    }
    return this.formService.getNewFormGroup({type: 'taskForm'});
  }

  getErrorMessage(optionName: FormConrolTypes) {
    return this.formService.getErrorMessage(this.checkoutForm, optionName)
  };

  checkInput(event?: MatSelectChange): void {
    if (event) {
      let executor: UserRestObj | undefined;
      const indexArr = Object.entries(event.source._keyManager).find((propArr) => propArr[0] === '_activeItemIndex');
      if (indexArr) {
        const valueIndex = indexArr[1];
        executor = this.availableUsers[valueIndex]
      }

      if (executor) {
        this.confirmationService.newTaskExecutor = executor;
      }
    }

    this.confirmationService.isConfirmValid = this.checkoutForm.valid;
    const title = this.checkoutForm.controls['taskTitle'].value;

    if (this.checkoutForm.valid && title) {
      this.confirmationService.newTaskTitle = title;

      const taskDescription = this.checkoutForm.controls['taskDescription'].value;
      this.confirmationService.newTaskDescription = (taskDescription)
        ? taskDescription
        : 'without description';
    }
  }

}
