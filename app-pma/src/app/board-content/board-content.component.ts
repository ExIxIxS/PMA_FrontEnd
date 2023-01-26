import { Component } from '@angular/core';
import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { merge } from 'rxjs';

import { RestDataService } from '../restAPI.service';
import { ColumnApiObj, ColumnAppObj, DeletedColumnOption, TaskApiObj, NewTaskOptions, TaskSetApiObj, DeletedTask, ColumnTitleInputObj, NewColumnApiObj, ApiBoardObj, UserApiObj, OpenDialogArgs } from '../app.interfeces';
import { ErrorHandlerService } from '../errorHandler.service';
import { ConfirmationService } from '../confirmation.service';
import { LocalStorageService } from '../localStorage.service';
import { AppFormsService } from '../app-forms.service';

@Component({
  selector: 'app-board-content',
  templateUrl: './board-content.component.html',
  styleUrls: ['./board-content.component.scss']
})
export class BoardContentComponent {
  public currentBoardId: string;

  validOptions = {
    columnTitle: {
      name: 'Column title', minLength: 2, maxLength: 30, pattern: 'a-zA-Z" "-'
    },
  }

  constructor(private activeRoute: ActivatedRoute,
              private restAPI: RestDataService,
              private localStorageService: LocalStorageService,
              private errorHandlerService: ErrorHandlerService,
              private confirmationService: ConfirmationService,
              private formService: AppFormsService,
  ) {
    this.localStorageService.clearColumns();
    this.currentBoardId = this.activeRoute.snapshot.params['id'];
    this.updateBoardUsers();
    this.createBoardColumns();
  }

  get columnsAmount() {
    return this.appColumns.length;
  }

  get appColumns(): ColumnAppObj[] {
    return this.localStorageService.currentBoardColumns;
  }

  set appColumns(columns: ColumnAppObj[]) {
    this.localStorageService.currentBoardColumns = columns;
  }

  updateBoardUsers() {
    if (this.localStorageService.currentAppBoards.length) {
      this.localStorageService.updateCurrentBoardUsers(this.currentBoardId);
    } else {
      const updateBoardUsersObserver = {
        next: (apiObj: ApiBoardObj | UserApiObj[]) => {
          if (apiObj.hasOwnProperty('length') ) {
            this.localStorageService.apiUsers = apiObj as UserApiObj[];
          } else {
            this.localStorageService.currentApiBoard = apiObj as ApiBoardObj;
          }
        },
        error: (err: Error) => {
          this.errorHandlerService.handleError(err)
        },
        complete: () => {
          this.localStorageService.updateCurrentBoardUsers(this.currentBoardId);
        }
      }

      merge(this.restAPI.getBoard(this.currentBoardId),
        this.restAPI.getUsers()
      ).subscribe(updateBoardUsersObserver);

    }
  }

