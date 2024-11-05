import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { VirtualPath } from '~/lib/path';
import { AccessType, canAccess, FileType, trimQuote } from '~/server/utils';

export enum FilePostErrorCode {
  INVALID_PARAM = 1000,
  INVALID_BODY = 1001,
  NOT_ENOUGH_PRIVILEGE = 2000,
  INVALID_FOLDER = 3000,
  FILE_ALREADY_EXISTS = 3001,
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
  if (typeof body !== 'object' || !['string', 'undefined'].includes(typeof body.content) || typeof body.permission_bits !== 'string' || body.permission_bits.length !== 12 || !body.permission_bits.split('').every((bit: string) => ['0', '1'].includes(bit))) {
    return { error: { code: FilePostErrorCode.INVALID_BODY, message: 'Invalid body. Expected "content" to be an optional string and "permission_bits" to be a bit string.' } };
  }
  const { content, permission_bits } = body;
  const filepath = VirtualPath.create(trimQuote(name));
  const containerPath = filepath.parent();
  try {
    const { permission_bits: containerDirPermissionBits, owner_id: containerDirOwnerId, group_id: containerDirGroupId } = await db.selectExactlyOne('files', { name: containerPath.toString(), file_type: 'directory', deleted_at: db.conditions.isNull }).run(dbPool);
    if (
      !canAccess(
        { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
        { fileType: FileType.DIRECTORY, ownerId: containerDirOwnerId, groupId: containerDirGroupId, permissionBits: containerDirPermissionBits },
        AccessType.WRITE,
      )
    ) {
      return { error: { code: FilePostErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
    }

    if (await db.selectOne('files', { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbPool)) {
      return { error: { code: FilePostErrorCode.FILE_ALREADY_EXISTS, message: 'This file already exists' } };
    }

    await db.insert('files', { name: filepath.toString(), content: content ?? null, file_type: typeof content === 'string' ? 'file' : 'directory', created_at: new Date(Date.now()), updated_at: new Date(Date.now()), deleted_at: null, permission_bits, owner_id: event.context.auth.userId, group_id: event.context.auth.groupId }).run(dbPool);

    return { ok: { message: 'Create file successfully' } };
  } catch {
    return { error: { code: FilePostErrorCode.INVALID_FOLDER, message: 'Folder not found' } };
  }
});
