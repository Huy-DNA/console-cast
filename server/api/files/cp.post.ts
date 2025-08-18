import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { VirtualPath } from '~/utils/path';
import { AccessType, canAccess, FileType } from '~/server/utils';
import Joi from 'joi';

const bodySchema = Joi.object({
  src: Joi.string().required(),
  dest: Joi.string().required(),
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

  const src = VirtualPath.createUnchecked(validatedBody.src);
  if (!src.isValid()) {
    setResponseStatus(event, 400);
    return { error: { message: 'Invalid source path' } };
  }

  const dest = VirtualPath.createUnchecked(validatedBody.dest);
  if (!dest.isValid()) {
    setResponseStatus(event, 400);
    return { error: { message: 'Invalid destination path' } };
  }

  if (src.isAncestor(dest)) {
    setResponseStatus(event, 400);
    return { error: { message: 'Cannot move a folder to its descendant' } };
  }

  const result = await db.serializable(dbPool, async (dbClient) => {
    const srcFileRecord = await db.selectOne('files', { 
      name: src.toString(), 
      deleted_at: db.conditions.isNull 
    }).run(dbClient);

    if (!srcFileRecord) {
      return { error: { message: 'Source not found' }, statusCode: 404 };
    }

    const { permission_bits: srcPermissionBits, file_type: srcFileType, owner_id: srcOwnerId, group_id: srcGroupId, content: srcContent } = srcFileRecord;

    if (
      !canAccess(
        { userId: auth.userId, groupId: auth.groupId },
        { fileType: FileType.UNKNOWN, ownerId: srcOwnerId, groupId: srcGroupId, permissionBits: srcPermissionBits },
        AccessType.READ
      )
    ) {
      return { error: { message: 'Insufficient permissions for source file' }, statusCode: 403 };
    }

    const srcContainerRecord = await db.selectExactlyOne('files', { 
      name: src.parent().toString(), 
      deleted_at: db.conditions.isNull 
    }).run(dbClient);

    const { permission_bits: srcContainerPermissionBits, owner_id: srcContainerOwnerId, group_id: srcContainerGroupId } = srcContainerRecord;

    if (
      !canAccess(
        { userId: auth.userId, groupId: auth.groupId },
        { fileType: FileType.UNKNOWN, ownerId: srcContainerOwnerId, groupId: srcContainerGroupId, permissionBits: srcContainerPermissionBits },
        AccessType.WRITE
      )
    ) {
      return { error: { message: 'Insufficient permissions for source container' }, statusCode: 403 };
    }

    const destFileRecord = await db.selectOne('files', { 
      name: dest.toString(), 
      deleted_at: db.conditions.isNull 
    }).run(dbClient);

    const destContainerFolderRecord = await db.selectOne('files', { 
      name: dest.parent().toString(), 
      deleted_at: db.conditions.isNull, 
      file_type: 'directory' 
    }).run(dbClient);

    if (!destFileRecord && !destContainerFolderRecord) {
      return { error: { message: 'Destination not found' }, statusCode: 404 };
    }

    const { permission_bits: destPermissionBits, file_type: destFileType, owner_id: destOwnerId, group_id: destGroupId } = (destFileRecord || destContainerFolderRecord)!;
    const destExist = !!destFileRecord;

    if (
      !canAccess(
        { userId: auth.userId, groupId: auth.groupId },
        { fileType: FileType.DIRECTORY, ownerId: destOwnerId, groupId: destGroupId, permissionBits: destPermissionBits },
        AccessType.WRITE
      )
    ) {
      return { error: { message: 'Insufficient permissions for destination' }, statusCode: 403 };
    }

    if (destExist && destFileType === 'file' && srcFileType === 'directory') {
      return { error: { message: 'Cannot copy a folder to a file' }, statusCode: 400 };
    }

    const destFilename = destExist && destFileType === 'directory' ? dest.resolve(src.basename()).toString() : dest.toString();

    if (srcFileType === 'directory') {
      await db.sql`
        INSERT INTO ${'files'}(name, content, file_type, updated_at, created_at, deleted_at, permission_bits, owner_id, group_id)
        VALUES (${db.param(destFilename)}, NULL, 'directory', NOW(), NOW(), NULL, ${db.param(validatedBody.permission_bits)}, ${db.param(auth.userId)}, ${db.param(auth.groupId)})
      `.run(dbClient);
      await db.sql`
        INSERT INTO ${'files'}(name, content, file_type, updated_at, created_at, deleted_at, permission_bits, owner_id, group_id)
        SELECT ${db.param(destFilename)} || SUBSTRING(name, ${db.raw((src.toString().length + 1).toString())}) as name, content, file_type, NOW() as updated_at, NOW() as created_at, NULL AS deleted_at, permission_bits, ${db.param(auth.userId)} AS owner_id, ${db.param(auth.groupId)} AS group_id
        FROM ${'files'}
        WHERE ${'deleted_at'} is NULL AND ${'name'} LIKE ${db.param(src.toString() + '/%')}
      `.run(dbClient);
    } else if (destExist && destFileType === 'file') {
      await db.update('files', { 
        content: srcContent, 
        updated_at: new Date(), 
        file_type: 'file' 
      }, { 
        name: destFilename, 
        deleted_at: db.conditions.isNull 
      }).run(dbClient);
    } else {
      await db.insert('files', {
        name: destFilename,
        content: srcContent,
        file_type: 'file',
        created_at: new Date(),
        updated_at: new Date(),
        owner_id: auth.userId,
        group_id: auth.groupId,
        permission_bits: validatedBody.permission_bits
      }).run(dbClient);
    }

    await db.update('files', { 
      deleted_at: new Date() 
    }, { 
      name: db.conditions.like(`${src.toString()}/%`), 
      deleted_at: db.conditions.isNull 
    }).run(dbClient);
    await db.update('files', { 
      deleted_at: new Date() 
    }, { 
      name: src.toString(), 
      deleted_at: db.conditions.isNull 
    }).run(dbClient);

    return { success: true };
  });

  if ('error' in result) {
    setResponseStatus(event, result.statusCode);
    return { error: { message: result.error?.message } };
  }

  return { ok: { message: 'Move file successfully' } };
});
