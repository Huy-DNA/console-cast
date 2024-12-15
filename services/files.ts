import path from 'path-browserify';
import { Err, Ok, type Diagnostic, type Result } from './types';
import { FilePostErrorCode } from '~/lib';
import type { VirtualPath } from '~/lib/path';

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
    const res = await $fetch('/api/files/content', {
      method: 'get',
      query: { name: cwd.value.resolve(filename).toString() },
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    const { ok: { data } } = res;
    return new Ok(data.content);
  },
  // FIXME: Possible race condition if multiple modifications happen on a file
  async writeFileContent (filename: string, content: string): Promise<Result<null, Diagnostic>> {
    const { umask } = useUmaskStore();
    const createRes = await fileService.createFile(filename, '', umask.value);
    if (!createRes.isOk() && createRes.error()!.code === FilePostErrorCode.INVALID_FOLDER) {
      return createRes;
    }
    const { cwd } = useCwdStore();
    const res = await $fetch('/api/files/content', {
      method: 'patch',
      query: { name: cwd.value.resolve(filename).toString() },
      body: {
        content,
        shouldAppend: false,
      },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    return new Ok(null);
  },
  // FIXME: Possible race condition if multiple modifications happen on a file
  async appendFileContent (filename: string, content: string): Promise<Result<null, Diagnostic>> {
    const { umask } = useUmaskStore();
    const createRes = await fileService.createFile(filename, '', umask.value);
    if (!createRes.isOk() && createRes.error()!.code === FilePostErrorCode.INVALID_FOLDER) {
      return createRes;
    }
    const { cwd } = useCwdStore();
    const res = await $fetch('/api/files/content', {
      method: 'patch',
      query: { name: cwd.value.resolve(filename).toString() },
      body: {
        content,
        shouldAppend: true,
      },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    return new Ok(null);
  },
  async getFolderContent (filename: string): Promise<Result<FileMeta[], Diagnostic>> {
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
      ownerName: file.ownerName,
      groupName: file.groupName,
    })));
  },
  async removeFile (filename: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    const resolvedPath = cwd.value.resolve(filename);
    if (resolvedPath.isAncestor(cwd.value as VirtualPath)) {
      return new Err({ code: 1, message: 'Cannot remove ancestor folder' });
    }
    const res = await $fetch('/api/files', {
      method: 'delete',
      query: { name: resolvedPath.toString() },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    return new Ok(null);

  },
  async createFile (filename: string, content: string, permissionBits: string): Promise<Result<null, Diagnostic>> {
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
  async createFolder (filename: string, permissionBits: string): Promise<Result<null, Diagnostic>> {
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
  async moveFile (src: string, dest: string, umask: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    const resolvedSrc = cwd.value.resolve(src);
    const resolvedDest = cwd.value.resolve(dest);
    if (resolvedSrc.isAncestor(cwd.value as VirtualPath)) {
      return new Err({ code: 1, message: 'Cannot move ancestor folder' });
    }
    if (resolvedSrc.isAncestor(resolvedDest)) {
      return new Err({ code: 1, message: 'Cannot move a folder to its descendant' });
    }
    const res = await $fetch('/api/files/mv', {
      method: 'post',
      body: {
        src: resolvedSrc.toString(),
        dest: resolvedDest.toString(),
        permission_bits: umask,
      },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    return new Ok(null);

  },
  async copyFile (src: string, dest: string, umask: string): Promise<Result<null, Diagnostic>> {
    const { cwd } = useCwdStore();
    const resolvedSrc = cwd.value.resolve(src);
    const resolvedDest = cwd.value.resolve(dest);
    if (resolvedSrc.isAncestor(resolvedDest)) {
      return new Err({ code: 1, message: 'Cannot copy a folder to its descendant' });
    }
    const res = await $fetch('/api/files/cp', {
      method: 'post',
      body: {
        src: resolvedSrc.toString(),
        dest: resolvedDest.toString(),
        permission_bits: umask,
      },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    return new Ok(null);
  },
  async getFileSize (pathname: string): Promise<Result<number, Diagnostic>> {
    const { cwd } = useCwdStore();
    const res = await $fetch('/api/files/size', {
      method: 'get',
      query: { name: cwd.value.resolve(pathname).toString() },
      credentials: 'include',
    });
    if (res.error) {
      return new Err({ code: res.error.code, message: res.error.message });
    }
    return new Ok(res.ok.data.size);
  }
};
