import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppControlService } from './app-control.service';

@Injectable()
export class ErrorHandlerService {
  public currentErrors: string[] = [];

  constructor(
    private appControlService: AppControlService
  ) {
      this.setGlobalErrorHandlers();
    }

  public get isError(): boolean {
    return this.currentErrors.length > 0;
  }

  private setGlobalErrorHandlers(): void {
    if (!window) {
      return;
    };

    window.console.error = (...errors: Error[] | string[]) => {
      errors.forEach((error) => {
        if (error instanceof Error) {
          this.handleError(error);
        }
      });
    };

    window.onerror = (message, url, line, col, error) => {
      if (message instanceof Event) {
        message.preventDefault();
      }

      if (error instanceof Error) {
        this.handleError(error);
      };
    };

    window.addEventListener('unhandledrejection', (event) => {
        event.preventDefault();
        this.handleError(event.reason);
      }
    );

  }

  public handleError(err: Error): void {
    if (err instanceof HttpErrorResponse) {
      this.handleResponseError(err)
    } else {
      this.createUserError(`Error message: ${err.message}`);
    }
  }

  private handleResponseError(err: HttpErrorResponse): void {
      if (err.status === 403) {
        this.appControlService.logOut();
      } else {
        this.createUserError(`HttpErrorResponse: ${err.error.message}`);
      }
  }

  private createUserError(message: string): void {
    this.currentErrors.push(message)
  }

  public clearErrors(): void {
    this.currentErrors = [];
  }

}
