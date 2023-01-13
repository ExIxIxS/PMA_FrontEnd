import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppControlService } from './app-control.service';

@Injectable()
export class ErrorHandlerService {
  currentErrors: string[] = [];

  constructor(
    private appControlService: AppControlService
  ) {}

  get isError() {
    return this.currentErrors.length > 0;
  }

  handleError(err: Error) {
    if (err instanceof HttpErrorResponse) {
      this.handleResponseError(err)
    } else {
      this.createUserError(`Error message: ${err.message}`);
    }
  }

  handleResponseError(err: HttpErrorResponse) {
      if (err.status === 403) {
        this.appControlService.logOut();
      } else {
        this.createUserError(`HttpErrorResponse: ${err.error.message}`);
      }
  }

  clearErrors() {
    this.currentErrors = [];
  }

  createUserError(message: string) {
    this.currentErrors.push(message)
  }

}
