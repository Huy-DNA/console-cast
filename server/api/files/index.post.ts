import path from 'path';
import { formatArg } from '~/lib/command/utils';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { AccessType, canAccess, FileType } from '~/server/utils';

export enum FilePostErrorCode {
  INVALID_PARAM = 1000,
  INVALID_BODY = 1001,
  NOT_ENOUGH_PRIVILEGE = 2000,
  INVALID_FOLDER = 3000,
}

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: FilePostErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    return { error: { code: FilePostErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const body = await readBody(event);
  if (typeof body !== 'object' || !['string', 'undefined'].includes(typeof body.content) || !Array.isArray(body.permission_bits) || body.length !== 12 || !body.permission_bits.every((bit: unknown) => typeof bit === 'boolean')) {
    return { error: { code: FilePostErrorCode.INVALID_BODY, message: 'Invalid body. Expected "content" to be an optional string.' } };
  }
  const { content, permission_bits } = body;
  const fileName = formatArg(name);
  const containerDirName = path.dirname(fileName);
  try {
    const { permission_bits: containerDirPermissionBits, owner_id: containerDirOwnerId, group_id: containerDirGroupId } = await db.selectExactlyOne('files', { name: containerDirName, file_type: 'directory' }).run(dbPool);
    if (
      !canAccess(
        { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
        { fileType: FileType.REGULAR_FILE, ownerId: containerDirOwnerId, groupId: containerDirGroupId, permissionBits: containerDirPermissionBits },
        AccessType.WRITE,
      )
    ) {
      return { error: { code: FilePostErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
    }

    await db.insert('files', { name: fileName, content: content ?? null, file_type: content ? 'file' : 'directory', created_at: new Date(Date.now()), updated_at: new Date(Date.now()), deleted_at: null, permission_bits, owner_id: event.context.auth.owner_id, group_id: event.context.auth.group_id }).run(dbPool);

    return { ok: { message: 'Create file successfully' } };
  } catch {
    return { error: { code: FilePostErrorCode.INVALID_FOLDER, message: 'File not found' } };
  }
});
