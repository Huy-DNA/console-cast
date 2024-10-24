import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { defineEventHandler } from 'h3';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

export enum LoginErrorCode {
  INVALID_BODY = 1000,
  INVALID_CRED = 1001,
  UNKNOWN_ERROR = 2000,
}

export default defineEventHandler(async (event) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const body = await readBody(event);
  if (typeof body !== 'object' || typeof body.name !== 'string' || !['string', 'undefined'].includes(typeof body.password)) {
    return { error: { code: LoginErrorCode.INVALID_BODY, message: 'Invalid body. Expected "name" to be strings and "password" to be optionally strings.' } };
  }
  const { name, password } = body;
  
  const { password: hashedPassword, id, group_id } = await db.selectExactlyOne('users', { name }).run(dbPool);

  if (hashedPassword === null || (password && bcrypt.compareSync(password, hashedPassword.trim()))) {
    const { JWT_SECRET } = useRuntimeConfig();
    const token = jwt.sign({ username: name, userid: id, groupid: group_id }, JWT_SECRET, { expiresIn: '24h' });
    setHeader(event, 'Set-Cookie', `jwt=${token}; HttpOnly; SameSite=Strict${isProduction ? '' : '; Secure'}`);
    return { ok: { message: 'Login successfully' } };
  }

  return { error: { code: LoginErrorCode.INVALID_CRED, message: 'Invalid credentials' } };
});
