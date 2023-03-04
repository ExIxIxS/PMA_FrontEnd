import { Component, OnDestroy, OnInit } from '@angular/core';
import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { merge, filter, Subscription } from 'rxjs';

import { RestDataService } from '../../services/restAPI.service';
import { ErrorHandlerService } from 'src/app/services/errorHandler.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { AppFormsService } from 'src/app/services/app-forms.service';

import { ColumnRest, ColumnApp, DeletedColumnOption, TaskRest, NewTaskOptions, TaskSetRest, DeletedTask,
        NewColumnRest, RestBoard, UserRest, OpenDialogArgs, NewColumn
      } from '../../app.interfeces';
import { AppControlService } from 'src/app/services/app-control.service';

@Component({
  selector: 'app-board-content',
  templateUrl: './board-content.component.html',
  styleUrls: ['./board-content.component.scss'],
})
export class BoardContentComponent implements OnInit, OnDestroy {
  private subscribtions: Subscription[] = [];

  public currentBoardId: string = this.activeRoute.snapshot.params['id'];
  public currentBoard: RestBoard | undefined;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private restAPI: RestDataService,
    private localStorageService: LocalStorageService,
    private errorHandlerService: ErrorHandlerService,
    private confirmationService: ConfirmationService,
    private formService: AppFormsService,
    private appControlService: AppControlService,
  ) { }

  public ngOnInit(): void {
    this.startComponent();
    const subscr = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe({
        next: () => {
          if (this.currentBoardId !== this.activeRoute.snapshot.params['id']) {
            this.restartComponent();
          }
        }
      });

    this.subscribtions.push(subscr);
  }

  public ngOnDestroy(): void {
    this.subscribtions.forEach((subscr) => subscr.unsubscribe());
  }

  public get currentBoardTitle(): string {
    return (this.currentBoard)
      ? this.currentBoard.title
      : '';
  }

  public get columnsAmount(): number {
    return this.appColumns.length;
  }

  public get appColumns(): ColumnApp[] {
    return this.localStorageService.currentBoardColumns;
  }

  public set appColumns(columns: ColumnApp[]) {
    this.localStorageService.currentBoardColumns = columns;
  }

  public get isTaskDropDisabled(): boolean {
    return this.localStorageService.isTaskDropDisabled;
  }

  public startComponent(): void {
    this.localStorageService.clearColumns();
    this.updateBoardUsers();

    if (this.restAPI.isNewBoard) {
      this.restAPI.isNewBoard = false;
    } else {
      this.createBoardColumns();
    }

    this.updateBoardTitle();
  }

  public restartComponent(): void {
    this.currentBoardId = this.activeRoute.snapshot.params['id'];
    this.startComponent();
  }

  public updateBoardTitle(): void {
    this.restAPI.startProgress();

    const updateTitleObserver = {
      next: (board: RestBoard) => {
        this.currentBoard = board;
        this.restAPI.stopProgress();
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err);
        this.restAPI.stopProgress();
      },
      complete: () => {
        this.appControlService.checkChanges();
      }
    }

    const subscr = this.restAPI.getBoard(this.currentBoardId)
      .subscribe(updateTitleObserver);

    this.subscribtions.push(subscr);
  }

  public getExecutorName(task: TaskRest): string {
    if (!task.users.length) {
      this.errorHandlerService.handleError(new Error(`There is no executor in task "${task.title}"`));
    } else {
      const userObj = this.localStorageService.getCurrentBoardUserById(task.users[0]);
      if (userObj) {
        return userObj.name;
      }
    }

    return 'unknown';
  }

  public updateBoardUsers(): void {
    if (this.localStorageService.currentAppBoards.length) {
      this.localStorageService.updateCurrentBoardUsers(this.currentBoardId);
    } else {
      this.restAPI.startProgress();

      const updateBoardUsersObserver = {
        next: (restObj: RestBoard | UserRest[]) => {
          if (restObj.hasOwnProperty('length') ) {
            this.localStorageService.restUsers = restObj as UserRest[];
          } else {
            this.localStorageService.currentRestBoard = restObj as RestBoard;
          }
        },
        error: (err: Error) => {
          this.errorHandlerService.handleError(err);
          this.restAPI.stopProgress();
        },
        complete: () => {
          this.localStorageService.updateCurrentBoardUsers(this.currentBoardId);
          this.restAPI.stopProgress();
        }
      }

      const subscr = merge(this.restAPI.getBoard(this.currentBoardId),
        this.restAPI.getUsers()
      ).subscribe(updateBoardUsersObserver);

      this.subscribtions.push(subscr);
    }
  }

  public dropColumn(event: CdkDragDrop<ColumnApp[]>): void {
    if (this.isDropValid(event)) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this.restAPI.updateColumnsOrder();
    };
  }

  private getTasksSet(container: CdkDropList<TaskRest[]> | TaskRest[], newColumnId: string = ''): TaskSetRest[] {
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

  public deleteTask(taskId: string, columnId: string): void {
    const deletedTaskObj: DeletedTask = {
      taskId: taskId,
      columnId: columnId,
      boardId: this.currentBoardId,
    }

    const targetColumn = this.localStorageService.currentBoardColumns
      .find((column) => column._id === columnId);
    const updatedColumnTasks = targetColumn?.tasks.filter((task) => task._id !== taskId);
    const deleteOptions: OpenDialogArgs = {type: 'deleteTask', deletedTask: deletedTaskObj};

    if (updatedColumnTasks?.length) {
      deleteOptions.updatedTasks = this.getTasksSet(updatedColumnTasks);
    }

    this.confirmationService.openDialog(deleteOptions)
  }

  public dropTask(event: CdkDragDrop<TaskRest[]>, currentColumnId: string): void {
    let taskSet: TaskSetRest[] = [];

    if (this.isDropValid(event)) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      taskSet = this.getTasksSet(event.container);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

      taskSet = [
        ...this.getTasksSet(event.previousContainer),
        ...this.getTasksSet(event.container, currentColumnId)
      ];
    }

    if (taskSet) {
      this.restAPI.updateTaskSet(taskSet);
    }
  }

  public createBoardColumns(): void {
    this.restAPI.startProgress();

    const getColumnsObserver = {
      next: (columns: ColumnRest[]) => {
        this.localStorageService.restColumns = columns;
        this.fillColumnsWithTasks();
        this.restAPI.stopProgress();
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err);
        this.restAPI.stopProgress();
      },
    }

    const subscr = this.restAPI
      .getBoardColumns(this.currentBoardId)
      .subscribe(getColumnsObserver);

    this.subscribtions.push(subscr);
  }

  public fillColumnsWithTasks(): void {
    if (!this.localStorageService.restColumns.length) {
      return;
    }

    this.restAPI.startProgress();

    const tasksObserver = {
      next: (tasks: TaskRest[]) => {
        this.localStorageService.restTasks.push(...tasks);
      },
      error: (err: Error) => {
        this.errorHandlerService.handleError(err);
        this.restAPI.stopProgress();
      },
      complete: () => {
        this.localStorageService.updateBoardAppColumns();
        this.restAPI.stopProgress();
        this.appControlService.checkChanges();
      }
    }

    const observableTasksMap = this.localStorageService.restColumns
      .map((columnObj) => {
        return this.restAPI.getColumnTasks(columnObj.boardId, columnObj._id)
      });

    const subscr = merge(...observableTasksMap).
      subscribe(tasksObserver);

    this.subscribtions.push(subscr);

  }

  public createColumn(): void {
    const newColumnObj: NewColumn = {
      boardId: this.currentBoardId,
      columnOrder: this.columnsAmount,
    }

    this.confirmationService.openDialog({type: 'createColumn', newColumn: newColumnObj,})
  }

  public deleteColumn(columnId: string): void {
    const deletedColumnOption: DeletedColumnOption = {
      boardId: this.currentBoardId,
      columnId: columnId
    };

    this.confirmationService.openDialog({type: 'deleteColumn', deletedColumn: deletedColumnOption,})
  }

  public getTasksAmount(columnId: string): number {
    const column = this.appColumns
      .find((column) => column._id === columnId);

    return (column)
      ? column.tasks.length
      : 0;
  }

  public createTask(columnId: string): void {
    if (!columnId) {
      return;
    }

    const newTask: NewTaskOptions = {
      boardId: this.currentBoardId,
      columnId: columnId,
      order: this.getTasksAmount(columnId),
      userId: this.localStorageService.currentUserId,
    }

    this.confirmationService.openDialog({type: 'createTask', newTask})

  }

  public activateTitleInput(input: HTMLInputElement, column: ColumnApp): void {
    column.titleForm.controls['columnTitle'].enable();
    input.focus();

  }

  public disableTitleInput(column: ColumnApp): void {
    const formControl = column.titleForm.controls['columnTitle'];

    if (formControl.valid && (formControl.untouched || formControl.pristine)) {
      formControl.disable();
    }

  }

  public getErrorMessage(column: ColumnApp): string {
    return this.formService
      .getErrorMessage(column.titleForm, 'columnTitle')
  }

  public submitTitleChanges(event: Event, column: ColumnApp): void {
    event.preventDefault();
    const formControl = column.titleForm.controls['columnTitle'];

    if (formControl.valid) {
      if (formControl.dirty) {
        const columnObj: NewColumnRest = {
          title: formControl.value,
          order: column.order,
        }
        this.restAPI.updateColumnTitle(column.boardId, column._id, columnObj);
      }

      formControl.markAsUntouched();
      formControl.markAsPristine();
      this.disableTitleInput(column);
    }

  }

  public restoreTitleInputValue(column: ColumnApp): void {
    const formControl = column.titleForm.controls['columnTitle'];
    formControl.setValue(column.title);
    formControl.markAsUntouched();
    formControl.markAsPristine();

  }

  public editTask(event: Event, task: TaskRest): void {
    if (event.target) {
      if (!(event.target as HTMLElement).classList.contains('mat-mdc-button-touch-target')) {
        this.confirmationService.openDialog({type: 'editTask', editableTask: task});
      }
    }
  }

  private isDropValid(event: CdkDragDrop<ColumnApp[]> | CdkDragDrop<TaskRest[]>): boolean {
    return (event.previousContainer === event.container)
      && (event.previousIndex !== event.currentIndex);
  }

}
