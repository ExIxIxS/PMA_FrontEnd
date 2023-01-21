import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';

import { RestDataService } from '../restAPI.service';
import { ConfirmationService } from '../confirmation.service';
import { LocalStorageService } from '../localStorage.service';
import { ErrorHandlerService } from '../errorHandler.service';

import { NewBoardObj, Participant, UserApiObj } from '../app.interfeces'

@Component({
  selector: 'app-form-new-board',
  templateUrl: './form-new-board.component.html',
  styleUrls: ['./form-new-board.component.scss']
})
export class FormNewBoardComponent {
  hide = true;

  validOptions = {
    boardTitle: {name: 'boardTitle', minLength: 2, maxLength: 30, pattern: 'a-zA-Z" "-'},
  }

  checkoutForm = this.formBuilder.group({
    boardTitle: ["",
      [
        Validators.required,
        Validators.minLength(this.validOptions.boardTitle.minLength),
        Validators.maxLength(this.validOptions.boardTitle.maxLength),
        Validators.pattern('[a-zA-Z_\. ]*'),
      ]
    ],
  });

  addOnBlur = true;
  participants: Participant[] = [];
  participantInput = new FormControl('');
  availableUsers: string[] = [];
  allUsers: UserApiObj[] | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private restAPI: RestDataService,
    private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
    private errorHandlerService: ErrorHandlerService,
  ) {
    this.getUsers();
  }

  get ownerId(): string | undefined {
    if (this.allUsers) {
      const ownerLogin = this.localStorageService.currentUser.login;
      return this.allUsers
        .find((UserApiObj) => UserApiObj.login === ownerLogin)
        ?._id;
    }

    return;
  }

  getUsers(): void {
    const usersObserver = {
      next: (userObjArr: UserApiObj[]) => {
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

  getErrorMessage(optionName: string): string {
    const controlOption = this.validOptions[optionName as keyof typeof this.validOptions];
    const controlOptionName = controlOption.name as keyof typeof this.checkoutForm.controls;
    const formControlErrors = this.checkoutForm.controls[controlOptionName].errors;

    switch(true) {
      case (!!formControlErrors?.['required']):
        return `You must enter a Board Title`;
      case (!!formControlErrors?.['minlength']):
        return `Min length of ${optionName} is ${controlOption.minLength} chars`;
      case (!!formControlErrors?.['maxlength']):
        return `Max length of ${optionName} is ${controlOption.maxLength} chars`;
      case (!!formControlErrors?.['pattern']):
        return `Allowed symbols for ${optionName} are "${controlOption.pattern}"`;
      default:
        return `Not a valid ${optionName}`;
    };
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
        .filter((UserApiObj) => this.participants
          .map((participant) => participant.name)
          .includes(UserApiObj.name)
        )
        .map((UserApiObj) => UserApiObj._id);
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
