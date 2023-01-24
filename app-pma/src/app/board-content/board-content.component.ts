import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { merge } from 'rxjs';
import { Validators } from '@angular/forms';

import { RestDataService } from '../restAPI.service';
import { ColumnApiObj, ColumnAppObj, DeletedColumnOption, TaskApiObj, NewTaskOptions, TaskSetApiObj, DeletedTaskOption, ColumnTitleInputObj, NewColumnApiObj } from '../app.interfeces';
import { ErrorHandlerService } from '../errorHandler.service';
import { ConfirmationService } from '../confirmation.service';
import { LocalStorageService } from '../localStorage.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-board-content',
  templateUrl: './board-content.component.html',
  styleUrls: ['./board-content.component.scss']
})
export class BoardContentComponent {
  public currentBoardId: string;
  private formControlInputObjs: ColumnTitleInputObj[] = [];

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
  ) {
    this.localStorageService.clearColumns();
    this.currentBoardId = this.activeRoute.snapshot.params['id'];
    this.createBoardColumns();
  }

  get columnsAmount() {
    return this.appColumns.length;
  }

  get appColumns(): ColumnAppObj[] {
    return this.localStorageService.currentBoardColumns;
  }

  createTitleInputs(): void {
    console.log('input`s creation started');
    console.log(JSON.parse(JSON.stringify(this.appColumns)));
    const formControlInputs = this.appColumns.map((column) => {
      const formControl = new FormControl(column.title,
                          [
                            Validators.required,
                            Validators.minLength(this.validOptions.columnTitle.minLength),
                            Validators.maxLength(this.validOptions.columnTitle.maxLength),
                            Validators.pattern('[a-zA-Z_\.]*'),
                          ]);
      formControl.disable();
      return {
        columnId: column._id,
        formControl: formControl,
      }
    });

    this.formControlInputObjs = formControlInputs;
  }

  getFormControlTitleInput(column: ColumnAppObj) {
    if (this.formControlInputObjs.length) {
      const input = this.formControlInputObjs.find((inputObj) => inputObj.columnId === column._id);
      if (input) {
        return input.formControl;
      }
    }

    const newFormControl = new FormControl(column.title,
      [
        Validators.required,
        Validators.minLength(this.validOptions.columnTitle.minLength),
        Validators.maxLength(this.validOptions.columnTitle.maxLength),
        Validators.pattern('[a-zA-Z_\.]*'),
      ]);
      newFormControl.disable();

      const newFormControlObj: ColumnTitleInputObj  = {
        columnId: column._id,
        formControl: newFormControl,
      }
      this.formControlInputObjs.push(newFormControlObj);

    return newFormControl;
  }

  set appColumns(columns: ColumnAppObj[]) {
    this.localStorageService.currentBoardColumns = columns;
  }

  createFormControls() {
    if (!this.localStorageService.currentStorageBoards.length) {
      this.restAPI.updateBoardsStorage(this.createTitleInputs.bind(this));
    } else {
      this.createTitleInputs();
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
      const prevColumnId = getColumnId(event.previousContainer);
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

      if (prevColumnId && prevColumnId) {
        const updateConfigs = [
          {columnId: prevColumnId, tasksColumn: getTasksSet(event.previousContainer)},
          {columnId: currentColumnId, tasksColumn: getTasksSet(event.container, currentColumnId)}
        ];
        this.restAPI.updateTaskSet(updateConfigs);
      }

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
          this.localStorageService.apiTasks.push(tasks);
        },
        error: (err: Error) => {
          this.errorHandlerService.handleError(err)
        },
        complete: () => {
          this.localStorageService.trimApiTasks();
          this.localStorageService.updateBoardAppColumns();
          this.createFormControls();
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
      this.localStorageService.updateCurrentBoardUsers(this.currentBoardId);
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

  deleteTask(taskId: string, columnId: string): void {
    console.log('Delete task with id: ' + taskId);
    const deletedTaskOption: DeletedTaskOption = {
      taskId: taskId,
      columnId: columnId,
      boardId: this.currentBoardId,
    }
    this.confirmationService.openDialog({type: 'deleteTask', deletedTask: deletedTaskOption})
  }

  printElement(event: any, titleInput: any) {
    console.log(event);
    console.log(titleInput);
  }

  activateTitleInput(input: HTMLInputElement, column: ColumnAppObj) {
    this.getFormControlTitleInput(column).enable();
    input.focus();
  }

  disableTitleInput(column: ColumnAppObj, delay: number = 200) {
    const formControl = this.getFormControlTitleInput(column);
    if (formControl.valid) {
      setTimeout(()=> {
        console.log((formControl.untouched) ? 'untouched' : 'touched');
        console.log(formControl.value === column.title);
        if (formControl.untouched || formControl.pristine) {
          formControl.disable();
        }
      }, delay);
    }
  }

  getErrorMessage(optionName: string, column: ColumnAppObj) {
    const formControl = this.getFormControlTitleInput(column);
    const controlOption = this.validOptions[optionName as keyof typeof this.validOptions];
    const controlOptionName = controlOption.name;
    const formControlErrors = formControl.errors;

    switch(true) {
      case (!!formControlErrors?.['minlength']):
        return `Min length of ${controlOptionName} is ${controlOption.minLength} chars`;
      case (!!formControlErrors?.['maxlength']):
        return `Max length of ${controlOptionName} is ${controlOption.maxLength} chars`;
      case (!!formControlErrors?.['pattern']):
        return `Allowed symbols for ${controlOptionName} are "${controlOption.pattern}"`;
      default:
        return `Not a valid ${optionName}`;
    };
  }

  submitTitleChanges(column: ColumnAppObj): void {
    console.log('submited');
    const formControl = this.getFormControlTitleInput(column);

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

    console.log((formControl.untouched) ? 'untouched' : 'touched');
  }

  restoreTitleInputValue(column: ColumnAppObj) {
    const formControl = this.getFormControlTitleInput(column);
    formControl.setValue(column.title);
    formControl.markAsUntouched();
    formControl.markAsPristine();
  }

}
