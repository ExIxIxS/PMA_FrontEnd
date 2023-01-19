import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { RestDataService } from '../restAPI.service'
import { ConfirmationService } from '../confirmation.service';

@Component({
  selector: 'app-form-new-task',
  templateUrl: './form-new-task.component.html',
  styleUrls: ['./form-new-task.component.scss']
})
export class FormNewTaskComponent {
  hide = true;

  validOptions = {
    title: {name: 'task title', minLength: 2, maxLength: 30, pattern: 'a-zA-Z" "-'},
    description: {name: 'task description', minLength: 0, maxLength: 200, pattern: '0-9a-zA-Z_.'},
  }

  checkoutForm = this.formBuilder.group({
    title: ["",
      [
        Validators.required,
        Validators.minLength(this.validOptions.title.minLength),
        Validators.maxLength(this.validOptions.title.maxLength),
        Validators.pattern('[a-zA-Z_\.]*'),
      ]
    ],
    description: ["",
      [
        Validators.minLength(this.validOptions.description.minLength),
        Validators.maxLength(this.validOptions.description.maxLength),
        Validators.pattern('[a-zA-Z0-9_\.]*'),
      ]
    ],
  });

  constructor(
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private restAPI : RestDataService,
  ) {}

  getErrorMessage(optionName: string) {
    const controlOption = this.validOptions[optionName as keyof typeof this.validOptions];
    const controlOptionName = controlOption.name as keyof typeof this.checkoutForm.controls;
    const formControlErrors = this.checkoutForm.controls[optionName as keyof typeof this.checkoutForm.controls].errors;

    switch(true) {
      case (!!formControlErrors?.['required']):
        return `You must enter a task ${controlOptionName}`;
      case (!!formControlErrors?.['minlength']):
        return `Min length of ${controlOptionName} is ${controlOption.minLength} chars`;
      case (!!formControlErrors?.['maxlength']):
        return `Max length of ${controlOptionName} is ${controlOption.maxLength} chars`;
      case (!!formControlErrors?.['pattern']):
        return `Allowed symbols for ${controlOptionName} are "${controlOption.pattern}"`;
      default:
        return `Not a valid ${optionName}`;
    };

  };

  checkInput(): void {
    this.confirmationService.isConfirmValid = this.checkoutForm.valid;
    const title = this.checkoutForm.controls.title.value;

    if (this.checkoutForm.valid && title) {
      this.confirmationService.newTaskTitle = title;
      this.confirmationService.newTaskDescription = (this.checkoutForm.controls.description.value)
        ? this.checkoutForm.controls.description.value
        : 'without description';
    }
  }

}
