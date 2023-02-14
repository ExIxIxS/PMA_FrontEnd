import { Component } from '@angular/core';
import { ErrorHandlerService } from '../errorHandler.service';

@Component({
  selector: 'app-error-panel',
  templateUrl: './error-panel.component.html',
  styleUrls: ['./error-panel.component.scss']
})
export class ErrorPanelComponent {
  public pageIndex: number = 0;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    ) {}

  get isError() {
    return this.errorHandlerService.isError;
  }

  get errorAmount() {
    return this.errorHandlerService.currentErrors.length;
  }

  get currentError() {
    return this.errorHandlerService.currentErrors[this.pageIndex];
  }

  cleanErrors() {
    this.errorHandlerService.clearErrors();
    this.pageIndex = 0;
  }

}
