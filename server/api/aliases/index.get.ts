import { AliasGetErrorCode } from '~/lib';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (!['string', 'undefined'].includes(typeof name)) {
    return { error: { code: AliasGetErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be an optional string' } };
  }
  if (!event.context.auth) {
    return { error: { code: AliasGetErrorCode.NOT_LOGIN, message: 'Should be logged in as a user with enough privilege' } };
  }
  if (name) {
    try {
      const { command } = await db.selectExactlyOne('aliases', { name: name as string, owner_id: Number.parseInt(event.context.auth.userId) }).run(dbPool);
      return { ok: { message: 'Fetch alias successfully', data: { command } } };
    } catch {
      return { error: { code: AliasGetErrorCode.ALIAS_NOT_FOUND, message: 'Alias not found' } };
    }
  } else {
    const commands = await db.select('aliases', { owner_id: Number.parseInt(event.context.auth.userId) }).run(dbPool);
    return { ok: { message: 'Fetch aliases successfully', data: { commands: commands.map(({ name, command }) => ({ name, command })) } } };
  }
});
