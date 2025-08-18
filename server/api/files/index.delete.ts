import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { VirtualPath } from '~/utils/path';
import { AccessType, canAccess, FileType, trimQuote } from '~/server/utils';

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    setResponseStatus(event, 400);
    return { error: { message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    setResponseStatus(event, 403);
    return { error: { message: 'Should be logged in as a user with enough privilege' } };
  }
  const filepath = VirtualPath.createUnchecked(trimQuote(name));
  if (!filepath.isValid()) {
    setResponseStatus(event, 400);
    return { error: { message: 'Expect the "name" query param to be valid path' } };
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
      setResponseStatus(event, 403);
      return { error: { message: 'Should be logged in as a user with enough privilege' } };
    }

    if (!(await db.selectOne('files', { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbPool))) {
      setResponseStatus(event, 404);
      return { error: { message: 'File not found' } };
    }

    await db.readCommitted(dbPool, async (dbClient) => {
      await db.update('files', { deleted_at: new Date(Date.now()) }, { name: db.conditions.like(`${filepath.toString()}/%`), deleted_at: db.conditions.isNull }).run(dbClient);
      await db.update('files', { deleted_at: new Date(Date.now()) }, { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbClient);
    });

    return { ok: { message: 'Delete file successfully' } };
  } catch {
    setResponseStatus(event, 404);
    return { error: { message: 'File not found' } };
  }
});
