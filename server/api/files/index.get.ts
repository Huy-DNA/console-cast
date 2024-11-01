import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { AccessType, canAccess, FileType, getParentDir, normalizePathname } from '~/server/utils';

export enum FileMetaGetErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  FILE_NOT_FOUND = 3000,
}

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: FileMetaGetErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    return { error: { code: FileMetaGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const fileName = normalizePathname(name);
  const containerDirName = getParentDir(fileName);
  try {
    const { permission_bits: containerDirPermissionBits, owner_id: containerDirOwnerId, group_id: containerDirGroupId } = await db.selectExactlyOne('files', { name: containerDirName, file_type: 'directory' }).run(dbPool);
    if (
      !canAccess(
        { userId: event.context.auth.userid as number, groupId: event.context.auth.groupid as number },
        { fileType: FileType.DIRECTORY, ownerId: containerDirOwnerId, groupId: containerDirGroupId, permissionBits: containerDirPermissionBits },
        AccessType.READ,
      )
    ) {
      return { error: { code: FileMetaGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
    }

    const { permission_bits, owner_id, group_id } = await db.selectExactlyOne('files', { name: fileName }).run(dbPool);

    return { ok: { message: 'Fetch file information successfully', data: { permission: permission_bits, ownerId: owner_id, groupId: group_id, fileName } } };
  } catch {
    return { error: { code: FileMetaGetErrorCode.FILE_NOT_FOUND, message: 'File not found' } };
  }
});
