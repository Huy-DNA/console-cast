import type { EventHandlerRequest, H3Event } from 'h3';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { VirtualPath } from '~/utils/path';
import { AccessType, canAccess, FileType, trimQuote } from '~/server/utils';
import Joi from 'joi';

const querySchema = Joi.object({
  name: Joi.string().required()
});

const bodySchema = Joi.object({
  owner_id: Joi.number().optional(),
  file_name: Joi.string().optional(),
  permission_bits: Joi.string()
    .length(12)
    .pattern(/^[01]{12}$/, 'binary string')
    .optional()
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

  if (!validatedBody.owner_id && !validatedBody.file_name && !validatedBody.permission_bits) {
    setResponseStatus(event, 400);
    return { error: { message: 'At least one of owner_id, file_name, or permission_bits must be provided' } };
  }

  try {
    await db.readCommitted(dbPool, async (txnClient) => {
      await Promise.all([
        validatedBody.file_name ? handleNameChange(txnClient, event, query.name, validatedBody.file_name, auth) : Promise.resolve(),
        validatedBody.owner_id ? handleOwnerChange(txnClient, event, query.name, validatedBody.owner_id, auth) : Promise.resolve(),
        validatedBody.permission_bits ? handlePermissionChange(txnClient, event, query.name, validatedBody.permission_bits, auth) : Promise.resolve(),
      ]);
    });
  } catch (e) {
    return e;
  }

  return { ok: { message: 'Patch file information successfully' } };
});

async function handleNameChange<T extends db.IsolationLevel> (
  dbClient: db.TxnClient<T>,
  event: H3Event<EventHandlerRequest>,
  oldName: string,
  newFileName: string,
  auth: { userId: number; groupId: number }
) {
  const oldFilepath = VirtualPath.createUnchecked(trimQuote(oldName));
  if (!oldFilepath.isValid()) {
    setResponseStatus(event, 400);
    throw { error: { message: 'Invalid file path' } };
  }

  const oldContainerPath = oldFilepath.parent();
  const newFilepath = VirtualPath.createUnchecked(trimQuote(newFileName));
  if (!newFilepath.isValid()) {
    setResponseStatus(event, 400);
    throw { error: { message: 'Invalid new file path' } };
  }

  const newContainerPath = newFilepath.parent();

  const oldContainerDirRecord = await db.selectExactlyOne('files', { 
    name: oldContainerPath.toString(), 
    file_type: 'directory', 
    deleted_at: db.conditions.isNull 
  }).run(dbClient).catch(() => {
    setResponseStatus(event, 404);
    throw { error: { message: 'Source container directory not found' } };
  });

  const { permission_bits: oldContainerDirPermissionBits, owner_id: oldContainerDirOwnerId, group_id: oldContainerDirGroupId } = oldContainerDirRecord;

  if (
    !canAccess(
      { userId: auth.userId, groupId: auth.groupId },
      { fileType: FileType.DIRECTORY, ownerId: oldContainerDirOwnerId, groupId: oldContainerDirGroupId, permissionBits: oldContainerDirPermissionBits },
      AccessType.WRITE
    )
  ) {
    setResponseStatus(event, 403);
    throw { error: { message: 'Insufficient permissions for source container directory' } };
  }

  const newContainerDirRecord = await db.selectExactlyOne('files', { 
    name: newContainerPath.toString(), 
    file_type: 'directory', 
    deleted_at: db.conditions.isNull 
  }).run(dbClient).catch(() => {
    setResponseStatus(event, 404);
    throw { error: { message: 'Destination container directory not found' } };
  });

  const { permission_bits: newContainerDirPermissionBits, owner_id: newContainerDirOwnerId, group_id: newContainerDirGroupId } = newContainerDirRecord;

  if (
    !canAccess(
      { userId: auth.userId, groupId: auth.groupId },
      { fileType: FileType.DIRECTORY, ownerId: newContainerDirOwnerId, groupId: newContainerDirGroupId, permissionBits: newContainerDirPermissionBits },
      AccessType.WRITE
    )
  ) {
    setResponseStatus(event, 403);
    throw { error: { message: 'Insufficient permissions for destination container directory' } };
  }

  await db.update('files', { name: newFileName }, { name: oldFilepath.toString(), deleted_at: db.conditions.isNull }).run(dbClient).catch(() => {
    setResponseStatus(event, 404);
    throw { error: { message: 'File not found' } };
  });
}

async function handleOwnerChange<T extends db.IsolationLevel> (
  dbClient: db.TxnClient<T>,
  event: H3Event<EventHandlerRequest>,
  name: string,
  ownerId: number,
  auth: { userId: number; groupId: number }
) {
  const filepath = VirtualPath.createUnchecked(trimQuote(name));
  if (!filepath.isValid()) {
    setResponseStatus(event, 400);
    throw { error: { message: 'Invalid file path' } };
  }

  const fileRecord = await db.selectExactlyOne('files', { 
    name: filepath.toString(), 
    deleted_at: db.conditions.isNull 
  }).run(dbClient).catch(() => {
    setResponseStatus(event, 404);
    throw { error: { message: 'File not found' } };
  });

  if (fileRecord.owner_id !== auth.userId) {
    setResponseStatus(event, 401);
    throw { error: { message: 'Only owner can change file ownership' } };
  }

  await db.update('files', { owner_id: ownerId }, { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbClient);
}

async function handlePermissionChange<T extends db.IsolationLevel> (
  dbClient: db.TxnClient<T>,
  event: H3Event<EventHandlerRequest>,
  name: string,
  permissionBits: string,
  auth: { userId: number; groupId: number }
) {
  const filepath = VirtualPath.createUnchecked(trimQuote(name));
  if (!filepath.isValid()) {
    setResponseStatus(event, 400);
    throw { error: { message: 'Invalid file path' } };
  }

  const fileRecord = await db.selectExactlyOne('files', { 
    name: filepath.toString(), 
    deleted_at: db.conditions.isNull 
  }).run(dbClient).catch(() => {
    setResponseStatus(event, 404);
    throw { error: { message: 'File not found' } };
  });

  if (fileRecord.owner_id !== auth.userId) {
    setResponseStatus(event, 401);
    throw { error: { message: 'Only owner can change file permissions' } };
  }

  await db.update('files', { permission_bits: permissionBits }, { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbClient);
}
