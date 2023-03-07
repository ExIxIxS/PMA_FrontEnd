import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmationTypes, DeletedBoard, DeletedColumnOption, EditableTask, HandleConfirm, NewBoard, NewColumnOption, NewTask,
          NewTaskOptions, OpenDialogArgs, TaskRest, TaskDeletionOptions, UserRest } from '../app.interfeces';

import { RestDataService } from './restAPI.service';
import { ErrorHandlerService } from './errorHandler.service';
import { LocalStorageService } from './localStorage.service';

import { DialogPopupComponent } from '../components/dialog-popup/dialog-popup.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  public type: ConfirmationTypes = 'default';
  public title = 'Confirmation Service';
  public isConfirmValid: boolean;
  public deletedBoard: DeletedBoard | null = null;
  public boardId: string | undefined;
  public boardOrder: number | undefined;
  public newBoard: NewBoard | undefined;
  public newBoardTemplate: string | undefined;
  public newColumnTitle: string | undefined;
  public newTaskTitle: string | undefined;
  public newTaskDescription: string | undefined;
  public newTaskExecutor: UserRest | undefined;
  public editableTask: TaskRest | undefined | null;

  constructor(
              public dialog: MatDialog,
              private restAPI: RestDataService,
              private localStorageService: LocalStorageService,
              private errorHandlerService: ErrorHandlerService,
    ) {
      this.isConfirmValid = false;
  }

  public openDialog({type = 'default', ...rest}: OpenDialogArgs): void {
    let handleOptions: HandleConfirm;
    this.type = type;
    this.isConfirmValid = false;
    this.editableTask = null;

    switch(this.type) {
      case 'createBoard':
        break;
      case 'createColumn':
        if (rest.newColumn) {
          handleOptions = {
            options: rest.newColumn,
            callBack: rest.additionalHandler,
          };
        }
        break;
      case 'createTask':
        if (rest.newTask) {
          handleOptions = {options: rest.newTask};
        }
        break;
      case 'editTask':
        if (rest.editableTask) {
          this.editableTask = rest.editableTask;
          handleOptions = {
            options: rest.editableTask,
            callBack: rest.additionalHandler
          };
        }

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
          handleOptions = {
            options: rest.deletedColumn,
            callBack: rest.additionalHandler,
          };
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
        }
        break;
      default:
        break;
    }

    this.dialog.open(DialogPopupComponent)
      .afterClosed()
      .subscribe((result) => this.handleConfirmation(result, handleOptions));
  }

  public handleConfirmation(result: true | undefined | '', handleOptions: HandleConfirm): void {
    if (!result) {
      return;
    }

    switch(this.type) {
      case 'createBoard':
        if (this.newBoard) {
          this.restAPI.createBoard(this.newBoard, this.newBoardTemplate);
        }
        break;
      case 'createColumn':
        if (handleOptions && this.newColumnTitle) {
          const columnOption = {
            ...handleOptions.options,
            columnTitle: this.newColumnTitle
          }
          if (handleOptions.callBack) {
            this.restAPI.createColumn(columnOption as NewColumnOption,);
          } else {
            this.restAPI.createColumn(columnOption as NewColumnOption);
          }
        } else {
          this.errorHandlerService
            .handleError(new Error('Application: "Initial values Error"'))
        }
        break;
        case 'createTask':
          if (handleOptions  && this.newTaskTitle && this.newTaskExecutor) {
            const taskOptions = handleOptions.options as NewTaskOptions;
            const newTaskObj: NewTask =
              {
                title: this.newTaskTitle,
                order: taskOptions.order,
                description: this.newTaskDescription as string,
                userId: taskOptions.userId,
                users: [this.newTaskExecutor._id],
              }
            this.restAPI.createTask(taskOptions.boardId, taskOptions.columnId, newTaskObj);

          } else {
            this.errorHandlerService
              .handleError(new Error('Application: "Initial values Error"'))
          }
          break;
          case 'editTask':
            if (handleOptions  && this.newTaskTitle) {
              const currentTask = handleOptions.options as TaskRest;
              const newTaskObj: EditableTask =
                {
                  title: this.newTaskTitle,
                  order: currentTask.order,
                  description: this.newTaskDescription as string,
                  columnId: currentTask.columnId,
                  userId: currentTask.userId,
                  users: [(this.newTaskExecutor) ? this.newTaskExecutor._id : currentTask.users[0]],
                }
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
            this.restAPI.deleteBoard(this.deletedBoard.boardId)
          }
          break;
        case 'deleteUser':
          if (this.localStorageService.currentUserId) {
              this.restAPI.deleteCurentUser();
            }
            break;
        case 'deleteColumn': {
          this.restAPI.deleteColumn(handleOptions.options as DeletedColumnOption, handleOptions.callBack);
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
