import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';

import { RestDataService } from '../restAPI.service';
import { ConfirmationService } from '../confirmation.service';
import { LocalStorageService } from '../localStorage.service';
import { ErrorHandlerService } from '../errorHandler.service';

import { NewBoardObj, Participant, UserObj } from '../app.interfeces'

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
  allUsers: UserObj[] | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private restAPI: RestDataService,
    private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
    private errorHandlerService: ErrorHandlerService,
  ) {
    this.getUsers();
  }

  getUsers() {
    const usersObserver = {
      next: (userObjArr: UserObj[]) => {
        this.allUsers = userObjArr;
        this.availableUsers = userObjArr.map((obj) => obj.name);
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

    if (this.checkoutForm.valid) {
      this.confirmationService.newBoard = this.createNewBoardObj();
    }
  }

  remove(participant: Participant): void {
    const index = this.participants.indexOf(participant);

    if (index >= 0) {
      this.participants.splice(index, 1);
    }

    this.availableUsers.push(participant.name);
  }

  createNewBoardObj(): NewBoardObj {
    const title = this.checkoutForm.controls.boardTitle.value;
    const owner = this.localStorageService.currentUser;
    let ownerID;
    let participantsIDs;

    if (this.allUsers) {
      ownerID = this.allUsers
        .find((userObj) => userObj.login === owner.login)
        ?._id;

      participantsIDs = this.allUsers
        .filter((userObj) => this.participants
          .map((participant) => participant.name)
          .includes(userObj.name)
        )
        .map((userObj) => userObj._id);
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
  }

}
