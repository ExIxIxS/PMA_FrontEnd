import { Component } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { RestDataService } from 'src/app/services/restAPI.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ErrorHandlerService } from 'src/app/services/errorHandler.service';

import { NewBoardObj, Participant, UserRestObj } from '../../app.interfeces'
import { AppFormsService } from 'src/app/services/app-forms.service';
import { Observable, Observer } from 'rxjs';

@Component({
  selector: 'app-form-new-board',
  templateUrl: './form-new-board.component.html',
  styleUrls: ['./form-new-board.component.scss']
})
export class FormNewBoardComponent {
  public hide = true;

  checkoutForm = this.formService.getNewFormGroup({type: 'newBoard'});

  public addOnBlur = true;
  public participants: Participant[] = [];
  public availableUsers: string[] = [];
  public foundedUsers: Observable<string[]> | undefined;
  public allUsers: UserRestObj[] | undefined;

  constructor(
    private restAPI: RestDataService,
    private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
    private errorHandlerService: ErrorHandlerService,
    private formService: AppFormsService,
  ) { }

  ngOnInit() {
    this._getUsers();
    this._observeFormChanges();
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

  add(event: MatAutocompleteSelectedEvent): void {
    const name = event.option.value;

    if (name) {
      this.participants.push({name: name});
      this.availableUsers = this.availableUsers.filter((userName) => userName !== name)
      this.checkoutForm.controls['participants'].setValue('');
    }

    this._updateNewBoard();
  }

  remove(participant: Participant): void {
    const index = this.participants.indexOf(participant);

    if (index >= 0) {
      this.participants.splice(index, 1);
    }

    this.availableUsers.push(participant.name);
    this._updateNewBoard();
  }

  private _updateFoundedUsers(users: string[] = this.availableUsers): void {
    this.foundedUsers = new Observable<string[]>((observer: Observer<string[]>) => {
      observer.next((users));
    });
  }

  private _getUsers(): void {
    const usersObserver = {
      next: (userObjArr: UserRestObj[]) => {
        this.allUsers = userObjArr;
        this.availableUsers = userObjArr
          .filter((obj) => obj._id !== this.ownerId)
          .map((obj) => obj.name);

        this._updateFoundedUsers();
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err);
      },
    }

    this.restAPI.getUsers().subscribe(usersObserver)
  }

  private _createNewBoardObj(): NewBoardObj {
    const title = this.checkoutForm.controls['boardTitle'].value;
    let ownerId: string | undefined;
    let participantsIds: string[] | undefined;

    if (this.allUsers) {
      ownerId = this.ownerId;
      participantsIds = this.allUsers
        .filter((UserRestObj) => this.participants
          .map((participant) => participant.name)
          .includes(UserRestObj.name)
        )
        .map((UserRestObj) => UserRestObj._id);
    }

    const newBoard: NewBoardObj = {
      title: (title) ? title : '',
      owner: (ownerId) ? ownerId : '',
      users: (participantsIds) ? participantsIds : [],
    }

    return newBoard;
  }

  private _updateNewBoard(): void {
    if (this.checkoutForm.valid) {
      this.confirmationService.newBoard = this._createNewBoardObj();
    }
  }

  private _observeFormChanges() {
    this._observeTitleInputChanges();
    this._observeUsersInputChanges();
  }

  private _observeUsersInputChanges(): void {
    const changesObserver = {
      next: (value: string | null) => {
        if (value) {
          const filteredUsers = this.availableUsers
            .filter((user) => user.toLowerCase().includes(value.toLowerCase()));
          this._updateFoundedUsers(filteredUsers);
        } else {
          this._updateFoundedUsers();
        }
      }
    };

    this.checkoutForm.controls['participants'].valueChanges
      .subscribe(changesObserver);
  }

  private _observeTitleInputChanges(): void {
    const changesObserver = {
      next: () => {
        this.confirmationService.isConfirmValid = this.checkoutForm.valid;
        this._updateNewBoard();
      }
    }

    this.checkoutForm.controls['boardTitle'].valueChanges
      .subscribe(changesObserver);
  }

}
