import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { RestDataService } from './restAPI.service';
import { ErrorHandlerService } from './errorHandler.service';

import { DialogPopupComponent } from './dialog-popup/dialog-popup.component';

import { ConfirmationTypes, DeletedBoard, DeletedColumnOption, DeletedTask, HandleConfirmOptions, NewBoardObj, NewColumnOption, NewTaskObj, NewTaskOptions, OpenDialogArgs, TaskDeletionOptions } from './app.interfeces';
import { LocalStorageService } from './localStorage.service';


@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  type: ConfirmationTypes = 'default';
  title: string = 'Confirmation Service';
  newBoard: NewBoardObj | undefined;
  isConfirmValid: boolean;
  deletedBoard: DeletedBoard | null = null;
  boardId: string | undefined;
  boardOrder: number | undefined;
  newColumnTitle: string | undefined;
  newTaskTitle: string | undefined;
  newTaskDescription: string | undefined;
  newTaskExecutor: string | undefined;

  constructor(public dialog: MatDialog,
              private restAPI: RestDataService,
              private localStorageService: LocalStorageService,
              private errorHandlerService: ErrorHandlerService,
    ) {
      this.isConfirmValid = false;
  }


  openDialog({type = 'default', ...rest}: OpenDialogArgs): void {
    let handleOptions: HandleConfirmOptions;
    const dialogRef = this.dialog.open(DialogPopupComponent);
    this.type = type;
    this.title = this.getTitle();
    this.isConfirmValid = false;

    switch(this.type) {
      case 'createBoard':
        break;
      case 'createColumn':
        if (rest.newColumn) {
          handleOptions = rest.newColumn;
        };
        break;
      case 'createTask':
        if (rest.newTask) {
          handleOptions = rest.newTask;
        };
        break;
      case 'deleteBoard': {
        if (rest.deletedBoard) {
          this.deletedBoard = rest.deletedBoard;
          this.isConfirmValid = this.deletedBoard.rightToDelete;
        } else {
          this.deletedBoard = null;
        }
      }
        break;
      case 'deleteUser':
        this.isConfirmValid = true;
        break;
      case 'deleteColumn':
        if (rest.deletedColumn) {
          this.isConfirmValid = true;
          handleOptions = rest.deletedColumn;
        }
        break;
      case 'deleteTask':
        if (rest.deletedTask) {
          this.isConfirmValid = true;
          handleOptions = {
            deletedTask: rest.deletedTask
          } as TaskDeletionOptions;

          if (rest.updatedTasks) {
            handleOptions['updatedTasks'] = rest.updatedTasks;
          }
        };
        break;
      default:
        break;
    }

    dialogRef
      .afterClosed()
      .subscribe((result) => this.handleConfirmation(result, handleOptions));
  }

  handleConfirmation(result: true | undefined | '', handleOptions: HandleConfirmOptions) {
    if (!result) {
      return;
    }

    console.log('Confirmed')

    switch(this.type) {
      case 'createBoard':
        if (this.newBoard) {
          console.log(this.newBoard)
          this.restAPI.createBoard(this.newBoard);
        };
        break;
      case 'createColumn':
        if (handleOptions && this.newColumnTitle) {
          const columnOption = {
            ...handleOptions,
            columnTitle: this.newColumnTitle
          }
          this.restAPI.createColumn(columnOption as NewColumnOption);
        } else {
          this.errorHandlerService
            .handleError(new Error('Application: "Initial values Error"'))
        }
        break;
        case 'createTask':
          if (handleOptions  && this.newTaskTitle && this.newTaskExecutor) {
            const taskOptions = handleOptions as NewTaskOptions;
            const newTaskObj: NewTaskObj =
              {
                title: this.newTaskTitle,
                order: taskOptions.order,
                description: this.newTaskDescription as string,
                userId: taskOptions.userId,
                users: [this.newTaskExecutor],
              }
            console.log('Create task!')
            this.restAPI.createTask(taskOptions.boardId, taskOptions.columnId, newTaskObj);

          } else {
            this.errorHandlerService
              .handleError(new Error('Application: "Initial values Error"'))
          }
          break;
      case 'deleteBoard':
        if (this.deletedBoard) {
          console.log('Delete the board!!!')
          this.restAPI.deleteBoard(this.deletedBoard.boardId)
        };
        break;
      case 'deleteUser':
        console.log(this.localStorageService.currentUserId)
        if (this.localStorageService.currentUserId) {
          console.log('Delete the user!!!')
            this.restAPI.deleteCurentUser();
          };
          break;
      case 'deleteColumn': {
        this.restAPI.deleteColumn(handleOptions as DeletedColumnOption);
        break;
      }
      case 'deleteTask': {
        this.restAPI.deleteTask(handleOptions as TaskDeletionOptions);
        break;
      }
      default:
        break;
    }
  }

  getTitle() {
    switch(this.type) {
      case 'createBoard':
        return 'Create a new board';
      case 'createColumn':
        return 'Create a new column';
      case 'createTask':
        return 'Create a new task';
      case 'deleteBoard':
        return 'Board deletion';
      case 'deleteBoard':
        return 'User account removing';
      case 'deleteColumn':
        return 'Column deletion';
      case 'deleteTask':
          return 'Task deletion';
      default:
        return 'Confirmation Service';
    }
  }

}
