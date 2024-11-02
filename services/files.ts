import { Err, Ok, type Diagnostic, type Result } from './types';

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

export const fileService = {
  async getMetaOfFile (filename: string): Promise<Result<FileMeta, Diagnostic>> {
  },
  async getFileContent (filename: string): Promise<Result<Uint8Array, Diagnostic>> {
  },
  async updateFileContent (filename: string, content: Uint8Array): Promise<Result<null, Diagnostic>> {
  },
  async getFolderContent (filename: string): Promise<Result<FileMeta[], Diagnostic>> {
  },
  async removeFile (filename: string): Promise<Result<null, Diagnostic>> {
  },
  async createFile (filename: string): Promise<Result<null, Diagnostic>> {
  },
  async changeDirectory (filename: string): Promise<Result<null, Diagnostic>> {
    try {
      const { cwd, switchCwd } = useCwdStore();
      const meta = await $fetch('/api/files', {
        method: 'get',
        query: {
          name: cwd.value.resolve(filename).toString(),
        },
        credentials: 'include',
      });
      if (meta.error) {
        return new Err({ code: meta.error.code, message: meta.error.message });
      }
      const { ok: { data } } = meta;
      if (data.fileType !== 'directory') {
        return new Err({ code: 1, message: 'Expected a directory' });
      }
      switchCwd(filename);
      return new Ok(null);
    } catch {
      return new Err({ code: 500, message: 'Network connection error' });
    }
  },
  async moveFile (filename: string, destination: string): Promise<Result<null, Diagnostic>> {
  },
  async copyFile (filename: string, destination: string): Promise<Result<null, Diagnostic>> {
  },
  async currentDirectory (): Promise<Result<string, Diagnostic>> {
  },
};
