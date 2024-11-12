// Initially, each response code is local to each api
// However, have to move it here as Nuxt disallows
// importing code from `server` to `Vue` part.

export enum LoginErrorCode {
  INVALID_BODY = 1000,
  INVALID_CRED = 1001,
  UNKNOWN_ERROR = 2000,
}

export enum RegisterErrorCode {
  INVALID_BODY = 1000,
  USER_ALREADY_EXISTS = 1001,
  PASSWORD_TOO_SHORT = 1002,
  INVALID_USER_NAME = 1003,
  UNKNOWN_ERROR = 2000,
}

export enum FileContentGetErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  FILE_NOT_FOUND = 3000,
}

export enum FileContentPatchErrorCode {
  INVALID_PARAM = 1000,
  INVALID_BODY = 1001,
  NOT_ENOUGH_PRIVILEGE = 2000,
  FILE_NOT_FOUND = 3000,
}

export enum FileCpErrorCode {
  INVALID_PARAM = 1000,
  INVALID_BODY = 1001,
  NOT_ENOUGH_PRIVILEGE = 2000,
  SRC_NOT_FOUND = 3000,
  DEST_NOT_FOUND = 3001,
  INVALID_COPY_FOLDER_TO_FILE = 3002,
}

export enum FileDeleteErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  FILE_NOT_FOUND = 3000,
}

export enum FileMetaGetErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  FILE_NOT_FOUND = 3000,
}

export enum FileMetaPatchErrorCode {
  INVALID_PARAM = 1000,
  INVALID_BODY = 1001,
  NOT_ENOUGH_PRIVILEGE = 2000,
  FILE_NOT_FOUND = 3000,
  DESTINATION_NOT_EXIST = 3001,
  SOURCE_NOT_EXIST = 3002,
}

export enum FilePostErrorCode {
  INVALID_PARAM = 1000,
  INVALID_BODY = 1001,
  NOT_ENOUGH_PRIVILEGE = 2000,
  INVALID_FOLDER = 3000,
  FILE_ALREADY_EXISTS = 3001,
}

export enum FileLsErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  FILE_NOT_FOUND = 3000,
}

export enum FileMvErrorCode {
  INVALID_PARAM = 1000,
  INVALID_BODY = 1001,
  NOT_ENOUGH_PRIVILEGE = 2000,
  SRC_NOT_FOUND = 3000,
  DEST_NOT_FOUND = 3001,
  INVALID_MV_FOLDER_TO_FILE = 3002,
}

export enum GroupGetErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  GROUP_NOT_FOUND = 3000,
}

export enum UserDeleteErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  UNDELETABLE_USER = 2001,
}

export enum UserGetErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  USER_NOT_FOUND = 3000,
}
