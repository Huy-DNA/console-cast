import path from 'path-browserify';
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
  fileType: string;
}

export const fileService = {
  async getMetaOfFile(filename: string): Promise<Result<FileMeta, Diagnostic>> {
  },
  async getFileContent(filename: string): Promise<Result<Uint8Array, Diagnostic>> {
  },
  async updateFileContent(filename: string, content: Uint8Array): Promise<Result<null, Diagnostic>> {
  },
  async getFolderContent(filename: string): Promise<Result<FileMeta[], Diagnostic>> {
    const { cwd } = useCwdStore();
    const meta = await $fetch('/api/files/ls', {
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
    return new Ok(data.files.map((file) => ({
      name: path.basename(file.name),
      fullname: file.name,
      permission: file.permissionBits,
      ownerId: file.ownerId,
      groupId: file.groupId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      fileType: file.fileType,
    })));
  },
  async removeFile(filename: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    const res = await $fetch('/api/files', {
      method: 'delete',
      query: { name: cwd.value.resolve(filename).toString() },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    return new Ok(null);

  },
  async createFile(filename: string, content: string, permissionBits: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    const res = await $fetch('/api/files', {
      method: 'post',
      query: { name: cwd.value.resolve(filename).toString() },
      body: {
        content,
        permission_bits: permissionBits,
      },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    return new Ok(null);
  },
  async createFolder(filename: string, permissionBits: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    const res = await $fetch('/api/files', {
      method: 'post',
      query: { name: cwd.value.resolve(filename).toString() },
      body: {
        permission_bits: permissionBits,
      },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    return new Ok(null);
  },
  async changeDirectory(filename: string): Promise<Result<null, Diagnostic>> {
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
  async moveFile(src: string, dest: string, umask: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    const res = await $fetch('/api/files/mv', {
      method: 'post',
      body: {
        src: cwd.value.resolve(src).toString(),
        dest: cwd.value.resolve(dest).toString(),
        permission_bits: umask,
      },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    return new Ok(null);

  },
  async copyFile(src: string, dest: string, umask: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    const res = await $fetch('/api/files/cp', {
      method: 'post',
      body: {
        src: cwd.value.resolve(src).toString(),
        dest: cwd.value.resolve(dest).toString(),
        permission_bits: umask,
      },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    return new Ok(null);
  },
};
