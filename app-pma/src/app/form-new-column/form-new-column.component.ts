import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ConfirmationService } from '../confirmation.service';

@Component({
  selector: 'app-form-new-column',
  templateUrl: './form-new-column.component.html',
  styleUrls: ['./form-new-column.component.scss']
})
export class FormNewColumnComponent {
  hide = true;

  validOptions = {
    name: 'columnTitle',
    minLength: 2,
    maxLength: 30,
    pattern: 'a-zA-Z" "-',
  }

  checkoutForm = this.formBuilder.group({
    columnTitle: ["",
      [
        Validators.required,
        Validators.minLength(this.validOptions.minLength),
        Validators.maxLength(this.validOptions.maxLength),
        Validators.pattern('[a-zA-Z_\. ]*'),
      ]
    ],
  });

  constructor(
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
  ) {}

  getErrorMessage(optionName: string): string {
    const controlOption = this.validOptions;
    const controlOptionName = this.validOptions.name as keyof typeof this.checkoutForm.controls;
    const formControlErrors = this.checkoutForm.controls[controlOptionName].errors;

    switch(true) {
      case (!!formControlErrors?.['required']):
        return `You must enter a ${optionName} Title`;
      case (!!formControlErrors?.['minlength']):
        return `Min length of ${optionName} is ${controlOption.minLength} chars`;
      case (!!formControlErrors?.['maxlength']):
        return `Max length of ${optionName} is ${controlOption.maxLength} chars`;
      case (!!formControlErrors?.['pattern']):
        return `Allowed symbols for ${optionName} are "${controlOption.pattern}"`;
      default:
        return `Not a valid ${optionName}`;
    };
  }

  checkInput(): void {
    this.confirmationService.isConfirmValid = this.checkoutForm.valid;
    this.updateNewColumnTitle();
  }

  updateNewColumnTitle(): void {
    const inputValue = this.checkoutForm.controls.columnTitle.value;

    if (this.checkoutForm.valid && inputValue) {
      this.confirmationService.newColumnTitle = inputValue;
    }
  }

}
