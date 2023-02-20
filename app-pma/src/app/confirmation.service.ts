import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { RestDataService } from './restAPI.service';
import { ErrorHandlerService } from './errorHandler.service';

import { DialogPopupComponent } from './dialog-popup/dialog-popup.component';

import { ConfirmationTypes, DeletedBoard, DeletedColumnOption, EditableTask, HandleConfirmObj, NewBoardObj, NewColumnOption, NewTaskObj,
          NewTaskOptions, OpenDialogArgs, TaskRestObj, TaskDeletionOptions, UserRestObj } from './app.interfeces';
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
  newTaskExecutor: UserRestObj | undefined;
  editableTask: TaskRestObj | undefined | null;

  constructor(public dialog: MatDialog,
              private restAPI: RestDataService,
              private localStorageService: LocalStorageService,
              private errorHandlerService: ErrorHandlerService,
    ) {
      this.isConfirmValid = false;
  }

  openDialog({type = 'default', ...rest}: OpenDialogArgs): void {
    let handleOptions: HandleConfirmObj;
    this.type = type;
    this.isConfirmValid = false;
    this.editableTask = null;

    switch(this.type) {
      case 'createBoard':
        break;
      case 'createColumn':
        if (rest.newColumn) {
          handleOptions = {options: rest.newColumn};
        };
        break;
      case 'createTask':
        if (rest.newTask) {
          handleOptions = {options: rest.newTask};
        };
        break;
      case 'editTask':
        if (rest.editableTask) {
          this.editableTask = rest.editableTask;
          handleOptions = {
            options: rest.editableTask,
            callBack: rest.additionalHandler
          };
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
          handleOptions = {options: rest.deletedColumn};
        }
        break;
      case 'deleteTask':
        if (rest.deletedTask) {
          this.isConfirmValid = true;
          handleOptions = {
            options: {
              deletedTask: rest.deletedTask,
              updatedTasks: rest.updatedTasks,
            } as TaskDeletionOptions
          };
        };
        break;
      default:
        break;
    }

    const dialogRef = this.dialog.open(DialogPopupComponent);

    dialogRef
      .afterClosed()
      .subscribe((result) => this.handleConfirmation(result, handleOptions));
  }

  handleConfirmation(result: true | undefined | '', handleOptions: HandleConfirmObj) {
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
            ...handleOptions.options,
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
            const taskOptions = handleOptions.options as NewTaskOptions;
            const newTaskObj: NewTaskObj =
              {
                title: this.newTaskTitle,
                order: taskOptions.order,
                description: this.newTaskDescription as string,
                userId: taskOptions.userId,
                users: [this.newTaskExecutor._id],
              }
            console.log('Create task!')
            this.restAPI.createTask(taskOptions.boardId, taskOptions.columnId, newTaskObj);

          } else {
            this.errorHandlerService
              .handleError(new Error('Application: "Initial values Error"'))
          }
          break;
          case 'editTask':
            console.log(handleOptions, this.newTaskTitle, this.newTaskExecutor)
            if (handleOptions  && this.newTaskTitle) {
              const currentTask = handleOptions.options as TaskRestObj;
              const newTaskObj: EditableTask =
                {
                  title: this.newTaskTitle,
                  order: currentTask.order,
                  description: this.newTaskDescription as string,
                  columnId: currentTask.columnId,
                  userId: currentTask.userId,
                  users: [(this.newTaskExecutor) ? this.newTaskExecutor._id : currentTask.users[0]],
                }
              console.log('Edit task!')
              if (handleOptions.callBack) {
                this.restAPI.updateTask(currentTask.boardId, currentTask._id, newTaskObj, handleOptions.callBack);
              } else {
                this.restAPI.updateTask(currentTask.boardId, currentTask._id, newTaskObj);
              }

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
          this.restAPI.deleteColumn(handleOptions.options as DeletedColumnOption);
          break;
        }
        case 'deleteTask': {
          this.restAPI.deleteTask(handleOptions.options as TaskDeletionOptions);
          break;
        }
        default:
          break;
      }
  }

}
