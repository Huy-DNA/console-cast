import type { Diagnostic, Result } from './types';

export enum UserKind {
  OWNER = 'owner',
  GROUP = 'group',
  OTHER = 'other',
}

export enum NormalPermissionKind {
  READ = 'read',
  WRITE = 'write',
  EXECUTE = 'execute',
}

export enum SuperPermissionKind {
  STICKY = 'sticky',
  SETUID = 'setuid',
  SETGID = 'setgid',
}

export type FilePermission =
  Record<SuperPermissionKind, boolean>
  & Record<UserKind, Record<SuperPermissionKind, boolean>>;

export interface FileMeta {
  name: string;
  fullName: string;
  permission: FilePermission;
  ownerId: number;
  groupId: number;
  createdAt: Date;
  updatedAt: Date;
}

const state = { 
};

export const fileService = {
  async getMetaOfFile (filename: string): Promise<Result<FileMeta, Diagnostic>> {
  },
  async getFileContent (filename: string): Promise<Result<Uint8Array, Diagnostic>> {
  },
  async getFolderContent (filename: string): Promise<Result<FileMeta[], Diagnostic>> {
  },
  async removeFile (filename: string): Promise<Result<null, Diagnostic>> {
  },
  async createFile (filename: string): Promise<Result<null, Diagnostic>> {
  },
  async changeDirectory (filename: string): Promise<Result<null, Diagnostic>> {
  },
  async moveFile (filename: string, destination: string): Promise<Result<null, Diagnostic>> {
  },
  async copyFile (filename: string, destination: string): Promise<Result<null, Diagnostic>> {
  },
  async currentDirectory (): Promise<Result<string, Diagnostic>> {
  },
};