  dropColumn(event: CdkDragDrop<ColumnAppObj[]>): void {
    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this.restAPI.updateColumnsOrder();
      }
    };
  }

  private getTasksSet(container: CdkDropList<TaskApiObj[]> | TaskApiObj[], newColumnId: string = ''): TaskSetApiObj[] {
    const sourceObj = (container instanceof CdkDropList)
      ? container.data
      : container;

    return sourceObj.map((task, index) => {
        return {
                _id: task._id,
                order: index,
                columnId: (newColumnId) ? newColumnId : task.columnId,
              }
      });
  }

  deleteTask(taskId: string, columnId: string): void {
    console.log('Delete task with id: ' + taskId);
    const deletedTaskObj: DeletedTask = {
      taskId: taskId,
      columnId: columnId,
      boardId: this.currentBoardId,
    }

    const targetColumn = this.localStorageService.currentBoardColumns.find((column) => column._id === columnId);
    const updatedColumnTasks = targetColumn?.tasks.filter((task) => task._id !== taskId);
    const deleteOptions: OpenDialogArgs = {type: 'deleteTask', deletedTask: deletedTaskObj};

    if (updatedColumnTasks?.length) {
      deleteOptions.updatedTasks = this.getTasksSet(updatedColumnTasks);
    }
    this.confirmationService.openDialog(deleteOptions)
  }

  dropTask(event: CdkDragDrop<TaskApiObj[]>, currentColumnId: string): void {
    console.log('Api Tasks before moving -->');
    console.log(JSON.parse(JSON.stringify(this.localStorageService.apiTasks)));

    let taskSet: TaskSetApiObj[] = [];

    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        taskSet = this.getTasksSet(event.container);
      }
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

      taskSet = [...this.getTasksSet(event.previousContainer), ...this.getTasksSet(event.container, currentColumnId)];
    }

    if (taskSet) {
      this.restAPI.updateTaskSet(taskSet);
    }
  }

  createBoardColumns() {
    const getColumnsObserver = {
      next: (columns: ColumnApiObj[]) => {
        this.localStorageService.apiColumns = columns;
        this.fillColumnsWithTasks();
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    this.restAPI
      .getBoardColumns(this.currentBoardId)
      .subscribe(getColumnsObserver);
  }

  fillColumnsWithTasks() {
    if (this.localStorageService.apiColumns.length) {
      const tasksObserver = {
        next: (tasks: TaskApiObj[]) => {
          this.localStorageService.apiTasks.push(...tasks);
        },
        error: (err: Error) => {
          this.errorHandlerService.handleError(err)
        },
        complete: () => {
          this.localStorageService.updateBoardAppColumns();
        }
      }

      const observableTasksMap = this.localStorageService.apiColumns
        .map((columnObj) => {
          return this.restAPI.getColumnTasks(columnObj.boardId, columnObj._id)
        });

      merge(...observableTasksMap).
        subscribe(tasksObserver);
    }
  }

  createColumn(): void {
    const newColumnObj = {
      boardID: this.currentBoardId,
      columnOrder: this.columnsAmount,
    }
    this.confirmationService.openDialog({type: 'createColumn', newColumn: newColumnObj})
  }

  deleteColumn(columnId: string){
    const deletedColumnOption: DeletedColumnOption = {
      boardId: this.currentBoardId,
      columnId: columnId
    };
    this.confirmationService.openDialog({type: 'deleteColumn', deletedColumn: deletedColumnOption})
  }

  getTasksAmount(columnId: string) {
    const column = this.appColumns
      .find((column) => column._id === columnId);
    return (column) ? column.tasks.length : 0;
  }

  createTask(columnId: string) {
    if (columnId) {
      const newTask: NewTaskOptions =
        {
          boardId: this.currentBoardId,
          columnId: columnId,
          order: this.getTasksAmount(columnId),
          userId: this.localStorageService.currentUserId,
        }

      this.confirmationService.openDialog({type: 'createTask', newTask})
    }
  }

  get isTaskDropDisabled() {
    return this.localStorageService.isTaskDropDisabled;
  }

  activateTitleInput(input: HTMLInputElement, column: ColumnAppObj) {
    column.titleFormControl.enable();
    input.focus();
  }

  disableTitleInput(column: ColumnAppObj, delay: number = 200) {
    const formControl = column.titleFormControl;
    if (formControl.valid) {
      setTimeout(()=> {
        if (formControl.untouched || formControl.pristine) {
          formControl.disable();
        }
      }, delay);
    }
  }

  getErrorMessage(column: ColumnAppObj) {
    return this.formService
      .getErrorMessage(column.titleFormControl, 'columnTitle')
  }

  submitTitleChanges(column: ColumnAppObj): void {
    console.log('submited');
    const formControl = column.titleFormControl;

    if (formControl.valid) {
      if (formControl.dirty) {
        const columnObj: NewColumnApiObj = {
          title: formControl.value,
          order: column.order,
        }
        this.restAPI.updateColumnTitle(column.boardId, column._id, columnObj);
      }

      formControl.markAsUntouched();
      formControl.markAsPristine();
    }

  }

  restoreTitleInputValue(column: ColumnAppObj) {
    const formControl = column.titleFormControl;
    formControl.setValue(column.title);
    formControl.markAsUntouched();
    formControl.markAsPristine();
  }

}
