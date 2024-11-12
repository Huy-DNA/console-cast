import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { FileMetaGetErrorCode } from '~/lib';
import { VirtualPath } from '~/lib/path';
import { AccessType, canAccess, FileType, trimQuote } from '~/server/utils';

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: FileMetaGetErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    return { error: { code: FileMetaGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const filepath = VirtualPath.create(trimQuote(name));
  if (!filepath.isValid()) {
    return { error: { code: FileMetaGetErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be valid path' } };
  }
  const containerPath = filepath.parent();
  try {
    const { permission_bits: containerDirPermissionBits, owner_id: containerDirOwnerId, group_id: containerDirGroupId } = await db.selectExactlyOne('files', { name: containerPath.toString(), file_type: 'directory', deleted_at: db.conditions.isNull }).run(dbPool);
    if (
      !canAccess(
        { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
        { fileType: FileType.DIRECTORY, ownerId: containerDirOwnerId, groupId: containerDirGroupId, permissionBits: containerDirPermissionBits },
        AccessType.READ,
      )
    ) {
      return { error: { code: FileMetaGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
    }

    const { permission_bits, owner_id, group_id, file_type } = await db.selectExactlyOne('files', { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbPool);

    return { ok: { message: 'Fetch file information successfully', data: { permission: permission_bits, ownerId: owner_id, groupId: group_id, fileName: filepath.toString(), fileType: file_type } } };
  } catch {
    return { error: { code: FileMetaGetErrorCode.FILE_NOT_FOUND, message: 'File not found' } };
  }
});
