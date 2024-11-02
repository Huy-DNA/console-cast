import type { EventHandlerRequest, H3Event } from 'h3';
import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { VirtualPath } from '~/lib/path';
import { AccessType, canAccess, FileType, trimQuote } from '~/server/utils';

export enum FileMetaPatchErrorCode {
  INVALID_PARAM = 1000,
  INVALID_BODY = 1001,
  NOT_ENOUGH_PRIVILEGE = 2000,
  FILE_NOT_FOUND = 3000,
  DESTINATION_NOT_EXIST = 3001,
  SOURCE_NOT_EXIST = 3002,
}

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: FileMetaPatchErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    return { error: { code: FileMetaPatchErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const body = await readBody(event);
  if (
    typeof body !== 'object'
    || !['number', 'undefined'].includes(typeof body.owner_id)
    || !['string', 'undefined'].includes(typeof body.file_name)
    || !['string', 'undefined'].includes(typeof body.permission_bits)
    || typeof body.permission_bits === 'string' && (body.permission_bits.length !== 12 || !body.permission_bits.split('').every((bit: string) => ['0', '1'].includes(bit)))) {
    return { error: { code: FileMetaPatchErrorCode.INVALID_BODY, message: 'Invalid body. Expected "owner_id" to be an optional number and "file_name" to be an optional string and "permission_bits" to be an optional bit string.' } };
  }
  const { owner_id, file_name, permission_bits } = body;
  try {
    await db.readCommitted(dbPool, async (txnClient) => {
      await Promise.all([
        handleOwnerChange(txnClient, event, owner_id),
        handlePermissionChange(txnClient, event, permission_bits),
        handleNameChange(txnClient, event, file_name),
      ]);
    });
  } catch (e) {
    return e;
  }
  return { ok: { message: 'Patch file information successfully' } };
});


async function handleNameChange<T extends db.IsolationLevel>(dbClient: db.TxnClient<T>, event: H3Event<EventHandlerRequest>, newFileName: string) {
  const { name } = getQuery(event);
  const oldFilepath = VirtualPath.create(trimQuote(name as string));
  const oldContainerPath = oldFilepath.parent();
  const newContainerPath = VirtualPath.create(trimQuote(newFileName)).parent();

  let oldContainerDirPermissionBits, oldContainerDirOwnerId, oldContainerDirGroupId;
  try {
    const { permission_bits, owner_id, group_id } = await db.selectExactlyOne('files', { name: oldContainerPath.toString(), file_type: 'directory' }).run(dbClient);
    oldContainerDirPermissionBits = permission_bits;
    oldContainerDirOwnerId = owner_id;
    oldContainerDirGroupId = group_id;
  } catch {
    throw { error: { code: FileMetaPatchErrorCode.SOURCE_NOT_EXIST, message: 'File not found' } };
  }

  if (
    !canAccess(
      { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
      { fileType: FileType.DIRECTORY, ownerId: oldContainerDirOwnerId, groupId: oldContainerDirGroupId, permissionBits: oldContainerDirPermissionBits },
      AccessType.WRITE,
    )
  ) {
    throw { error: { code: FileMetaPatchErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }

  let newContainerDirPermissionBits, newContainerDirOwnerId, newContainerDirGroupId;
  try {
    const { permission_bits, owner_id, group_id } = await db.selectExactlyOne('files', { name: newContainerPath.toString(), file_type: 'directory' }).run(dbClient);
    newContainerDirPermissionBits = permission_bits;
    newContainerDirOwnerId = owner_id;
    newContainerDirGroupId = group_id;
  } catch {
    throw { error: { code: FileMetaPatchErrorCode.DESTINATION_NOT_EXIST, message: 'Destination does not exist' } };
  }

  if (
    !canAccess(
      { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
      { fileType: FileType.DIRECTORY, ownerId: newContainerDirOwnerId, groupId: newContainerDirGroupId, permissionBits: newContainerDirPermissionBits },
      AccessType.WRITE,
    )
  ) {
    throw { error: { code: FileMetaPatchErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }

  try {
    await db.update('files', { name: newFileName }, { name: oldFilepath.toString(), deleted_at: db.conditions.isNull }).run(dbClient);
  } catch {
    throw { error: { code: FileMetaPatchErrorCode.SOURCE_NOT_EXIST, message: 'File not found' } };
  }
}

async function handleOwnerChange<T extends db.IsolationLevel>(dbClient: db.TxnClient<T>, event: H3Event<EventHandlerRequest>, ownerId: number) {
  const { name } = getQuery(event);
  const filepath = VirtualPath.create(trimQuote(name as string));

  let oldOwnerId;
  try {
    const { owner_id } = await db.selectExactlyOne('files', { name: filepath.toString() }).run(dbClient);
    oldOwnerId = owner_id;
  } catch {
    throw { error: { code: FileMetaPatchErrorCode.FILE_NOT_FOUND, message: 'File not found' } };
  }

  if (oldOwnerId !== event.context.auth.userId) {
    throw { error: { code: FileMetaPatchErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Only owner can change its file ownership' } };
  }

  await db.update('files', { owner_id: ownerId }, { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbClient);
}

async function handlePermissionChange<T extends db.IsolationLevel>(dbClient: db.TxnClient<T>, event: H3Event<EventHandlerRequest>, permissionBits: string) {
  const { name } = getQuery(event);
  const filepath = VirtualPath.create(trimQuote(name as string));

  let ownerId;
  try {
    const { owner_id } = await db.selectExactlyOne('files', { name: filepath.toString() }).run(dbClient);
    ownerId = owner_id;
  } catch {
    throw { error: { code: FileMetaPatchErrorCode.FILE_NOT_FOUND, message: 'File not found' } };
  }

  if (ownerId !== event.context.auth.userId) {
    throw { error: { code: FileMetaPatchErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Only owner can change its file permission' } };
  }

  await db.update('files', { permission_bits: permissionBits }, { name: filepath.toString(), deleted_at: db.conditions.isNull }).run(dbClient);
}
