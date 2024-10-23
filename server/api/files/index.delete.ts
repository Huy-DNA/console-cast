import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { AccessType, canAccess, FileType, getParentDir, isPathNameValid, normalizePathname } from '~/server/utils';

export enum FileDeleteErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  FILE_NOT_FOUND = 3000,
}

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: FileDeleteErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    return { error: { code: FileDeleteErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const fileName = normalizePathname(name);
  if (!isPathNameValid(fileName)) {
    return { error: { code: FileDeleteErrorCode.INVALID_PARAM, message: 'Invalid filename' } };
  }
  const containerDirName = getParentDir(fileName);
  try {
    const { permission_bits: containerDirPermissionBits, owner_id: containerDirOwnerId, group_id: containerDirGroupId } = await db.selectExactlyOne('files', { name: containerDirName, file_type: 'directory' }).run(dbPool);
    if (
      !canAccess(
        { userId: event.context.auth.userid as number, groupId: event.context.auth.groupid as number },
        { fileType: FileType.DIRECTORY, ownerId: containerDirOwnerId, groupId: containerDirGroupId, permissionBits: containerDirPermissionBits },
        AccessType.WRITE,
      )
    ) {
      return { error: { code: FileDeleteErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
    }

    await db.update('files', { deleted_at: new Date(Date.now()) }, { name: db.conditions.like(`${fileName}%`) }).run(dbPool);

    return { ok: { message: 'Delete file information successfully' } };
  } catch {
    return { error: { code: FileDeleteErrorCode.FILE_NOT_FOUND, message: 'File not found' } };
  }
});
