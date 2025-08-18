import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { defineEventHandler, setHeader, setResponseStatus } from 'h3';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import Joi from 'joi';

const bodySchema = Joi.object({
  name: Joi.string()
    .required()
    .pattern(/^\S+$/, 'no spaces')
    .messages({
      'string.pattern.name': 'Username must not contain spaces'
    }),
  password: Joi.string()
    .required()
    .min(6)
    .messages({
      'string.min': 'Password must be at least 6 characters long'
    })
});

export default defineEventHandler(async (event) => { 
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
    const existingUser = await db.selectOne('users', { name }).run(dbPool);
    if (existingUser?.id) {
      setResponseStatus(event, 400);
      return { error: { message: 'This user already exists' } };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let groupId: number;
    let userId: number;

    await db.readCommitted(dbPool, async (txnClient) => {
      ({ id: groupId } = await db.insert('groups', { 
        name, 
        created_at: new Date(), 
        deleted_at: null 
      }).run(txnClient));

      ({ id: userId } = await db.insert('users', { 
        name, 
        password: hashedPassword, 
        created_at: new Date(), 
        deleted_at: null, 
        group_id: groupId 
      }).run(txnClient));

      await db.insert('files', { 
        name: `/home/${name}`, 
        created_at: new Date(), 
        deleted_at: null, 
        owner_id: userId, 
        group_id: groupId, 
        file_type: 'directory', 
        content: null, 
        updated_at: new Date(), 
        permission_bits: '000111111001' 
      }).run(txnClient);
    });

    const { JWT_SECRET } = useRuntimeConfig();
    const token = jwt.sign({ username: name, userId, groupId }, JWT_SECRET);
    setHeader(event, 'Set-Cookie', `jwt=${token}; HttpOnly; Path=/; SameSite=Strict`);

    return { ok: { message: 'Register successfully' } };
  } catch {
    setResponseStatus(event, 500);
    return { error: { message: 'Unknown error' } };
  }
});
