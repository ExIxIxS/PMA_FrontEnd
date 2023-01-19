interface CurUserObj {
  login: string,
  token: string,
}

interface TokenObj {
  token: string;
}

interface UserObj {
  _id: string,
  name: string,
  login: string,
}

interface NewBoardObj {
  title: string, // "Board title",
  owner: string, // "userId of owner",
  users: string[]
}

interface BoardObj {
  _id: string, // board id
  title: string, // "Board title",
  owner: string, // "userId of owner",
  users: string[]
}

interface BoardObjStorage {
  _id: string, // board id
  title: string, // "Board title",
  owner: UserObj,
  users: UserObj[],
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

type ConfirmationTypes = 'default'
                        | 'createBoard'
                        | 'deleteBoard'
                        | 'deleteUser'
                        | 'createColumn'
                        | 'deleteColumn'
                        | 'createTask'
                        | 'deleteTask';

export {
  CurUserObj,
  TokenObj,
  UserObj,
  NewBoardObj,
  BoardObj,
  Participant,
  ConfirmationTypes,
  BoardObjStorage,
  NewColumnApiObj,
  ColumnApiObj,
  TaskApiObj,
  PointApiObj,
  ColumnAppObj,
  NewColumn,
  NewColumnOption,
  ColumnSetApiObj,
  DeletedColumnOption,
}
