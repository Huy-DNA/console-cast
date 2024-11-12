import { formatArg } from '~/lib/command/utils';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { UserDeleteErrorCode } from '~/lib';

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: UserDeleteErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    return { error: { code: UserDeleteErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const formattedName = formatArg(name)!;
  // Only allow a user to remove itself currently
  if (formattedName !== event.context.auth.username) {
    return { error: { code: UserDeleteErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  // root and guest can be deleted
  if (['root', 'guest'].includes(formattedName)) {
    return { error: { code: UserDeleteErrorCode.UNDELETABLE_USER, message: `User "${formattedName}" cannot be delete` } };
  }

  await db.update('users', { name: formattedName }, { deleted_at: new Date(Date.now()) }).run(dbPool);

  return { ok: { message: 'Delete user successfully' } };
});
