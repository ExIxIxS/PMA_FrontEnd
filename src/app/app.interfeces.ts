import { HttpHeaders } from "@angular/common/http";
import { FormControl, FormGroup } from "@angular/forms";

interface CurUser {
  login: string,
  token: string,
}

interface Token {
  token: string;
}

interface NewUser {
  name: string,
  login: string,
  password: string,
}

interface UserRest {
  _id: string,
  name: string,
  login: string,
}

interface NewBoard {
  title: string, // "Board title",
  owner: string, // "userId of owner",
  users: string[]
}

interface RestBoard {
  _id: string, // board id
  title: string, // "Board title",
  owner: string, // "userId of owner",
  users: string[]
}

interface AdaptedBoard extends Pick<RestBoard, '_id' | 'title' | 'owner'> {
  users: string,
}

interface AppBoard {
  _id: string, // board id
  title: string, // "Board title",
  owner: UserRest,
  users: UserRest[],
}

interface Participant {
  name: string;
}

interface NewColumnRest {
  title: string, // "Column title"
  order: number,
}

interface ColumnRest {
  _id: string, //"Column id"
  title: string, // "Column title"
  order: number,
  boardId: string, // "Id of boards"
}

interface TaskRest {
  _id: string, // "Task id"
  title: string, // "Task title"
  order: number,
  boardId: string, // "id of board"
  columnId: string, // "id of column"
  description: string, // "Task decription"
  userId: string, // "userId of task owner"
  users: string[], //  "Ids of responsible users"
}

interface ColumnApp extends ColumnRest {
  tasks: TaskRest[],
  titleForm: FormGroup,
}

interface PointRest {
  _id: number, // "Point id",
  title: string, // "Point title",
  taskId: string, // "Id of task",
  boardId: string, // "Id of board",
  done: boolean
}

interface NewColumn {
  boardId: string,
  columnOrder: number,
}

interface NewColumnOption extends NewColumn {
  columnTitle: string,
}

interface ColumnSetRest {
  _id: string,
  order: number,
}

interface DeletedColumnOption {
  boardId: string,
  columnId: string,
}

interface NewTaskOptions extends DeletedColumnOption {
  order: number,
  userId: string,
}

interface NewTask {
  title: string,
  order: number,
  description: string,
  userId: string,
  users: string[],
}

interface EditableTask extends NewTask {
  columnId: string,
}

interface TaskSetRest {
  _id: string,
  order: number,
  columnId: string,
}

interface TasksSetConfig {
  columnId: string,
  tasksColumn: TaskSetRest[],
}

interface DeletedTask extends DeletedColumnOption {
  taskId: string,
}

interface TaskDeletionOptions {
  deletedTask: DeletedTask,
  updatedTasks?: TaskSetRest[],
}

interface ColumnTitleInput {
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
  updatedTasks?: TaskSetRest[],
  editableTask?: TaskRest,
  additionalHandler?: Function,
}

interface DeletedBoard {
  boardId: string,
  boardTitle: string,
  owner: string,
  rightToDelete: boolean
}

interface SearchTask {
  restTask: TaskRest,
  description: string,
  owner: string,
  executor: string,
};

interface HandleConfirm {
  options: HandleConfirmOptions,
  callBack?: Function,
}

interface ObserverTemplate {
  next?: (value: any) => void,
  error?: (error: Error) => void,
  complete?: () => void,
}

interface ValidOption {
  title: string,
  minLength: number,
  maxLength: number,
  pattern: RegExp | string,
  patternError?: string,
}

interface ValidOptions {
  [key: string]: ValidOption
}

interface RestHeaders {
  headers: HttpHeaders,
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
                      | 'userName'
                      | 'searchRequest';

type FormGroupTypes = 'taskForm'
                    | 'singIn'
                    | 'singUp'
                    | 'editUser'
                    | 'columnTitle'
                    | 'newBoard';

export {
  CurUser,
  Token,
  NewUser,
  UserRest,
  NewBoard,
  RestBoard,
  AppBoard,
  Participant,
  ConfirmationTypes,
  NewColumnRest,
  ColumnRest,
  TaskRest,
  PointRest,
  ColumnApp,
  NewColumn,
  NewColumnOption,
  ColumnSetRest,
  DeletedColumnOption,
  NewTaskOptions,
  NewTask,
  TaskSetRest,
  TasksSetConfig,
  DeletedTask,
  ColumnTitleInput,
  FormConrolTypes,
  OpenDialogArgs,
  DeletedBoard,
  HandleConfirmOptions,
  TaskDeletionOptions,
  EditableTask,
  SearchTask,
  HandleConfirm,
  ObserverTemplate,
  FormGroupTypes,
  ValidOption,
  ValidOptions,
  RestHeaders,
  AdaptedBoard,
}
