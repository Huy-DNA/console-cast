import { AliasDeleteErrorCode } from '~/lib';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (typeof body !== 'object' || typeof body.name !== 'string') {
    return { error: { code: AliasDeleteErrorCode.INVALID_BODY, message: 'Invalid body. Expected "name" and "command" to be strings.' } };
  }
  if (!event.context.auth) {
    return { error: { code: AliasDeleteErrorCode.NOT_LOGIN, message: 'Should be logged in as a user with enough privilege' } };
  }
  await db.deletes('aliases', { name: body.name, owner_id: event.context.auth.userId }).run(dbPool);
  return { ok: { message: 'Update aliases successfully' } };
});
