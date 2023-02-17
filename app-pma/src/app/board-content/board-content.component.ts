import { Component } from '@angular/core';
import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { merge, filter } from 'rxjs';

import { RestDataService } from '../restAPI.service';
import { ColumnRestObj, ColumnAppObj, DeletedColumnOption, TaskRestObj, NewTaskOptions, TaskSetRestObj, DeletedTask,
        NewColumnRestObj, RestBoardObj, UserRestObj, OpenDialogArgs } from '../app.interfeces';
import { ErrorHandlerService } from '../errorHandler.service';
import { ConfirmationService } from '../confirmation.service';
import { LocalStorageService } from '../localStorage.service';
import { AppFormsService } from '../app-forms.service';
import { AppControlService } from '../app-control.service';

@Component({
  selector: 'app-board-content',
  templateUrl: './board-content.component.html',
  styleUrls: ['./board-content.component.scss']
})
export class BoardContentComponent {
  public currentBoardId: string;
  public currentBoard: RestBoardObj | undefined;

  validOptions = {
    columnTitle: {
      name: 'Column title', minLength: 2, maxLength: 30, pattern: 'a-zA-Z" "-'
    },
  }

  constructor(private activeRoute: ActivatedRoute,
              private router: Router,
              private restAPI: RestDataService,
              private localStorageService: LocalStorageService,
              private errorHandlerService: ErrorHandlerService,
              private confirmationService: ConfirmationService,
              private formService: AppFormsService,
              private appControlService: AppControlService,
  ) {
    this.currentBoardId = this.activeRoute.snapshot.params['id'];
    this.startComponent();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe({
        next: () => {
          if (this.currentBoardId !== this.activeRoute.snapshot.params['id']) {
            this.restartComponent();
          }
        }
      });
  }

  get currentBoardTitle(): string {
    return (this.currentBoard)
      ? this.currentBoard.title
      : '';
  }

  startComponent() {
    this.localStorageService.clearColumns();
    this.updateBoardUsers();
    this.createBoardColumns();
    this.updateBoardTitle();
  }

  restartComponent() {
    this.currentBoardId = this.activeRoute.snapshot.params['id'];
    this.startComponent();
  }

  updateBoardTitle() {
    const updateTitleObserver = {
      next: (board: RestBoardObj) => {
        this.currentBoard = board;
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err)
      },
    }

    this.restAPI.getBoard(this.currentBoardId)
      .subscribe(updateTitleObserver);
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

  getExecutorName(task: TaskRestObj): string {
    if (task.users.length) {
      const userObj = this.localStorageService.getCurrentBoardUserById(task.users[0]);
      if (userObj) {
        return userObj.name;
      }
    } else {
      this.errorHandlerService.handleError(new Error(`There is no executor in task "${task.title}"`))
    }
    return 'unknown';
  }

  updateBoardUsers() {
    if (this.localStorageService.currentAppBoards.length) {
      this.localStorageService.updateCurrentBoardUsers(this.currentBoardId);
    } else {
      const updateBoardUsersObserver = {
        next: (restObj: RestBoardObj | UserRestObj[]) => {
          if (restObj.hasOwnProperty('length') ) {
            this.localStorageService.restUsers = restObj as UserRestObj[];
          } else {
            this.localStorageService.currentRestBoard = restObj as RestBoardObj;
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

  private getTasksSet(container: CdkDropList<TaskRestObj[]> | TaskRestObj[], newColumnId: string = ''): TaskSetRestObj[] {
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

  dropTask(event: CdkDragDrop<TaskRestObj[]>, currentColumnId: string): void {
    console.log('Rest Tasks before moving -->');
    console.log(JSON.parse(JSON.stringify(this.localStorageService.restTasks)));

    let taskSet: TaskSetRestObj[] = [];

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
      next: (columns: ColumnRestObj[]) => {
        this.localStorageService.restColumns = columns;
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
    if (this.localStorageService.restColumns.length) {
      const tasksObserver = {
        next: (tasks: TaskRestObj[]) => {
          this.localStorageService.restTasks.push(...tasks);
        },
        error: (err: Error) => {
          this.errorHandlerService.handleError(err)
        },
        complete: () => {
          this.localStorageService.updateBoardAppColumns();
        }
      }

      const observableTasksMap = this.localStorageService.restColumns
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
    column.titleForm.controls['columnTitle'].enable();
    input.focus();
  }

  disableTitleInput(column: ColumnAppObj, delay: number = 200) {
    const formControl = column.titleForm.controls['columnTitle'];
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
      .getErrorMessage(column.titleForm, 'columnTitle')
  }

  submitTitleChanges(event: Event, column: ColumnAppObj): void {
    event.preventDefault();
    console.log('submited');
    const formControl = column.titleForm.controls['columnTitle'];

    if (formControl.valid) {
      if (formControl.dirty) {
        const columnObj: NewColumnRestObj = {
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
    const formControl = column.titleForm.controls['columnTitle'];
    formControl.setValue(column.title);
    formControl.markAsUntouched();
    formControl.markAsPristine();
  }

  editTask(event: Event, task: TaskRestObj) {
    if (event.target) {
      if (!(event.target as HTMLElement).classList.contains('mat-mdc-button-touch-target')) {
        console.log(`Edit task ${task.title}`);
        console.log(task);
        this.confirmationService.openDialog({type: 'editTask', editableTask: task});
      }
    }
  }

  refactorForOutput(str: string, limit?: number): string {
    return this.appControlService.refactorForOutput(str, limit);
  }

}
