import { FormControl, FormGroup } from "@angular/forms";

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

interface UserRestObj {
  _id: string,
  name: string,
  login: string,
}

interface NewBoardObj {
  title: string, // "Board title",
  owner: string, // "userId of owner",
  users: string[]
}

interface RestBoardObj {
  _id: string, // board id
  title: string, // "Board title",
  owner: string, // "userId of owner",
  users: string[]
}

interface AppBoardObj {
  _id: string, // board id
  title: string, // "Board title",
  owner: UserRestObj,
  users: UserRestObj[],
}

interface Participant {
  name: string;
}

interface NewColumnRestObj {
  title: string, // "Column title"
  order: number,
}

interface ColumnRestObj {
  _id: string, //"Column id"
  title: string, // "Column title"
  order: number,
  boardId: string, // "Id of boards"
}

interface TaskRestObj {
  _id: string, // "Task id"
  title: string, // "Task title"
  order: number,
  boardId: string, // "id of board"
  columnId: string, // "id of column"
  description: string, // "Task decription"
  userId: string, // "userId of task owner"
  users: string[], //  "Ids of responsible users"
}

interface ColumnAppObj extends ColumnRestObj {
  tasks: TaskRestObj[],
  titleForm: FormGroup,
}

interface PointRestObj {
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

interface ColumnSetRestObj {
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

interface TaskSetRestObj {
  _id: string,
  order: number,
  columnId: string,
}

interface TasksSetConfig {
  columnId: string,
  tasksColumn: TaskSetRestObj[],
}

interface DeletedTask extends DeletedColumnOption {
  taskId: string,
}

interface TaskDeletionOptions {
  deletedTask: DeletedTask,
  updatedTasks?: TaskSetRestObj[],
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
  updatedTasks?: TaskSetRestObj[],
  editableTask?: TaskRestObj,
  additionalHandler?: Function,
}

interface DeletedBoard {
  boardId: string,
  boardTitle: string,
  owner: string,
  rightToDelete: boolean
}

interface SearchTaskObj {
  restTask: TaskRestObj,
  description: string,
  owner: string,
  executor: string,
};

interface HandleConfirmObj {
  options: HandleConfirmOptions,
  callBack?: Function,
}

interface ObserverTemplate {
  next?: (value: any) => void,
  error?: (error: Error) => void,
  complete?: () => void,
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
  CurUserObj,
  TokenObj,
  NewUserObj,
  UserRestObj,
  NewBoardObj,
  RestBoardObj,
  AppBoardObj,
  Participant,
  ConfirmationTypes,
  NewColumnRestObj,
  ColumnRestObj,
  TaskRestObj,
  PointRestObj,
  ColumnAppObj,
  NewColumn,
  NewColumnOption,
  ColumnSetRestObj,
  DeletedColumnOption,
  NewTaskOptions,
  NewTaskObj,
  TaskSetRestObj,
  TasksSetConfig,
  DeletedTask,
  ColumnTitleInputObj,
  FormConrolTypes,
  OpenDialogArgs,
  DeletedBoard,
  HandleConfirmOptions,
  TaskDeletionOptions,
  EditableTask,
  SearchTaskObj,
  HandleConfirmObj,
  ObserverTemplate,
  FormGroupTypes,
}
