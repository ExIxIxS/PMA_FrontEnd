import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AppControlService } from './app-control.service';

@Injectable()
export class ErrorHandlerService {
  currentErrors: string[] = [];

  constructor(
    private appControlService: AppControlService
  ) {
      this._setGlobalErrorHandlers();
    }

  private _setGlobalErrorHandlers() {
    if (window) {
      window.console.error = (...errors: Error[] | string[]) => {
        errors.forEach((error) => {
          if (error instanceof Error) {
            this.handleError(error);
          } else {
            this._createUserError(error);
          }
        });
      };

      window.onerror = (message, url, line, col, error) => {
        if (message instanceof Event) {
          message.preventDefault();
        } else {
          this._createUserError(message);
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

  }

  get isError() {
    return this.currentErrors.length > 0;
  }

  handleError(err: Error) {
    if (err instanceof HttpErrorResponse) {
      this._handleResponseError(err)
    } else {
      this._createUserError(`Error message: ${err.message}`);
    }
  }

  private _handleResponseError(err: HttpErrorResponse) {
      if (err.status === 403) {
        this.appControlService.logOut();
      } else {
        this._createUserError(`HttpErrorResponse: ${err.error.message}`);
      }
  }

  private _createUserError(message: string) {
    this.currentErrors.push(message)
  }

  clearErrors() {
    this.currentErrors = [];
  }

}
