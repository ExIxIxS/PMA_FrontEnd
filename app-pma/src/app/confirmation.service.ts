import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { RestDataService } from './restAPI.service';
import { ErrorHandlerService } from './errorHandler.service';

import { DialogPopupComponent } from './dialog-popup/dialog-popup.component';

import { ConfirmationTypes, DeletedColumnOption, NewBoardObj, NewColumn, NewColumnOption } from './app.interfeces';
import { LocalStorageService } from './localStorage.service';

interface OpenDialogArgs {
  type: ConfirmationTypes,
  deletedBoard?: DeletedBoard,
  newColumn?: NewColumn,
  deletedColumn?: DeletedColumnOption,
}

interface DeletedBoard {
  boardId: string,
  boardTitle: string,
  owner: string,
  rightToDelete: boolean
}

type HandleConfirmOptions = NewColumn
                            | DeletedColumnOption;

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  type: ConfirmationTypes = 'default';
  title: string = 'Confirmation Service';
  newBoard: NewBoardObj | undefined;
  isConfirmValid: boolean;
  deletedBoard: DeletedBoard | null = null;
  boardId: string | undefined;
  boardOrder: number | undefined;
  newColumnTitle: string | undefined;

  constructor(public dialog: MatDialog,
              private restAPI: RestDataService,
              private localStorageService: LocalStorageService,
              private errorHandlerService: ErrorHandlerService,
    ) {
      this.isConfirmValid = false;
  }


  openDialog({type = 'default', ...rest}: OpenDialogArgs): void {
    let handleOptions: HandleConfirmOptions;
    const dialogRef = this.dialog.open(DialogPopupComponent);
    this.type = type;
    this.title = this.getTitle();
    this.isConfirmValid = false;

    switch(this.type) {
      case 'createBoard':
        break;
      case 'deleteBoard': {
        if (rest.deletedBoard) {
          this.deletedBoard = rest.deletedBoard;
          this.isConfirmValid = this.deletedBoard.rightToDelete;
        } else {
          this.deletedBoard = null;
        }
      }
        break;
      case 'deleteUser':
        this.isConfirmValid = true;
        break;
      case 'deleteColumn':
        if (rest.deletedColumn) {
          this.isConfirmValid = true;
          handleOptions = rest.deletedColumn;
        }
        break;
      case 'createColumn':
        if (rest.newColumn) {
          handleOptions = rest.newColumn;
        };
        break;
      default:
        break;
    }

    dialogRef
      .afterClosed()
      .subscribe((result) => this.handleConfirmation(result, handleOptions));
  }

  handleConfirmation(result: true | undefined | '', confirmOptions: HandleConfirmOptions) {
    if (!result) {
      return;
    }

    console.log('Confirmed')

    switch(this.type) {
      case 'createBoard':
        if (this.newBoard) {
          console.log(this.newBoard)
          this.restAPI.createBoard(this.newBoard);
        };
        break;
      case 'deleteBoard':
        if (this.deletedBoard) {
          console.log('Delete the board!!!')
          this.restAPI.deleteBoard(this.deletedBoard.boardId)
        };
        break;
      case 'deleteUser':
        console.log(this.localStorageService.currentUserId)
        if (this.localStorageService.currentUserId) {
          console.log('Delete the user!!!')
            this.restAPI.deleteCurentUser();
          };
          break;
      case 'createColumn':
        if (confirmOptions && this.newColumnTitle) {
          const columnOption = {
            ...confirmOptions,
            columnTitle: this.newColumnTitle
          }
          this.restAPI.createColumn(columnOption as NewColumnOption);
        } else {
          this.errorHandlerService
            .handleError(new Error('Application: "Initial values Error"'))
        }
        break;
      case 'deleteColumn': {
        this.restAPI.deleteColumn(confirmOptions as DeletedColumnOption);
        break;
      }
      default:
        break;
    }
  }

  getTitle() {
    switch(this.type) {
      case 'createBoard':
        return 'Create a new board';
      case 'deleteBoard':
        return 'Board deletion';
      case 'deleteBoard':
        return 'User account removing';
      case 'createColumn':
        return 'Create a new column';
      case 'deleteColumn':
        return 'Column deletion';
      default:
        return 'Confirmation Service';
    }
  }

}
