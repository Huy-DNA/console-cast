import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { FileDeleteErrorCode } from '~/lib';
import { VirtualPath } from '~/lib/path';
import { AccessType, canAccess, FileType, trimQuote } from '~/server/utils';

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: FileDeleteErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    return { error: { code: FileDeleteErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const filepath = VirtualPath.create(trimQuote(name));
  if (!filepath.isValid()) {
    return { error: { code: FileDeleteErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be valid path' } };
  }
  const containerPath = filepath.parent();
  try {
    const { permission_bits: containerDirPermissionBits, owner_id: containerDirOwnerId, group_id: containerDirGroupId } = await db.selectExactlyOne('files', { name: containerPath.toString(), file_type: 'directory' }).run(dbPool);
    if (
      !canAccess(
        { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
        { fileType: FileType.DIRECTORY, ownerId: containerDirOwnerId, groupId: containerDirGroupId, permissionBits: containerDirPermissionBits },
        AccessType.WRITE,
      )
    ) {
      return { error: { code: FileDeleteErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
    }

    if (!(await db.selectOne('files', { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbPool))) {
      return { error: { code: FileDeleteErrorCode.FILE_NOT_FOUND, message: 'File not found' } };
    }

    await db.readCommitted(dbPool, async (dbClient) => {
      await db.update('files', { deleted_at: new Date(Date.now()) }, { name: db.conditions.like(`${filepath.toString()}/%`), deleted_at: db.conditions.isNull }).run(dbClient);
      await db.update('files', { deleted_at: new Date(Date.now()) }, { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbClient);
    });

    return { ok: { message: 'Delete file successfully' } };
  } catch {
    return { error: { code: FileDeleteErrorCode.FILE_NOT_FOUND, message: 'File not found' } };
  }
});
