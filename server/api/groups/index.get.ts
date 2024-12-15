import { formatArg } from '~/lib/command/utils';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { GroupGetErrorCode } from '~/lib';

export default defineEventHandler(async (event) => {
  const { id, owner } = getQuery(event);
  if (typeof id !== 'string' && typeof owner !== 'string') {
    return { error: { code: GroupGetErrorCode.INVALID_PARAM, message: 'Expect either the "id" or the "owner" query param to be string' } };
  }
  if (id) return getGroupById(Number.parseInt(formatArg(id as string)!));
  if (owner) return await getGroupByOwner(owner as string);
});

async function getGroupById (id: number) {
  try {
    const { name, created_at: createdAt } = await db.selectExactlyOne('groups', { id, deleted_at: db.conditions.isNull }).run(dbPool);
    return { ok: { data: { name, groupId: id, createdAt }, message: 'Get group successfully' } };
  } catch {
    return { error: { code: GroupGetErrorCode.GROUP_NOT_FOUND, message: 'Group not found' } };
  }
}

async function getGroupByOwner (owner: string) {
  const groups = await db.sql`
    SELECT ${'name'}, ${'id'}, ${'created_at'}
    FROM ${'groups'}
    WHERE ${'deleted_at'} IS NULL AND ${'id'} IN (
      SELECT ${'group_id'}
      FROM ${'users'}
      WHERE ${'users'}.${'name'} = ${db.param(owner)}
    )
  `.run(dbPool);
  return { ok: { message: 'Fetch groups by owner successfully', data: groups } };
}
