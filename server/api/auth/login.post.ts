import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { defineEventHandler, setHeader, setResponseStatus } from 'h3';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import Joi from 'joi';

const bodySchema = Joi.object({
  name: Joi.string().required(),
  password: Joi.string().optional().allow('')
});

export default defineEventHandler(async (event) => {
  const isProduction = process.env.NODE_ENV === 'production'; 

  const body = await readBody(event);
  const { error: bodyError, value: validatedBody } = bodySchema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (bodyError) {
    setResponseStatus(event, 400);
    return {
      error: {
        message: 'Invalid body parameters',
        details: bodyError.details.map(detail => detail.message)
      }
    };
  }

  const { name, password } = validatedBody;

  try {
    const { password: hashedPassword, id, group_id, created_at } = await db.selectExactlyOne('users', { name }).run(dbPool);

    if (hashedPassword === null || (password && bcrypt.compareSync(password, hashedPassword.trim()))) {
      const { JWT_SECRET } = useRuntimeConfig();
      const token = jwt.sign({ username: name, userId: id, groupId: group_id }, JWT_SECRET);
      setHeader(event, 'Set-Cookie', `jwt=${token}; HttpOnly; Path=/; SameSite=Strict${!isProduction ? '' : '; Secure'}`);
      return { 
        ok: { 
          message: 'Login successfully', 
          data: { username: name, userId: id, groupId: group_id, createdAt: created_at } 
        } 
      };
    } else {
      setResponseStatus(event, 400);
      return { error: { message: 'Invalid credentials' } };
    }
  } catch {
    setResponseStatus(event, 400);
    return { error: { message: 'Invalid credentials' } };
  }
});
