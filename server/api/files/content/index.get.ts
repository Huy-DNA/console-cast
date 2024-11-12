import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { FileContentGetErrorCode } from '~/lib';
import { VirtualPath } from '~/lib/path';
import { AccessType, canAccess, FileType, trimQuote } from '~/server/utils';

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: FileContentGetErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    return { error: { code: FileContentGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const filepath = VirtualPath.create(trimQuote(name));
  try {
    const { permission_bits: filePermissionBits, owner_id: fileOwnerId, group_id: fileGroupId, content } = await db.selectExactlyOne('files', { name: filepath.toString(), file_type: 'file', deleted_at: db.conditions.isNull }).run(dbPool);
    if (
      !canAccess(
        { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
        { fileType: FileType.UNKNOWN, ownerId: fileOwnerId, groupId: fileGroupId, permissionBits: filePermissionBits },
        AccessType.READ,
      )
    ) {
      return { error: { code: FileContentGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
    }

    return { ok: { message: 'Fetch file content successfully', data: { content } } };
  } catch {
    return { error: { code: FileContentGetErrorCode.FILE_NOT_FOUND, message: 'File not found' } };
  }
});
