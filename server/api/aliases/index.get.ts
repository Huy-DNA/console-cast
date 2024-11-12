import { AliasGetErrorCode } from '~/lib';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: AliasGetErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    return { error: { code: AliasGetErrorCode.NOT_LOGIN, message: 'Should be logged in as a user with enough privilege' } };
  }
  try {
    const { command } = await db.selectExactlyOne('aliases', { name }).run(dbPool);
    return { ok: { message: 'Fetch alias successfully', data: { command } } };
  } catch {
    return { error: { code: AliasGetErrorCode.ALIAS_NOT_FOUND, message: 'Alias not found' } };
  }
});
