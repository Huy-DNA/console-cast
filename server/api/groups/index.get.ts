import { formatArg } from '~/lib/command/utils';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

export enum GroupGetErrorCode {
  INVALID_PARAM = 1000,
  NOT_ENOUGH_PRIVILEGE = 2000,
  GROUP_NOT_FOUND = 3000,
}

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (typeof id !== 'string') {
    return { error: { code: GroupGetErrorCode.INVALID_PARAM, message: 'Expect the "id" query param to be string' } };
  }
  const formattedId = Number.parseInt(formatArg(id));

  try {
    const { name, created_at: createdAt } = await db.selectExactlyOne('groups', { id: formattedId, deleted_at: db.conditions.isNull }).run(dbPool);
    return { ok: { data: { name, groupId: formattedId, createdAt }, message: 'Get group successfully' } };
  } catch {
    return { error: { code: GroupGetErrorCode.GROUP_NOT_FOUND, message: 'Group not found' } };
  }
});
