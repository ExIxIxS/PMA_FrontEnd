import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { merge } from 'rxjs';

import { RestDataService } from '../restAPI.service';
import { ColumnApiObj, ColumnAppObj, ColumnSetApiObj, DeletedColumnOption, TaskApiObj } from '../app.interfeces';
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
      console.log('move drop');
      console.log(event.container.data);
      console.log(event.previousIndex);
      console.log(event.currentIndex);
      if (event.previousIndex !== event.currentIndex) {
        console.log('moving');
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this.restAPI.updateColumnsOrder();
      }
    };
  }

  dropTask(event: CdkDragDrop<TaskApiObj[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
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

}
