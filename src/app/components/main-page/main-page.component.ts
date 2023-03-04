import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { RestDataService } from 'src/app/services/restAPI.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';

import { AdaptedBoard, AppBoard, DeletedBoard } from '../../app.interfeces';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit, OnDestroy {
  private currentAppBoards: AppBoard[] = [];
  private subscribtions: Subscription[] = [];

  public ownBoardsOutput: AdaptedBoard[] = [];
  public participanceBoardsOutput: AdaptedBoard[] = [];
  public otherBoardsOutput: AdaptedBoard[] = [];
  public isHideStartButton: boolean = true;

  constructor(
    private router: Router,
    private restAPI: RestDataService,
    private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
  ) { }

  public ngOnInit(): void {
    this.restAPI.updateBoardsStorage();
    const subscr = this.localStorageService.currentAppBoardsEmitter.subscribe({
      next: () => {
        this.currentAppBoards = this.localStorageService.currentAppBoards;
        this.updateBoards();
      },
    })

    this.subscribtions.push(subscr);
  }

  public ngOnDestroy(): void {
    this.subscribtions.forEach((subscr) => subscr.unsubscribe());
  }

  public updateBoards(): void {
    this.ownBoardsOutput = this.getOwnBoardsOutput();
    this.participanceBoardsOutput = this.getParticipanceBoardsOutput();
    this.otherBoardsOutput = this.getOtherBoardsOutput();
    this.isHideStartButton = !!(this.ownBoardsOutput.length && this.restAPI.isInProgress);
  }

  private getOwnBoards(): AppBoard[] {
    return this.currentAppBoards
      .filter((boardObj) => boardObj.owner._id === this.localStorageService.currentUserId);
  }

  private getOwnBoardsOutput(): AdaptedBoard[] {
    return this.getOwnBoards()
      .map((boardObj) => this.adaptBoardForOutput(boardObj));
  }

  private getParticipanceBoards(): AppBoard[] {
    const participant = this.localStorageService.restUsers
      .find((userObj) => userObj._id === this.localStorageService.currentUserId);

    return (participant)
      ? this.currentAppBoards
        .filter((boardObj) => boardObj.users.includes(participant))
      : [];
  }

  private getParticipanceBoardsOutput(): AdaptedBoard[] {
    return this.getParticipanceBoards()
      .map((boardObj) => this.adaptBoardForOutput(boardObj));
  }

  private getOtherBoardsOutput(): AdaptedBoard[] {
    const takenIds: string[] = [
      ...this.ownBoardsOutput.map((adaptedBoard) => adaptedBoard._id),
      ...this.participanceBoardsOutput.map((adaptedBoard) => adaptedBoard._id),
    ]

    return this.currentAppBoards
      .map((board) => this.adaptBoardForOutput(board))
      .filter((adaptedBoard) => !(takenIds.includes(adaptedBoard._id))
      );
  }

  private adaptBoardForOutput(boardObj: AppBoard): AdaptedBoard {
    return {
            _id: boardObj._id,
            title: boardObj.title,
            owner: boardObj.owner.name,
            users: boardObj.users
              .map((userObj) => userObj.name)
              .join(', '),
          };
  }

  public createNewBoard(): void {
    this.confirmationService.openDialog({type: 'createBoard'});
  }

  public deleteBoard(e:Event, boardId: string, boardTitle: string, owner: string): void {
    e.stopPropagation();
    const isRightToDelete: boolean = this.localStorageService.currentAppBoards
      .find((boardObj) => boardObj._id === boardId)
      ?.owner._id === this.localStorageService.currentUserId;

    const board: DeletedBoard = {
      boardId: boardId,
      boardTitle: boardTitle,
      owner: owner,
      rightToDelete: isRightToDelete,
    }

    this.confirmationService.openDialog({type: 'deleteBoard', deletedBoard: board,})

  }

  public openBoard(boardId: string): void {
    this.router.navigate(['boards', boardId]);
  }

}
