import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ConfirmationService } from '../confirmation.service';
import { AppFormsService } from '../app-forms.service';

@Component({
  selector: 'app-form-new-column',
  templateUrl: './form-new-column.component.html',
  styleUrls: ['./form-new-column.component.scss']
})
export class FormNewColumnComponent {
  hide = true;

  titleFormControl = this.formService.getNewFormControl('columnTitle');
  checkoutForm = new FormGroup({columnTitle: this.titleFormControl})

  constructor(
    private confirmationService: ConfirmationService,
    private formService: AppFormsService,
  ) {}

  getErrorMessage(): string {
    return this.formService.getErrorMessage(this.checkoutForm, 'columnTitle');
  }

  checkInput(): void {
    this.confirmationService.isConfirmValid = this.checkoutForm.valid;
    this.updateNewColumnTitle();
  }

  updateNewColumnTitle(): void {
    const inputValue = this.titleFormControl.value;

    if (this.checkoutForm.valid && inputValue) {
      this.confirmationService.newColumnTitle = inputValue;
    }
  }

}
