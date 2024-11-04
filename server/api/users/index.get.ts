import { formatArg } from '~/lib/command/utils';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

export enum UserGetErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  USER_NOT_FOUND = 3000,
}

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (typeof id !== 'string') {
    return { error: { code: UserGetErrorCode.INVALID_PARAM, message: 'Expect the "id" query param to be string' } };
  }
  const formattedId = Number.parseInt(formatArg(id));

  try {
    const { name: username, created_at, id, group_id } = await db.selectExactlyOne('users', { id: formattedId, deleted_at: db.conditions.isNull }).run(dbPool);
    return { ok: { data: { name: username, userId: id, groupId: group_id, createdAt: created_at }, message: 'Get user successfully' } };
  } catch {
    return { error: { code: UserGetErrorCode.USER_NOT_FOUND, message: 'User not found' } };
  }
});
