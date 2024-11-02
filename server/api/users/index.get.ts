import { formatArg } from '~/lib/command/utils';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

export enum UserGetErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  USER_NOT_FOUND = 3000,
}

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: UserGetErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  const formattedName = formatArg(name);
  if (formattedName !== 'guest' && (!event.context.auth || formattedName !== event.context.auth.username)) {
    return { error: { code: UserGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }

  try {
    const { name: username, created_at, id, group_id } = await db.selectExactlyOne('users', { name: formattedName, deleted_at: db.conditions.isNull }).run(dbPool);
    return { ok: { data: { name: username?.trim(), userId: id, groupId: group_id, createdAt: created_at }, message: 'Get user successfully' } };
  } catch {
    return { error: { code: UserGetErrorCode.USER_NOT_FOUND, message: 'User not found' } };
  }
});
