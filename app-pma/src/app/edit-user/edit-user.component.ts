import { Component } from '@angular/core';
import { ConfirmationService } from '../confirmation.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent {

  constructor(private confirmationService: ConfirmationService) {

  }

  deleteUser() {
    console.log('Delete User!')
    this.confirmationService.openDialog({type: 'deleteUser'})
  }

}
