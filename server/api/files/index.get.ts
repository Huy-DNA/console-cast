import path from 'path';
import { formatArg } from '~/lib/command/utils';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { AccessType, canAccess, FileType } from '~/server/utils';

export enum FileGetErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  FILE_NOT_FOUND = 3000,
}

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: FileGetErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    return { error: { code: FileGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const fileName = formatArg(name);
  const containerDirName = path.dirname(fileName);
  const { permission_bits: containerDirPermissionBits, owner_id: containerDirOwnerId, group_id: containerDirGroupId } = await db.selectExactlyOne('files', { name: containerDirName, file_type: 'directory' }).run(dbPool);
  if (
    !canAccess(
      { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
      { fileType: FileType.REGULAR_FILE, ownerId: containerDirOwnerId, groupId: containerDirGroupId, permissionBits: containerDirPermissionBits },
      AccessType.READ,
    )
  ) {
    return { error: { code: FileGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }

  const { permission_bits, owner_id, group_id } = await db.selectExactlyOne('files', { name: fileName }).run(dbPool);

  return { ok: { message: 'Fetch file information successfully', data: { permission: permission_bits, ownerId: owner_id, groupId: group_id, fileName } } };
});
