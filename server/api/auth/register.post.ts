import bcrypt from 'bcrypt';
import { defineEventHandler } from 'h3';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

export enum RegisterErrorCode {
  INVALID_BODY = 1000,
  USER_ALREADY_EXISTS = 1001,
  PASSWORD_TOO_SHORT = 1002,
  INVALID_USER_NAME = 1003,
  UNKNOWN_ERROR = 2000,
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (typeof body !== 'object' || typeof body.name !== 'string' || typeof body.password !== 'string') {
    return { error: { code: RegisterErrorCode.INVALID_BODY, message: 'Invalid body. Expected "name" and "password" to be strings.' } };
  }
  const { name, password } = body;

  if (password.length < 6) {
    return { error: { code: RegisterErrorCode.PASSWORD_TOO_SHORT, message: 'Password must be at least 6 character long' } };
  }

  if (name.search(/\s/) !== -1) {
    return { error: { code: RegisterErrorCode.INVALID_USER_NAME, message: 'Username must not contain spaces' } };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const res = (await db.selectOne('users', { name }).run(dbPool))?.id;
    if (typeof res === 'number') {
      return { error: { code: RegisterErrorCode.USER_ALREADY_EXISTS, message: 'This user already exists' } };
    }

    await db.readCommitted(dbPool, async (txnClient) => {
      const { id } = await db.insert('groups', { name, created_at: new Date(Date.now()), deleted_at: null }).run(txnClient);
      await db.insert('users', { name, password: hashedPassword, created_at: new Date(Date.now()), deleted_at: null, group_id: id }).run(txnClient);
      await db.insert('files', { name: `/home/${name}`, created_at: new Date(Date.now()), deleted_at: null, owner_id: id, group_id: id, file_type: 'directory', content: null, updated_at: new Date(Date.now()), permission_bits: '000111111001' }).run(txnClient);
    });

    return { ok: { message: 'Register successfully' } };
  } catch {
    return { error: { code: RegisterErrorCode.UNKNOWN_ERROR, message: 'Unknown error' } };
  }
});
