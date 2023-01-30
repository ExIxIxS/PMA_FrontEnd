import { Component } from '@angular/core';

import { ConfirmationService } from '../confirmation.service';
import { LocalStorageService } from '../localStorage.service';
import { FormConrolTypes, UserApiObj } from '../app.interfeces';
import { AppFormsService } from '../app-forms.service';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-form-new-task',
  templateUrl: './form-new-task.component.html',
  styleUrls: ['./form-new-task.component.scss']
})
export class FormNewTaskComponent {
  hide = true;
  checkoutForm = this.getCheckoutForm();

  constructor(
    private confirmationService: ConfirmationService,
    private localStorageService: LocalStorageService,
    private formService: AppFormsService,
  ) {}

  get availableUsers() {
    return this.localStorageService.currentBoardUsers;
  }

  getCheckoutForm() {
    const currentTask = this.confirmationService.editableTask;

    if (currentTask) {
      const executorName = this.localStorageService.getCurrentBoardUserById(currentTask.users[0])?.name
      return this.formService.getNewFormGroup({type: 'taskForm', sourceTask: currentTask, executorName: executorName});
    }
    return this.formService.getNewFormGroup({type: 'taskForm'});
  }

  getErrorMessage(optionName: FormConrolTypes) {
    return this.formService.getErrorMessage(this.checkoutForm, optionName)
  };

  checkInput(event?: MatSelectChange): void {
    let executor: UserApiObj | undefined;

    if (event) {
      const indexArr = Object.entries(event.source._keyManager).find((propArr) => propArr[0] === '_activeItemIndex');
      if (indexArr) {
        const valueIndex = indexArr[1];
        executor = this.availableUsers[valueIndex]
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

      if (executor) {
        this.confirmationService.newTaskExecutor = executor;
      }
    }
  }

}
