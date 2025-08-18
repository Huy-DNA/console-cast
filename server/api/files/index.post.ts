import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { VirtualPath } from '~/utils/path';
import { AccessType, canAccess, FileType, trimQuote } from '~/server/utils';
import Joi from 'joi';

const querySchema = Joi.object({
  name: Joi.string().required()
});

const bodySchema = Joi.object({
  content: Joi.string().optional().allow(''),
  permission_bits: Joi.string()
    .length(12)
    .pattern(/^[01]{12}$/, 'binary string')
    .required()
    .messages({
      'string.length': 'Permission bits must be exactly 12 characters long',
      'string.pattern.name': 'Permission bits must be a 12-bit binary string'
    })
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

  const filepath = VirtualPath.createUnchecked(trimQuote(query.name));
  if (!filepath.isValid()) {
    setResponseStatus(event, 400);
    return { error: { message: 'Invalid file path' } };
  }

  const containerPath = filepath.parent();

  try {
    const containerDirRecord = await db.selectExactlyOne('files', { 
      name: containerPath.toString(), 
      file_type: 'directory', 
      deleted_at: db.conditions.isNull 
    }).run(dbPool);

    const { permission_bits: containerDirPermissionBits, owner_id: containerDirOwnerId, group_id: containerDirGroupId } = containerDirRecord;

    if (
      !canAccess(
        { userId: auth.userId, groupId: auth.groupId },
        { fileType: FileType.DIRECTORY, ownerId: containerDirOwnerId, groupId: containerDirGroupId, permissionBits: containerDirPermissionBits },
        AccessType.WRITE
      )
    ) {
      setResponseStatus(event, 403);
      return { error: { message: 'Insufficient permissions for container directory' } };
    }

    if (await db.selectOne('files', { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbPool)) {
      setResponseStatus(event, 400);
      return { error: { message: 'This file already exists' } };
    }

    await db.insert('files', { 
      name: filepath.toString(), 
      content: validatedBody.content ?? null, 
      file_type: typeof validatedBody.content === 'string' ? 'file' : 'directory', 
      created_at: new Date(), 
      updated_at: new Date(), 
      deleted_at: null, 
      permission_bits: validatedBody.permission_bits, 
      owner_id: auth.userId, 
      group_id: auth.groupId 
    }).run(dbPool);

    return { ok: { message: 'Create file successfully' } };
  } catch {
    setResponseStatus(event, 404);
    return { error: { message: 'Folder not found' } };
  }
});
