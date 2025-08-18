import Joi from 'joi';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

const bodySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({
      'string.base': 'Invalid body. Expected "name" to be a string',
      'string.empty': 'Name cannot be empty',
      'any.required': 'Name is required'
    })
}).unknown(false).messages({
  'object.unknown': 'Invalid body. Only "name" field is allowed'
});

const authSchema = Joi.object({
  userId: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string()
  ).required(),
  username: Joi.string().optional()
}).unknown(true).messages({
  'any.required': 'Should be logged in as a user with enough privilege'
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  const { error: bodyError, value: bodyValue } = bodySchema.validate(body);
  
  if (bodyError) {
    setResponseStatus(event, 400);
    return { 
      error: { 
        message: bodyError.details[0].message 
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
    return { error: { message: 'Should be logged in as a user with enough privilege' } };
  }
  
  const { name } = bodyValue;
  const { userId } = authValue;
  
  try {
    await db.deletes(
      'aliases', 
      { 
        name, 
        owner_id: userId 
      }
    ).run(dbPool);
    
    return { ok: { message: 'Delete alias successfully' } };
  } catch {
    setResponseStatus(event, 500);
    return { error: { message: 'Failed to delete alias' } };
  }
});
