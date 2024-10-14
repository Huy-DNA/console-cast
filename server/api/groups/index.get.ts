import { formatArg } from '~/lib/command/utils';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

export enum GroupGetErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  GROUP_NOT_FOUND = 3000,
}

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: GroupGetErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  const formattedName = formatArg(name);
  if (formattedName !== 'guest' && !event.context.auth) {
    return { error: { code: GroupGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }

  try {
    const { group_id } = await db.selectExactlyOne('users', { name: event.context.auth.username, deleted_at: db.conditions.isNull }).run(dbPool);
    const { name: trueGroupName, created_at } = await db.selectExactlyOne('groups', { id: group_id, deleted_at: db.conditions.isNull }).run(dbPool);
    if (formattedName !== 'guest' && formattedName !== trueGroupName?.trim()) {
      return { error: { code: GroupGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
    }
    return { ok: { data: { name, group_id, created_at }, message: 'Get group successfully' } };
  } catch {
    return { error: { code: GroupGetErrorCode.GROUP_NOT_FOUND, message: 'Group not found' } };
  }
});
