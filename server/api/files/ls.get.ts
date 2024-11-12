import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { FileLsErrorCode } from '~/lib';
import { VirtualPath } from '~/lib/path';
import { AccessType, canAccess, FileType, trimQuote } from '~/server/utils';

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: FileLsErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    return { error: { code: FileLsErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const filepath = VirtualPath.create(trimQuote(name));
  if (!filepath.isValid()) {
    return { error: { code: FileLsErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be valid path' } };
  }
  try {
    const { permission_bits: filePermissionBits, owner_id: fileOwnerId, group_id: fileGroupId, file_type: fileType, created_at: createdAt, updated_at: updatedAt } = await db.selectExactlyOne('files', { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbPool);
    if (
      !canAccess(
        { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
        { fileType: FileType.UNKNOWN, ownerId: fileOwnerId, groupId: fileGroupId, permissionBits: filePermissionBits },
        AccessType.EXECUTE,
      )
    ) {
      return { error: { code: FileLsErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
    }

    if (fileType === 'file') {
      return { ok: { message: 'Fetch file meta successfully', data: { files: [{ name: filepath.toString(), ownerId: fileOwnerId, groupId: fileGroupId, fileType: fileType, createdAt, updatedAt, permissionBits: filePermissionBits }] } } };
    }

    const files = await db.select('files', { name: db.conditions.and(db.conditions.like(`${filepath.toString()}/%`), db.conditions.notLike(`${filepath.toString()}/%/%`)), deleted_at: db.conditions.isNull }).run(dbPool);

    return { ok: { message: 'Fetch folder\'s content successfully', data: { files: files.map(({ permission_bits, updated_at, name, file_type, created_at, owner_id, group_id }) => ({ name, fileType: file_type, createdAt: created_at, ownerId: owner_id, groupId: group_id, permissionBits: permission_bits, updatedAt: updated_at })) } } };
  } catch {
    return { error: { code: FileLsErrorCode.FILE_NOT_FOUND, message: 'File not found' } };
  }
});
