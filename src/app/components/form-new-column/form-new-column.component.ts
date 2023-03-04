import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ConfirmationService } from 'src/app/services/confirmation.service';
import { AppFormsService } from 'src/app/services/app-forms.service';

@Component({
  selector: 'app-form-new-column',
  templateUrl: './form-new-column.component.html',
  styleUrls: ['./form-new-column.component.scss']
})
export class FormNewColumnComponent {
  public hide: boolean = true;
  public titleFormControl = this.formService.getNewFormControl('columnTitle');
  public checkoutForm = new FormGroup({columnTitle: this.titleFormControl})

  constructor(
    private confirmationService: ConfirmationService,
    private formService: AppFormsService,
  ) {}

  public getErrorMessage(): string {
    return this.formService.getErrorMessage(this.checkoutForm, 'columnTitle');
  }

  public checkInput(): void {
    this.confirmationService.isConfirmValid = this.checkoutForm.valid;
    this.updateNewColumnTitle();
  }

  public updateNewColumnTitle(): void {
    const inputValue = this.titleFormControl.value;

    if (this.checkoutForm.valid && inputValue) {
      this.confirmationService.newColumnTitle = inputValue;
    }
  }

}
