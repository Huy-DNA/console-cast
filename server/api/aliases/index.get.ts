import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import Joi from 'joi';

const querySchema = Joi.object({
  name: Joi.string().optional()
});

const authSchema = Joi.object({
  userId: Joi.string().required()
});

export default defineEventHandler(async (event) => {
  const { error: queryError, value: query } = querySchema.validate(getQuery(event), { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (queryError) {
    setResponseStatus(event, 400);
    return { 
      error: { 
        message: 'Invalid query parameters', 
        details: queryError.details.map(detail => detail.message)
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

  if (query.name) {
    try {
      const { command } = await db.selectExactlyOne('aliases', { 
        name: query.name, 
        owner_id: Number.parseInt(auth.userId) 
      }).run(dbPool);
      
      return { 
        ok: { 
          message: 'Fetch alias successfully', 
          data: { command } 
        } 
      };
    } catch {
      setResponseStatus(event, 400);
      return { error: { message: 'Alias not found' } };
    }
  } else {
    const commands = await db.select('aliases', { 
      owner_id: Number.parseInt(auth.userId) 
    }).run(dbPool);
    
    return { 
      ok: { 
        message: 'Fetch aliases successfully', 
        data: { 
          commands: commands.map(({ name, command }) => ({ name, command })) 
        } 
      } 
    };
  }
});
