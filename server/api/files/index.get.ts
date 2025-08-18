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
    const { permission_bits: containerDirPermissionBits, owner_id: containerDirOwnerId, group_id: containerDirGroupId } = await db.selectExactlyOne('files', { name: containerPath.toString(), file_type: 'directory', deleted_at: db.conditions.isNull }).run(dbPool);
    if (
      !canAccess(
        { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
        { fileType: FileType.DIRECTORY, ownerId: containerDirOwnerId, groupId: containerDirGroupId, permissionBits: containerDirPermissionBits },
        AccessType.READ,
      )
    ) {
      setResponseStatus(event, 403);
      return { error: { message: 'Should be logged in as a user with enough privilege' } };
    }

    const { permission_bits, owner_id, group_id, file_type } = await db.selectExactlyOne('files', { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbPool);

    return { ok: { message: 'Fetch file information successfully', data: { permission: permission_bits, ownerId: owner_id, groupId: group_id, fileName: filepath.toString(), fileType: file_type } } };
  } catch {
    setResponseStatus(event, 404);
    return { error: { message: 'File not found' } };
  }
});
