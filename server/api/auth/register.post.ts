import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { defineEventHandler } from 'h3';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { RegisterErrorCode } from '~/lib';

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
    let groupId;
    let userId;

    await db.readCommitted(dbPool, async (txnClient) => {
      ({ id: groupId } = await db.insert('groups', { name, created_at: new Date(Date.now()), deleted_at: null }).run(txnClient));
      ({ id: userId } = await db.insert('users', { name, password: hashedPassword, created_at: new Date(Date.now()), deleted_at: null, group_id: groupId }).run(txnClient));
      await db.insert('files', { name: `/home/${name}`, created_at: new Date(Date.now()), deleted_at: null, owner_id: userId, group_id: groupId, file_type: 'directory', content: null, updated_at: new Date(Date.now()), permission_bits: '000111111001' }).run(txnClient);
    });
    const { JWT_SECRET } = useRuntimeConfig();
    const token = jwt.sign({ username: name, userId, groupId }, JWT_SECRET);
    setHeader(event, 'Set-Cookie', `jwt=${token}; HttpOnly; Path=/; SameSite=Strict`);

    return { ok: { message: 'Register successfully' } };
  } catch {
    return { error: { code: RegisterErrorCode.UNKNOWN_ERROR, message: 'Unknown error' } };
  }
});
