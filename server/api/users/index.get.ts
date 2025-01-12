import { stripQuotes } from '~/lib/command/utils';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { UserGetErrorCode } from '~/lib';

export default defineEventHandler(async (event) => {
  const { id, name: queryName } = getQuery(event);
  const formattedId = Number.parseInt(stripQuotes(id as string)!);
  const formattedName = stripQuotes(queryName as string);

  try {
    const condition = Number.isInteger(formattedId) ? { id: formattedId } : { name: formattedName };
    const { name: username, created_at, id, group_id } = await db.selectExactlyOne('users', { ...condition, deleted_at: db.conditions.isNull }).run(dbPool);
    return { ok: { data: { name: username, userId: id, groupId: group_id, createdAt: created_at }, message: 'Get user successfully' } };
  } catch {
    return { error: { code: UserGetErrorCode.USER_NOT_FOUND, message: 'User not found' } };
  }
});
