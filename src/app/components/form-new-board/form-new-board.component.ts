import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { Observable, Observer, Subscription } from 'rxjs';

import { RestDataService } from 'src/app/services/restAPI.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ErrorHandlerService } from 'src/app/services/errorHandler.service';
import { AppControlService } from 'src/app/services/app-control.service';
import { AppFormsService } from 'src/app/services/app-forms.service';

import { NewBoard, Participant, UserRest } from '../../app.interfeces'
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-new-board',
  templateUrl: './form-new-board.component.html',
  styleUrls: ['./form-new-board.component.scss']
})
export class FormNewBoardComponent implements OnInit, OnDestroy {
  private subscribtions: Subscription[] = [];

  public hide: boolean = true;
  public addOnBlur: boolean = true;
  public boardTemplates = this.appControlService.boardTemplates;
  public participants: Participant[] = [];
  public availableUsers: string[] = [];
  public foundedUsers: Observable<string[]> | undefined;
  public allUsers: UserRest[] | undefined;
  public checkoutForm: FormGroup = this.formService.getNewFormGroup({type: 'newBoard'});

  constructor(
    private restAPI: RestDataService,
    private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
    private errorHandlerService: ErrorHandlerService,
    private formService: AppFormsService,
    private appControlService: AppControlService,
  ) { }

  public ngOnInit(): void {
    this.getUsers();
    this.observeFormChanges();
  }

  public ngOnDestroy(): void {
    this.subscribtions.forEach((subscr) => subscr.unsubscribe());
  }

  public get ownerId(): string | undefined {
    if (this.allUsers) {
      const ownerLogin = this.localStorageService.currentUser.login;
      return this.allUsers
        .find((UserRestObj) => UserRestObj.login === ownerLogin)
        ?._id;
    }

    return;
  }

  public getErrorMessage(): string {
    return this.formService.getErrorMessage(this.checkoutForm, 'boardTitle');
  }

  public add(event: MatAutocompleteSelectedEvent): void {
    const name = event.option.value;

    if (name) {
      this.participants.push({name: name});
      this.availableUsers = this.availableUsers.filter((userName) => userName !== name)
      this.checkoutForm.controls['participants'].setValue('');
    }

    this.updateNewBoard();
  }

  public remove(participant: Participant): void {
    const index = this.participants.indexOf(participant);

    if (index >= 0) {
      this.participants.splice(index, 1);
    }

    this.availableUsers.push(participant.name);
    this.updateNewBoard();
  }

  private updateFoundedUsers(users: string[] = this.availableUsers): void {
    this.foundedUsers = new Observable<string[]>((observer: Observer<string[]>) => {
      observer.next((users));
    });
  }

  private getUsers(): void {
    const usersObserver = {
      next: (userObjArr: UserRest[]) => {
        this.allUsers = userObjArr;
        this.availableUsers = userObjArr
          .filter((obj) => obj._id !== this.ownerId)
          .map((obj) => obj.name);

        this.updateFoundedUsers();
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err);
      },
    }

    const subscr = this.restAPI.getUsers()
      .subscribe(usersObserver)

    this.subscribtions.push(subscr);
  }

  private createNewBoardObj(): NewBoard {
    const title: string = this.checkoutForm.controls['boardTitle'].value;
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

    const newBoard: NewBoard = {
      title: (title) ? title : '',
      owner: (ownerId) ? ownerId : '',
      users: (participantsIds) ? participantsIds : [],
    }

    return newBoard;
  }

  private updateNewBoard(): void {
    if (this.checkoutForm.valid) {
      this.confirmationService.newBoard = this.createNewBoardObj();
      this.confirmationService.newBoardTemplate = this.checkoutForm.controls['boardTemplate'].value;
    }
  }

  private observeFormChanges(): void {
    this.observeTitleInputChanges();
    this.observeBoardTemplateChanges();
    this.observeUsersInputChanges();
  }



  private observeTitleInputChanges(): void {
    const changesObserver = {
      next: () => {
        this.confirmationService.isConfirmValid = this.checkoutForm.valid;
        this.updateNewBoard();
      }
    }

    const subscr = this.checkoutForm.controls['boardTitle'].valueChanges
      .subscribe(changesObserver);

    this.subscribtions.push(subscr);
  }

  private observeBoardTemplateChanges(): void {
    const changesObserver = {
      next: () => {
        this.confirmationService.isConfirmValid = this.checkoutForm.valid;
        this.updateNewBoard();
      }
    }

    const subscr = this.checkoutForm.controls['boardTemplate'].valueChanges
      .subscribe(changesObserver);

    this.subscribtions.push(subscr);
  }

  private observeUsersInputChanges(): void {
    const changesObserver = {
      next: (value: string | null) => {
        if (value) {
          const filteredUsers = this.availableUsers
            .filter((user) => user.toLowerCase().includes(value.toLowerCase()));
          this.updateFoundedUsers(filteredUsers);
        } else {
          this.updateFoundedUsers();
        }
      }
    };

    const subscr = this.checkoutForm.controls['participants'].valueChanges
      .subscribe(changesObserver);

    this.subscribtions.push(subscr);
  }

}
