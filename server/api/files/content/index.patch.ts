import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { FileContentPatchErrorCode } from '~/lib';
import { VirtualPath } from '~/lib/path';
import { AccessType, canAccess, FileType, trimQuote } from '~/server/utils';

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: FileContentPatchErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  const body = await readBody(event);
  if (typeof body !== 'object' || typeof body.content !== 'string' || typeof body.shouldAppend !== 'boolean') {
    return { error: { code: FileContentPatchErrorCode.INVALID_BODY, message: 'Invalid body. Expected "content" to be a string and "shouldAppend" to be a boolean.' } };
  }
  if (!event.context.auth) {
    return { error: { code: FileContentPatchErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const filepath = VirtualPath.create(trimQuote(name));
  if (!filepath.isValid()) {
    return { error: { code: FileContentPatchErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be valid path' } };
  }
  try {
    const { permission_bits: filePermissionBits, owner_id: fileOwnerId, group_id: fileGroupId, content } = await db.selectExactlyOne('files', { name: filepath.toString(), file_type: 'file', deleted_at: db.conditions.isNull }).run(dbPool);
    if (
      !canAccess(
        { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
        { fileType: FileType.UNKNOWN, ownerId: fileOwnerId, groupId: fileGroupId, permissionBits: filePermissionBits },
        AccessType.WRITE,
      )
    ) {
      return { error: { code: FileContentPatchErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
    }

    const newContent = body.shouldAppend ? content + body.content : body.content;
    await db.update('files', { content: newContent }, { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbPool);

    return { ok: { message: 'Update file content successfully' } };
  } catch {
    return { error: { code: FileContentPatchErrorCode.FILE_NOT_FOUND, message: 'File not found' } };
  }
});
