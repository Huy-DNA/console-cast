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

  try {
    const [fileRecord] = await db.sql`
      SELECT permission_bits, ${'files'}.${'name'}, owner_id, ${'users'}.${'name'} AS owner_name, ${'files'}.${'group_id'}, ${'groups'}.${'name'} AS group_name, file_type, ${'files'}.created_at, ${'files'}.updated_at
      FROM ${'files'}
      JOIN ${'users'} ON ${'files'}.${'owner_id'} = ${'users'}.${'id'}
      JOIN ${'groups'} ON ${'files'}.${'group_id'} = ${'groups'}.${'id'}
      WHERE ${'files'}.${'deleted_at'} IS NULL
        AND ${'files'}.${'name'} = ${db.param(filepath.toString())}
    `.run(dbPool);

    if (!fileRecord) {
      setResponseStatus(event, 404);
      return { error: { message: 'File not found' } };
    }

    const { permission_bits: filePermissionBits, owner_id: fileOwnerId, owner_name: ownerName, group_name: groupName, group_id: fileGroupId, file_type: fileType, created_at: createdAt, updated_at: updatedAt } = fileRecord;

    if (
      !canAccess(
        { userId: auth.userId, groupId: auth.groupId },
        { fileType: FileType.UNKNOWN, ownerId: fileOwnerId, groupId: fileGroupId, permissionBits: filePermissionBits },
        AccessType.EXECUTE
      )
    ) {
      setResponseStatus(event, 403);
      return { error: { message: 'Insufficient permissions' } };
    }

    if (fileType === 'file') {
      return {
        ok: {
          message: 'Fetch file meta successfully',
          data: {
            files: [{
              name: filepath.toString(),
              ownerId: fileOwnerId,
              ownerName,
              groupName,
              groupId: fileGroupId,
              fileType,
              createdAt,
              updatedAt,
              permissionBits: filePermissionBits
            }]
          }
        }
      };
    }

    // Handle directory case
    const files = await db.sql`
      SELECT permission_bits, ${'files'}.${'name'}, owner_id, ${'users'}.${'name'} AS owner_name, ${'files'}.${'group_id'}, ${'groups'}.${'name'} AS group_name, file_type, ${'files'}.created_at, ${'files'}.updated_at
      FROM ${'files'}
      JOIN ${'users'} ON ${'files'}.${'owner_id'} = ${'users'}.${'id'}
      JOIN ${'groups'} ON ${'files'}.${'group_id'} = ${'groups'}.${'id'}
      WHERE ${'files'}.${'deleted_at'} IS NULL 
        AND ${'files'}.${'name'} LIKE ${db.param(`${filepath.toString()}/%`)}
        AND ${'files'}.${'name'} NOT LIKE ${db.param(`${filepath.toString()}/%/%`)}
    `.run(dbPool);

    return {
      ok: {
        message: 'Fetch folder\'s content successfully',
        data: {
          files: files.map(({ permission_bits, updated_at, name, file_type, created_at, owner_id, group_id, owner_name, group_name }) => ({
            name,
            fileType: file_type,
            createdAt: created_at,
            ownerId: owner_id,
            groupId: group_id,
            permissionBits: permission_bits,
            updatedAt: updated_at,
            groupName: group_name,
            ownerName: owner_name
          }))
        }
      }
    };
  } catch {
    setResponseStatus(event, 404);
    return { error: { message: 'File not found' } };
  }
});
