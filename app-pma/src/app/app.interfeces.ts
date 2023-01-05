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

interface Participant {
  name: string;
}

type ConfirmationTypes = 'default' | 'createBoard';

export {
  CurUserObj,
  TokenObj,
  UserObj,
  NewBoardObj,
  BoardObj,
  Participant,
  ConfirmationTypes,
  }
