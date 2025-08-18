import Joi from 'joi';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

const querySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({
      'string.base': 'Expect the "name" query param to be string',
      'string.empty': 'Name cannot be empty',
      'any.required': 'Name parameter is required'
    })
});

const authSchema = Joi.object({
  username: Joi.string().required(),
}).unknown(true);

const PROTECTED_USERS = ['root', 'guest'];

export default defineEventHandler(async (event) => {
  const { error: queryError, value: queryValue } = querySchema.validate(getQuery(event));
  
  if (queryError) {
    setResponseStatus(event, 400);
    return { 
      error: { 
        message: queryError.details[0].message 
      } 
    };
  }
  
  if (!event.context.auth) {
    setResponseStatus(event, 401);
    return { error: { message: 'Should be logged in as a user with enough privilege' } };
  }
  
  const { error: authError, value: authValue } = authSchema.validate(event.context.auth);
  
  if (authError) {
    setResponseStatus(event, 401);
    return { error: { message: 'Invalid authentication context' } };
  }
  
  const { name } = queryValue;
  const { username } = authValue;
  
  if (name !== username) {
    setResponseStatus(event, 403);
    return { error: { message: 'Should be logged in as a user with enough privilege' } };
  }
  
  if (PROTECTED_USERS.includes(name)) {
    setResponseStatus(event, 400);
    return { error: { message: `User "${name}" cannot be deleted` } };
  }
  
  try {
    await db.update(
      'users', 
      { name }, 
      { deleted_at: new Date() }
    ).run(dbPool);
    
    return { ok: { message: 'Delete user successfully' } };
  } catch {
    setResponseStatus(event, 500);
    return { error: { message: 'Failed to delete user' } };
  }
});
