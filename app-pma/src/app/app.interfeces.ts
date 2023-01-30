import { FormControl } from "@angular/forms";

interface CurUserObj {
  login: string,
  token: string,
}

interface TokenObj {
  token: string;
}

interface NewUserObj {
  name: string,
  login: string,
  password: string,
}

interface UserApiObj {
  _id: string,
  name: string,
  login: string,
}

interface NewBoardObj {
  title: string, // "Board title",
  owner: string, // "userId of owner",
  users: string[]
}

interface ApiBoardObj {
  _id: string, // board id
  title: string, // "Board title",
  owner: string, // "userId of owner",
  users: string[]
}

interface AppBoardObj {
  _id: string, // board id
  title: string, // "Board title",
  owner: UserApiObj,
  users: UserApiObj[],
}

interface Participant {
  name: string;
}

interface NewColumnApiObj {
  title: string, // "Column title"
  order: number,
}

interface ColumnApiObj {
  _id: string, //"Column id"
  title: string, // "Column title"
  order: number,
  boardId: string, // "Id of boards"
}

interface TaskApiObj {
  _id: string, // "Task id"
  title: string, // "Task title"
  order: number,
  boardId: string, // "id of board"
  columnId: string, // "id of column"
  description: string, // "Task decription"
  userId: string, // "userId of task owner"
  users: string[], //  "Ids of responsible users"
}

interface ColumnAppObj extends ColumnApiObj {
  tasks: TaskApiObj[],
  titleFormControl: FormControl,
}

interface PointApiObj {
  _id: number, // "Point id",
  title: string, // "Point title",
  taskId: string, // "Id of task",
  boardId: string, // "Id of board",
  done: boolean
}

interface NewColumn {
  boardID: string,
  columnOrder: number,
}

interface ColumnSetApiObj {
  _id: string,
  order: number,
}

interface NewColumnOption extends NewColumn {
  columnTitle: string,
}

interface DeletedColumnOption {
  boardId: string,
  columnId: string,
}

interface NewTaskOptions extends DeletedColumnOption {
  order: number,
  userId: string,
}

interface NewTaskObj {
  title: string,
  order: number,
  description: string,
  userId: string,
  users: string[],
}

interface EditableTask extends NewTaskObj {
  columnId: string,
}

interface TaskSetApiObj {
  _id: string,
  order: number,
  columnId: string,
}

interface TasksSetConfig {
  columnId: string,
  tasksColumn: TaskSetApiObj[],
}

interface DeletedTask extends DeletedColumnOption {
  taskId: string,
}

interface TaskDeletionOptions {
  deletedTask: DeletedTask,
  updatedTasks?: TaskSetApiObj[],
}

interface ColumnTitleInputObj {
  columnId: string,
  formControl: FormControl,
}

interface OpenDialogArgs {
  type: ConfirmationTypes,
  deletedBoard?: DeletedBoard,
  newColumn?: NewColumn,
  deletedColumn?: DeletedColumnOption,
  newTask?: NewTaskOptions,
  deletedTask?: DeletedTask,
  updatedTasks?: TaskSetApiObj[],
  editableTask?: TaskApiObj,
}

interface DeletedBoard {
  boardId: string,
  boardTitle: string,
  owner: string,
  rightToDelete: boolean
}

type HandleConfirmOptions = NewColumn
                            | DeletedColumnOption
                            | NewTaskOptions
                            | TaskDeletionOptions;


type ConfirmationTypes = 'default'
                        | 'createBoard'
                        | 'deleteBoard'
                        | 'deleteUser'
                        | 'createColumn'
                        | 'deleteColumn'
                        | 'createTask'
                        | 'deleteTask'
                        | 'editTask';

type FormConrolTypes = 'columnTitle'
                      | 'boardTitle'
                      | 'taskTitle'
                      | 'taskDescription'
                      | 'taskExecutor'
                      | 'login'
                      | 'password'
                      | 'newPassword'
                      | 'repeatedPassword'
                      | 'userName';

export {
  CurUserObj,
  TokenObj,
  NewUserObj,
  UserApiObj,
  NewBoardObj,
  ApiBoardObj,
  AppBoardObj,
  Participant,
  ConfirmationTypes,
  NewColumnApiObj,
  ColumnApiObj,
  TaskApiObj,
  PointApiObj,
  ColumnAppObj,
  NewColumn,
  NewColumnOption,
  ColumnSetApiObj,
  DeletedColumnOption,
  NewTaskOptions,
  NewTaskObj,
  TaskSetApiObj,
  TasksSetConfig,
  DeletedTask,
  ColumnTitleInputObj,
  FormConrolTypes,
  OpenDialogArgs,
  DeletedBoard,
  HandleConfirmOptions,
  TaskDeletionOptions,
  EditableTask
}
