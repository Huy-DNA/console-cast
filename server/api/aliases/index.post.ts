import { AliasPostErrorCode } from '~/lib';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (typeof body !== 'object' || typeof body.name !== 'string' || typeof body.command !== 'string') {
    return { error: { code: AliasPostErrorCode.INVALID_BODY, message: 'Invalid body. Expected "name" and "command" to be strings.' } };
  }
  if (!event.context.auth) {
    return { error: { code: AliasPostErrorCode.NOT_LOGIN, message: 'Should be logged in as a user with enough privilege' } };
  }
  const res = await db.update('aliases', { command: body.command }, { name: body.name, owner_id: event.context.auth.userId }).run(dbPool);
  if (res.length === 0) {
    await db.insert('aliases', { command: body.command, name: body.name, owner_id: event.context.auth.userId }).run(dbPool);
  }
  return { ok: { message: 'Update aliases successfully' } };
});
