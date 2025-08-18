import path from 'path-browserify';
import { Err, Ok, type Diagnostic, type Result } from './types';
import type { VirtualPath } from '~/utils/path';

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
  ownerName: string;
  groupId: number;
  groupName: string;
  createdAt: Date;
  updatedAt: Date;
  fileType: string;
}

export const fileService = {
  async getFileContent (filename: string): Promise<Result<string, Diagnostic>> {
    const { cwd } = useCwdStore();
    try {
      const res = await $fetch('/api/files/content', {
        method: 'get',
        query: { name: cwd.value.resolve(filename).toString() },
        credentials: 'include',
        onResponseError ({ response }) {
          throw new Err({ message: response._data?.error?.message || 'Failed to fetch file content' });
        },
      });
      return new Ok(res.ok.data.content);
    } catch (error) {
      if (error instanceof Err) {
        return error;
      }
      return new Err({ message: 'Network connection error' });
    }
  },

  async writeFileContent (filename: string, content: string): Promise<Result<null, Diagnostic>> {
    const { umask } = useUmaskStore();
    const createResult = await fileService.createFile(filename, '', umask.value);
    if (!createResult.isOk()) {
      return createResult;
    }
    const { cwd } = useCwdStore();
    try {
      await $fetch('/api/files/content', {
        method: 'patch',
        query: { name: cwd.value.resolve(filename).toString() },
        body: {
          content,
          shouldAppend: false,
        },
        credentials: 'include',
        onResponseError ({ response }) {
          throw new Err({ message: response._data?.error?.message || 'Failed to write file content' });
        },
      });
      return new Ok(null);
    } catch (error) {
      if (error instanceof Err) {
        return error;
      }
      return new Err({ message: 'Network connection error' });
    }
  },

  async appendFileContent (filename: string, content: string): Promise<Result<null, Diagnostic>> {
    const { umask } = useUmaskStore();
    const createResult = await fileService.createFile(filename, '', umask.value);
    if (!createResult.isOk()) {
      return createResult;
    }
    const { cwd } = useCwdStore();
    try {
      await $fetch('/api/files/content', {
        method: 'patch',
        query: { name: cwd.value.resolve(filename).toString() },
        body: {
          content,
          shouldAppend: true,
        },
        credentials: 'include',
        onResponseError ({ response }) {
          throw new Err({ message: response._data?.error?.message || 'Failed to append file content' });
        },
      });
      return new Ok(null);
    } catch (error) {
      if (error instanceof Err) {
        return error;
      }
      return new Err({ message: 'Network connection error' });
    }
  },

  async getFolderContent (filename: string): Promise<Result<FileMeta[], Diagnostic>> {
    const { cwd } = useCwdStore();
    try {
      const res = await $fetch('/api/files/ls', {
        method: 'get',
        query: { name: cwd.value.resolve(filename).toString() },
        credentials: 'include',
        onResponseError ({ response }) {
          throw new Err({ message: response._data?.error?.message || 'Failed to fetch folder content' });
        },
      });
      return new Ok(res.ok.data.files.map((file: any) => ({
        name: path.basename(file.name),
        fullName: file.name,
        permission: file.permissionBits,
        ownerId: file.ownerId,
        ownerName: file.ownerName,
        groupId: file.groupId,
        groupName: file.groupName,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        fileType: file.fileType,
      })));
    } catch (error) {
      if (error instanceof Err) {
        return error;
      }
      return new Err({ message: 'Network connection error' });
    }
  },

  async removeFile (filename: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    const resolvedPath = cwd.value.resolve(filename);
    if (resolvedPath.isAncestor(cwd.value as VirtualPath)) {
      return new Err({ message: 'Cannot remove ancestor folder' });
    }
    try {
      await $fetch('/api/files', {
        method: 'delete',
        query: { name: resolvedPath.toString() },
        credentials: 'include',
        onResponseError ({ response }) {
          throw new Err({ message: response._data?.error?.message || 'Failed to remove file' });
        },
      });
      return new Ok(null);
    } catch (error) {
      if (error instanceof Err) {
        return error;
      }
      return new Err({ message: 'Network connection error' });
    }
  },

  async createFile (filename: string, content: string, permissionBits: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    try {
      await $fetch('/api/files', {
        method: 'post',
        query: { name: cwd.value.resolve(filename).toString() },
        body: { content, permission_bits: permissionBits },
        credentials: 'include',
        onResponseError ({ response }) {
          throw new Err({ message: response._data?.error?.message || 'Failed to create file' });
        },
      });
      return new Ok(null);
    } catch (error) {
      if (error instanceof Err) {
        return error;
      }
      return new Err({ message: 'Network connection error' });
    }
  },

  async createFolder (filename: string, permissionBits: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    try {
      await $fetch('/api/files', {
        method: 'post',
        query: { name: cwd.value.resolve(filename).toString() },
        body: { permission_bits: permissionBits },
        credentials: 'include',
        onResponseError ({ response }) {
          throw new Err({ message: response._data?.error?.message || 'Failed to create folder' });
        },
      });
      return new Ok(null);
    } catch (error) {
      if (error instanceof Err) {
        return error;
      }
      return new Err({ message: 'Network connection error' });
    }
  },

  async changeDirectory (filename: string): Promise<Result<null, Diagnostic>> {
    const { cwd, switchCwd } = useCwdStore();
    try {
      const res = await $fetch('/api/files', {
        method: 'get',
        query: { name: cwd.value.resolve(filename).toString() },
        credentials: 'include',
        onResponseError ({ response }) {
          throw new Err({ message: response._data?.error?.message || 'Failed to fetch directory' });
        },
      });
      if (res.ok.data.fileType !== 'directory') {
        return new Err({ message: 'Expected a directory' });
      }
      switchCwd(filename);
      return new Ok(null);
    } catch (error) {
      if (error instanceof Err) {
        return error;
      }
      return new Err({ message: 'Network connection error' });
    }
  },

  async moveFile (src: string, dest: string, umask: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    const resolvedSrc = cwd.value.resolve(src);
    const resolvedDest = cwd.value.resolve(dest);
    if (resolvedSrc.isAncestor(cwd.value as VirtualPath)) {
      return new Err({ message: 'Cannot move ancestor folder' });
    }
    if (resolvedSrc.isAncestor(resolvedDest)) {
      return new Err({ message: 'Cannot move a folder to its descendant' });
    }
    try {
      await $fetch('/api/files/mv', {
        method: 'post',
        body: {
          src: resolvedSrc.toString(),
          dest: resolvedDest.toString(),
          permission_bits: umask,
        },
        credentials: 'include',
        onResponseError ({ response }) {
          throw new Err({ message: response._data?.error?.message || 'Failed to move file' });
        },
      });
      return new Ok(null);
    } catch (error) {
      if (error instanceof Err) {
        return error;
      }
      return new Err({ message: 'Network connection error' });
    }
  },

  async copyFile (src: string, dest: string, umask: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    const resolvedSrc = cwd.value.resolve(src);
    const resolvedDest = cwd.value.resolve(dest);
    if (resolvedSrc.isAncestor(resolvedDest)) {
      return new Err({ message: 'Cannot copy a folder to its descendant' });
    }
    try {
      await $fetch('/api/files/cp', {
        method: 'post',
        body: {
          src: resolvedSrc.toString(),
          dest: resolvedDest.toString(),
          permission_bits: umask,
        },
        credentials: 'include',
        onResponseError ({ response }) {
          throw new Err({ message: response._data?.error?.message || 'Failed to copy file' });
        },
      });
      return new Ok(null);
    } catch (error) {
      if (error instanceof Err) {
        return error;
      }
      return new Err({ message: 'Network connection error' });
    }
  },

  async getFileSize (pathname: string): Promise<Result<number, Diagnostic>> {
    const { cwd } = useCwdStore();
    try {
      const res = await $fetch('/api/files/size', {
        method: 'get',
        query: { name: cwd.value.resolve(pathname).toString() },
        credentials: 'include',
        onResponseError ({ response }) {
          throw new Err({ message: response._data?.error?.message || 'Failed to fetch file size' });
        },
      });
      return new Ok(res.ok.data.size);
    } catch (error) {
      if (error instanceof Err) {
        return error;
      }
      return new Err({ message: 'Network connection error' });
    }
  },
};
