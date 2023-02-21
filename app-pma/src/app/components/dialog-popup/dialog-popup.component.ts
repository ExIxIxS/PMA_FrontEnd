import { Component } from '@angular/core';
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

  get type() {
    return this.confirmationService.type;
  }

  get isConfirmValid(): boolean {
    return this.confirmationService.isConfirmValid;
  }

  get boardTitle() {
    return this.confirmationService.deletedBoard?.boardTitle;
  }

  get boardOwner() {
    return this.confirmationService.deletedBoard?.owner;
  }

  get isRightToDelete() {
    return this.confirmationService.deletedBoard?.rightToDelete;
  }

}
