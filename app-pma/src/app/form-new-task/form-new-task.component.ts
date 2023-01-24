import { Component } from '@angular/core';

import { ConfirmationService } from '../confirmation.service';
import { LocalStorageService } from '../localStorage.service';
import { FormConrolTypes } from '../app.interfeces';
import { AppFormsService } from '../app-forms.service';

@Component({
  selector: 'app-form-new-task',
  templateUrl: './form-new-task.component.html',
  styleUrls: ['./form-new-task.component.scss']
})
export class FormNewTaskComponent {
  hide = true;

  checkoutForm = this.formService.getNewFormGroup('newTask');

  constructor(
    private confirmationService: ConfirmationService,
    private localStorageService: LocalStorageService,
    private formService: AppFormsService,
  ) {}

  get availableUsers() {
    return this.localStorageService.currentBoardUsers;
  }

  getErrorMessage(optionName: FormConrolTypes) {
    return this.formService.getErrorMessage(this.checkoutForm, optionName)
  };

  checkInput(): void {
    this.confirmationService.isConfirmValid = this.checkoutForm.valid;
    const title = this.checkoutForm.controls['taskTitle'].value;
    const executor = this.checkoutForm.controls['taskExecutor'].value;

    if (this.checkoutForm.valid && title && executor) {
      this.confirmationService.newTaskTitle = title;

      const taskDescription = this.checkoutForm.controls['taskDescription'].value;
      this.confirmationService.newTaskDescription = (taskDescription)
        ? taskDescription
        : 'without description';
      this.confirmationService.newTaskExecutor = executor;
    }
  }

}
