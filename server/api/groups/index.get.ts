import Joi from 'joi';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';

const querySchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/).custom((value) => Number.parseInt(value))
  ).optional(),
  owner: Joi.string().trim().min(1).optional()
}).or('id', 'owner').messages({
  'object.missing': 'Either id or owner must be provided'
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
  
  const { id, owner } = value;
  
  if (id !== undefined) {
    return getGroupById(id);
  }
  
  if (owner !== undefined) {
    return getGroupByOwner(owner);
  }
  
  async function getGroupById (id: number) {
    try {
      const { name, created_at: createdAt } = await db.selectExactlyOne(
        'groups', 
        { id, deleted_at: db.conditions.isNull }
      ).run(dbPool);
      
      return { 
        ok: { 
          data: { name, groupId: id, createdAt }, 
          message: 'Get group successfully' 
        } 
      };
    } catch {
      setResponseStatus(event, 404);
      return { error: { message: 'Group not found' } };
    }
  }
  
  async function getGroupByOwner (owner: string) {
    try {
      const groups = await db.sql`
        SELECT ${'name'}, ${'id'}, ${'created_at'}
        FROM ${'groups'}
        WHERE ${'deleted_at'} IS NULL AND ${'id'} IN (
          SELECT ${'group_id'}
          FROM ${'users'}
          WHERE ${'users'}.${'name'} = ${db.param(owner)}
        )
      `.run(dbPool);
      
      return { 
        ok: { 
          message: 'Fetch groups by owner successfully', 
          data: groups 
        } 
      };
    } catch {
      setResponseStatus(event, 500);
      return { error: { message: 'Failed to fetch groups' } };
    }
  }
});
