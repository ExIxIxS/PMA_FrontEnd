import { Component } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl, FormGroup } from '@angular/forms';

import { RestDataService } from '../restAPI.service';
import { ConfirmationService } from '../confirmation.service';
import { LocalStorageService } from '../localStorage.service';
import { ErrorHandlerService } from '../errorHandler.service';

import { NewBoardObj, Participant, UserRestObj } from '../app.interfeces'
import { AppFormsService } from '../app-forms.service';

@Component({
  selector: 'app-form-new-board',
  templateUrl: './form-new-board.component.html',
  styleUrls: ['./form-new-board.component.scss']
})
export class FormNewBoardComponent {
  hide = true;

  titleFormControl = this.formService.getNewFormControl('boardTitle');
  checkoutForm = new FormGroup({boardTitle: this.titleFormControl});

  addOnBlur = true;
  participants: Participant[] = [];
  participantInput = new FormControl('');
  availableUsers: string[] = [];
  allUsers: UserRestObj[] | undefined;

  constructor(
    private restAPI: RestDataService,
    private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
    private errorHandlerService: ErrorHandlerService,
    private formService: AppFormsService,
  ) {
    this.getUsers();
  }

  get ownerId(): string | undefined {
    if (this.allUsers) {
      const ownerLogin = this.localStorageService.currentUser.login;
      return this.allUsers
        .find((UserRestObj) => UserRestObj.login === ownerLogin)
        ?._id;
    }

    return;
  }

  getErrorMessage(): string {
    return this.formService.getErrorMessage(this.checkoutForm, 'boardTitle');
  }

  getUsers(): void {
    const usersObserver = {
      next: (userObjArr: UserRestObj[]) => {
        this.allUsers = userObjArr;
        this.availableUsers = userObjArr
          .filter((obj) => obj._id !== this.ownerId)
          .map((obj) => obj.name);
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err);
      },
    }

    this.restAPI.getUsers().subscribe(usersObserver)
  }

  add(event: MatAutocompleteSelectedEvent): void {
    const name = event.option.value;

    if (name) {
      this.participants.push({name: name});
      this.availableUsers = this.availableUsers.filter((userName) => userName !== name)
      this.participantInput.setValue('');
    }

    this.updateNewBoard();
  }

  remove(participant: Participant): void {
    const index = this.participants.indexOf(participant);

    if (index >= 0) {
      this.participants.splice(index, 1);
    }

    this.availableUsers.push(participant.name);
    this.updateNewBoard();
  }

  createNewBoardObj(): NewBoardObj {
    const title = this.checkoutForm.controls.boardTitle.value;
    let ownerID;
    let participantsIDs;

    if (this.allUsers) {
      ownerID = this.ownerId;
      participantsIDs = this.allUsers
        .filter((UserRestObj) => this.participants
          .map((participant) => participant.name)
          .includes(UserRestObj.name)
        )
        .map((UserRestObj) => UserRestObj._id);
    }

    const newBoard: NewBoardObj = {
      title: (title) ? title : '',
      owner: (ownerID) ? ownerID : '',
      users: (participantsIDs) ? participantsIDs : [],
    }

    return newBoard;
  }

  checkInput(): void {
    this.confirmationService.isConfirmValid = this.checkoutForm.valid;
    this.updateNewBoard();
  }

  updateNewBoard(): void {
    if (this.checkoutForm.valid) {
      this.confirmationService.newBoard = this.createNewBoardObj();
    }
  }

}
