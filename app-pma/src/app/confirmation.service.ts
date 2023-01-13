import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { RestDataService } from './restAPI.service';
import { ErrorHandlerService } from './errorHandler.service';

import { DialogPopupComponent } from './dialog-popup/dialog-popup.component';

import { ConfirmationTypes, NewBoardObj } from './app.interfeces';

interface OpenDialogArgs {
  type: ConfirmationTypes,
  deletedBoard?: DeletedBoard,
}

interface DeletedBoard {
  boardId: string,
  boardTitle: string,
  owner: string,
  rightToDelete: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  type: ConfirmationTypes = 'default';
  title: string = 'Confirmation Service';
  newBoard: NewBoardObj | undefined;
  isConfirmValid: boolean;
  deletedBoard: DeletedBoard | null = null;

  constructor(public dialog: MatDialog,
              private restAPI: RestDataService,
              private errorHandlerService: ErrorHandlerService,
    ) {
      this.isConfirmValid = false;
    }


  openDialog({type = 'default', ...rest}: OpenDialogArgs): void {
    const dialogRef = this.dialog.open(DialogPopupComponent);
    this.type = type;
    this.title = this.getTitle();
    this.isConfirmValid = false;

    if (rest.deletedBoard) {
      this.deletedBoard = rest.deletedBoard;
      this.isConfirmValid = this.deletedBoard.rightToDelete;
    } else {
      this.deletedBoard = null;
    }

    this.deletedBoard = (rest.deletedBoard)
      ? rest.deletedBoard
      : null;

    dialogRef
      .afterClosed()
      .subscribe((result) => this.handleConfirmation(result));
  }

  handleConfirmation(result: true | undefined | '') {
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
      default:
    }
  }

  getTitle() {
    switch(this.type) {
      case 'createBoard':
        return 'Create a new board';
      case 'deleteBoard':
          return 'Board deletion';
      default:
        return 'Confirmation Service';
    }
  }

}
