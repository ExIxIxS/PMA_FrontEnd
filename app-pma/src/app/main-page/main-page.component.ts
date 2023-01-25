import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { RestDataService } from '../restAPI.service';
import { LocalStorageService } from '../localStorage.service';
import { ConfirmationService } from '../confirmation.service';
import { AppBoardObj } from '../app.interfeces';



@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {
  constructor(
    private router: Router,
    private restAPI : RestDataService,
    private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
  ) {
    this.restAPI.updateBoardsStorage();
  }

  get isBoards() {
    return !(!this.ownBoards.length && this.localStorageService.isBoards);
  }

  get ownBoards() {
    return this.localStorageService.currentAppBoards
      .filter((boardObj) => boardObj.owner._id === this.localStorageService.currentUserId);
  }

  get ownBoardsOutput() {
    return this.ownBoards
      .map((boardObj) => this.adoptBoardForOutput(boardObj));
  }

  get participanceBoards() {
    const participant = this.localStorageService.apiUsers
      .find((userObj) => userObj._id === this.localStorageService.currentUserId);

    if (participant) {
      return this.localStorageService.currentAppBoards
      .filter((boardObj) => boardObj.users.includes(participant));
    }

    return [];
  }

  get participanceBoardsOutput() {
    return this.participanceBoards
      .map((boardObj) => this.adoptBoardForOutput(boardObj));
  }

  get otherBoards() {
    return this.localStorageService.currentAppBoards
      .filter((boardObj) => !(
        this.ownBoards.includes(boardObj)
        || this.participanceBoards.includes(boardObj)
        )
      );
  }

  get otherBoardsOutput() {
    return this.otherBoards
      .map((boardObj) => this.adoptBoardForOutput(boardObj));
  }

  adoptBoardForOutput(boardObj: AppBoardObj) {
    return {
            _id: boardObj._id,
            title: boardObj.title,
            owner: boardObj.owner.name,
            users: boardObj.users
              .map((userObj) => userObj.name)
              .join(', '),
          };
  }

  createNewBoard() {
    this.confirmationService.openDialog({type: 'createBoard'});
  }

  deleteBoard(boardId: string, boardTitle: string, owner: string) {
    const rightToDelete = this.localStorageService.currentAppBoards
      .find((boardObj) => boardObj._id === boardId)
      ?.owner._id === this.localStorageService.currentUserId;

    const board = {
      boardId: boardId,
      boardTitle: boardTitle,
      owner: owner,
      rightToDelete: rightToDelete,
    }
    this.confirmationService.openDialog({type: 'deleteBoard', deletedBoard: board,})
  }

  openBoard(boardId: string) {
    this.router.navigate(['boards', boardId]);
  }

}
