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
  try {
    const { permission_bits: filePermissionBits, owner_id: fileOwnerId, group_id: fileGroupId, content } = await db.selectExactlyOne('files', { name: filepath.toString(), file_type: 'file', deleted_at: db.conditions.isNull }).run(dbPool);
    if (
      !canAccess(
        { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
        { fileType: FileType.UNKNOWN, ownerId: fileOwnerId, groupId: fileGroupId, permissionBits: filePermissionBits },
        AccessType.READ,
      )
    ) {
      setResponseStatus(event, 403);
      return { error: { message: 'Should be logged in as a user with enough privilege' } };
    }

    return { ok: { message: 'Fetch file content successfully', data: { content } } };
  } catch {
    setResponseStatus(event, 404);
    return { error: { message: 'File not found' } };
  }
});
