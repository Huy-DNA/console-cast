import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { VirtualPath } from '~/utils/path';
import { AccessType, canAccess, FileType, trimQuote } from '~/server/utils';
import Joi from 'joi';

const querySchema = Joi.object({
  name: Joi.string().required()
});

const authSchema = Joi.object({
  userId: Joi.number().required(),
  groupId: Joi.number().required()
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
    setResponseStatus(event, 403);
    return { error: { message: 'Authentication required' } };
  }

  const { error: authError, value: auth } = authSchema.validate(event.context.auth, {
    abortEarly: false,
    stripUnknown: true
  });

  if (authError) {
    setResponseStatus(event, 403);
    return {
      error: {
        message: 'Invalid authentication context',
        details: authError.details.map(detail => detail.message)
      }
    };
  }

  const filepath = VirtualPath.createUnchecked(trimQuote(query.name));
  if (!filepath.isValid()) {
    setResponseStatus(event, 400);
    return { error: { message: 'Invalid file path' } };
  }

  const fileRecord = await db.selectOne('files', { 
    name: filepath.toString(), 
    deleted_at: db.conditions.isNull 
  }).run(dbPool);

  if (!fileRecord) {
    setResponseStatus(event, 404);
    return { error: { message: 'File not found' } };
  }

  if (
    !canAccess(
      { userId: auth.userId, groupId: auth.groupId },
      { 
        fileType: FileType.DIRECTORY, 
        ownerId: fileRecord.owner_id, 
        groupId: fileRecord.group_id, 
        permissionBits: fileRecord.permission_bits 
      },
      AccessType.READ
    )
  ) {
    setResponseStatus(event, 403);
    return { error: { message: 'Insufficient permissions' } };
  }

  const [{ size }] = await db.sql`
    SELECT SUM(pg_column_size(${'files'}.*)) as size
    FROM ${'files'}
    WHERE (${'name'} LIKE ${db.param(`${filepath.toString()}/%`)} OR ${'name'} = ${db.param(filepath.toString())}) AND ${'deleted_at'} IS NULL
  `.run(dbPool);

  return { 
    ok: { 
      message: 'Fetch file size successfully', 
      data: { size: Number.parseInt(size) } 
    } 
  };
});
