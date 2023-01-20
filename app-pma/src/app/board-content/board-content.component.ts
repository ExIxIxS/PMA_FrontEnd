import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { merge } from 'rxjs';

import { RestDataService } from '../restAPI.service';
import { ColumnApiObj, ColumnAppObj, ColumnSetApiObj, DeletedColumnOption, TaskApiObj, NewTaskObj, NewTaskOptions, TaskSetApiObj } from '../app.interfeces';
import { ErrorHandlerService } from '../errorHandler.service';
import { ConfirmationService } from '../confirmation.service';
import { LocalStorageService } from '../localStorage.service';

@Component({
  selector: 'app-board-content',
  templateUrl: './board-content.component.html',
  styleUrls: ['./board-content.component.scss']
})
export class BoardContentComponent {
  public currentBoardId: string;

  constructor(private activeRoute: ActivatedRoute,
              private restAPI: RestDataService,
              private localStorageService: LocalStorageService,
              private errorHandlerService: ErrorHandlerService,
              private confirmationService: ConfirmationService,
  ) {
    this.localStorageService.clearColumns();
    this.currentBoardId = this.activeRoute.snapshot.params['id'];
    this.getBoardColumns();
  }

  get columnsAmount() {
    return this.appColumns.length;
  }

  get appColumns() {
    return this.localStorageService.currentBoardColumns;
  }

  set appColumns(columns: ColumnAppObj[]) {
    this.localStorageService.currentBoardColumns = columns;
  }

  dropColumn(event: CdkDragDrop<ColumnAppObj[]>): void {
    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this.restAPI.updateColumnsOrder();
      }
    };
  }

  dropTask(event: CdkDragDrop<TaskApiObj[]>, currentColumnId: string): void {
    function getTasksSet(container: typeof event.container, newColumnId: string = ''): TaskSetApiObj[] {
      return container.data.map((task, index) => {
          return {
                  _id: task._id,
                  order: index,
                  columnId: (newColumnId) ? newColumnId : task.columnId,
                }
        });
    }

    function getColumnId(container: typeof event.container): string | undefined {
      if (container.data.length) {
        return container.data[0].columnId;
      }

      return;
    }

    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

        const tasksSet = getTasksSet(event.container);
        const columnId = getColumnId(event.container);
        if (columnId && tasksSet) {
          const updateConfigs = [{columnId: columnId, tasksColumn: tasksSet}];
          this.restAPI.updateTaskSet(updateConfigs);
        }
      }
    } else {
      console.log(event);
      const prevColumnId = getColumnId(event.previousContainer);
      console.log('Prev Tasks Columns Ids');
      console.log(event.previousContainer.data.map((tasks) => tasks.columnId));
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

      console.log(event.previousContainer.data);
      console.log('prevColumnId -->' + prevColumnId);
      console.log('currentColumnId' + currentColumnId);
      if (prevColumnId && prevColumnId) {
        const updateConfigs = [
          {columnId: prevColumnId, tasksColumn: getTasksSet(event.previousContainer)},
          {columnId: currentColumnId, tasksColumn: getTasksSet(event.container, currentColumnId)}
        ];
        console.log('updateConfigs');
        console.log(updateConfigs);
        this.restAPI.updateTaskSet(updateConfigs);
      }

    }
  }

  getBoardColumns() {
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
          this.localStorageService.apiTasks.push(tasks);
        },
        error: (err: Error) => {
          this.errorHandlerService.handleError(err)
        },
        complete: () => {
          this.localStorageService.trimApiTasks();
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
          users: this.localStorageService.getCurrentBoardUsersId(this.currentBoardId),
        }

      this.confirmationService.openDialog({type: 'createTask', newTask})
    }
  }

  get isTaskDropDisabled() {
    return this.localStorageService.isTaskDropDisabled;
  }

}
