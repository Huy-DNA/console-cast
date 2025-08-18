import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import Joi from 'joi';

const bodySchema = Joi.object({
  name: Joi.string().required(),
  command: Joi.string().required()
});

const authSchema = Joi.object({
  userId: Joi.string().required()
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

  if (!event.context.auth) {
    setResponseStatus(event, 401);
    return { error: { message: 'Authentication required' } };
  }

  const { error: authError, value: auth } = authSchema.validate(event.context.auth, {
    abortEarly: false,
    stripUnknown: true
  });

  if (authError) {
    setResponseStatus(event, 401);
    return {
      error: {
        message: 'Invalid authentication context',
        details: authError.details.map(detail => detail.message)
      }
    };
  }

  const res = await db.update('aliases', 
    { command: validatedBody.command }, 
    { name: validatedBody.name, owner_id: Number.parseInt(auth.userId) }
  ).run(dbPool);

  if (res.length === 0) {
    await db.insert('aliases', { 
      command: validatedBody.command, 
      name: validatedBody.name, 
      owner_id: Number.parseInt(auth.userId) 
    }).run(dbPool);
  }

  return { ok: { message: 'Update aliases successfully' } };
});
