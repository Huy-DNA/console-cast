import Joi from 'joi';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

const querySchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/).custom((value) => Number.parseInt(value))
  ).optional(),
  name: Joi.string().trim().min(1).optional()
}).or('id', 'name').messages({
  'object.missing': 'Either id or name must be provided'
});

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  const { error, value } = querySchema.validate(query);
  
  if (error) {
    setResponseStatus(event, 400);
    return { 
      error: { 
        message: 'Invalid query parameters', 
        details: error.details.map(detail => detail.message) 
      } 
    };
  }
  
  const { id, name } = value;
  
  try {
    const { name: username, created_at, id: userId, group_id } = await db.selectExactlyOne(
      'users', 
      { id, name, deleted_at: db.conditions.isNull }
    ).run(dbPool);
    
    return { 
      ok: { 
        data: { 
          name: username, 
          userId, 
          groupId: group_id, 
          createdAt: created_at 
        }, 
        message: 'Get user successfully',
      },
    };
  } catch {
    setResponseStatus(event, 404);
    return { error: { message: 'User not found' } };
  }
});
