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
        AccessType.READ
      )
    ) {
      setResponseStatus(event, 403);
      return { error: { message: 'Insufficient permissions for container directory' } };
    }

    const fileRecord = await db.selectExactlyOne('files', { 
      name: filepath.toString(), 
      deleted_at: db.conditions.isNull 
    }).run(dbPool);

    const { permission_bits, owner_id, group_id, file_type } = fileRecord;

    return { 
      ok: { 
        message: 'Fetch file information successfully', 
        data: { 
          permission: permission_bits, 
          ownerId: owner_id, 
          groupId: group_id, 
          fileName: filepath.toString(), 
          fileType: file_type 
        } 
      } 
    };
  } catch {
    setResponseStatus(event, 404);
    return { error: { message: 'File not found' } };
  }
});
