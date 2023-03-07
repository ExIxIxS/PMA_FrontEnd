import { Component } from '@angular/core';
import { ErrorHandlerService } from 'src/app/services/errorHandler.service';

@Component({
  selector: 'app-error-panel',
  templateUrl: './error-panel.component.html',
  styleUrls: ['./error-panel.component.scss']
})
export class ErrorPanelComponent {
  public pageIndex = 0;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    ) {}

  public get isError(): boolean {
    return this.errorHandlerService.isError;
  }

  public get errorAmount(): number {
    return this.errorHandlerService.currentErrors.length;
  }

  public get currentError(): string {
    return this.errorHandlerService.currentErrors[this.pageIndex];
  }

  public cleanErrors(): void {
    this.errorHandlerService.clearErrors();
    this.pageIndex = 0;
  }

}
