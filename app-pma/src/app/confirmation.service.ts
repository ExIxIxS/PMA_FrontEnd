import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { RestDataService } from './restAPI.service';
import { ErrorHandlerService } from './errorHandler.service';

import { DialogPopupComponent } from './dialog-popup/dialog-popup.component';

import { ConfirmationTypes, NewBoardObj } from './app.interfeces';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  type: ConfirmationTypes = 'default';
  title: string = 'Confirmation Service';
  newBoard: NewBoardObj | undefined;
  isConfirmValid: boolean;

  constructor(public dialog: MatDialog,
              private restAPI: RestDataService,
              private errorHandlerService: ErrorHandlerService,
    ) {
      this.isConfirmValid = false;
    }

  openDialog(type: ConfirmationTypes = 'default') {
    const dialogRef = this.dialog.open(DialogPopupComponent);
    this.type = type;
    this.title = this.getTitle();
    this.isConfirmValid = false;

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
          this.restAPI.createBoard(this.newBoard);
        };
        break;
      default:
    }
  }

  getTitle() {
    switch(this.type) {
      case 'createBoard':
        return 'Create a new board';
      default:
        return 'Confirmation Service';
    }
  }

}
