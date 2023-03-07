import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import { ConfirmationService } from 'src/app/services/confirmation.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { AppFormsService } from 'src/app/services/app-forms.service';
import { RestDataService } from 'src/app/services/restAPI.service';

import { FormConrolTypes, UserRest } from '../../app.interfeces';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-new-task',
  templateUrl: './form-new-task.component.html',
  styleUrls: ['./form-new-task.component.scss']
})
export class FormNewTaskComponent implements OnInit {
  public hide = true;
  public checkoutForm: FormGroup = this.getCheckoutForm();
  public availableUsers: UserRest[] = [];

  constructor(
    private confirmationService: ConfirmationService,
    private localStorageService: LocalStorageService,
    private formService: AppFormsService,
    private restRest: RestDataService,
  ) { }

  public ngOnInit(): void {
    this.disableSelect();
    this.getAvailableUsers();
  }

  public getAvailableUsers(): void {
    if (this.localStorageService.currentBoardUsers.length) {
      this.enableSelect();
      this.availableUsers = this.localStorageService.currentBoardUsers;
    } else {
      if (!this.availableUsers.length && this.confirmationService.editableTask?.boardId) {
        this.restRest.getBoardUsers(
          this.confirmationService.editableTask?.boardId,
          this.getUsersHandler.bind(this)
        );
      }
    }
  }

  private getUsersHandler(users: UserRest[]): void {
    this.availableUsers = users;
    this.checkoutForm.controls['taskExecutor']
      .setValue(users
        .find((user) => user._id === this.confirmationService.editableTask?.users[0])
        ?.name
      )
    this.enableSelect();
  }

  public enableSelect(): void {
    const formControl = this.checkoutForm.controls['taskExecutor'];
    if (formControl.disabled) {
      formControl.enable();
    }
  }

  public disableSelect(): void {
    const formControl = this.checkoutForm.controls['taskExecutor'];
    if (formControl.enabled) {
      formControl.disable();
    }
  }

  public getCheckoutForm(): FormGroup {
    const currentTask = this.confirmationService.editableTask;

    if (currentTask) {
      const executorName = this.localStorageService
        .getCurrentBoardUserById(currentTask.users[0])?.name;

      return this.formService
        .getNewFormGroup({type: 'taskForm', sourceTask: currentTask, executorName: executorName});
    }

    return this.formService.getNewFormGroup({type: 'taskForm'});
  }

  public getErrorMessage(optionName: FormConrolTypes): string {
    return this.formService.getErrorMessage(this.checkoutForm, optionName)
  }

  public checkInput(event?: MatSelectChange): void {
    if (event) {
      let executor: UserRest | undefined;
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
      const taskDescription = this.checkoutForm.controls['taskDescription'].value;

      this.confirmationService.newTaskTitle = title;
      this.confirmationService.newTaskDescription = (taskDescription)
        ? taskDescription
        : 'without description';
    }
  }

}
