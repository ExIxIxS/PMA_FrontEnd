import { Component } from '@angular/core';
import { ConfirmationTypes } from 'src/app/app.interfeces';
import { ConfirmationService } from 'src/app/services/confirmation.service';

@Component({
  selector: 'app-dialog-popup',
  templateUrl: './dialog-popup.component.html',
  styleUrls: ['./dialog-popup.component.scss']
})
export class DialogPopupComponent {

  constructor(
    private confirmationService: ConfirmationService,
    ) {}

  public get type(): ConfirmationTypes {
    return this.confirmationService.type;
  }

  public get isConfirmValid(): boolean {
    return this.confirmationService.isConfirmValid;
  }

  public get boardTitle(): string {
    return (this.confirmationService.deletedBoard)
      ? this.confirmationService.deletedBoard.boardTitle
      : '';
  }

  public get boardOwner(): string {
    return (this.confirmationService.deletedBoard)
      ? this.confirmationService.deletedBoard.owner
      : '';
  }

  public get isRightToDelete(): boolean {
    return (this.confirmationService.deletedBoard)
      ? this.confirmationService.deletedBoard.rightToDelete
      : false;
  }

}
