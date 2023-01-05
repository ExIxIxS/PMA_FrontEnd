import { Component } from '@angular/core';
import { RestDataService } from '../restAPI.service';
import { ConfirmationService } from '../confirmation.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {

  constructor(
    private restAPI : RestDataService,
    private confirmationService: ConfirmationService,
  ) {
  }

get isBoards() {
  return false;
}

createNewBoard() {
  this.confirmationService.openDialog('createBoard');
}

}
