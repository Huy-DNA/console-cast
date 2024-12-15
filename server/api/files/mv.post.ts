import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { FileMvErrorCode } from '~/lib';
import { VirtualPath } from '~/lib/path';
import { FileType, AccessType, canAccess } from '~/server/utils';

export default defineEventHandler(async (event) => {
  if (!event.context.auth) {
    return { error: { code: FileMvErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const body = await readBody(event);
  if (
    typeof body !== 'object' ||
    typeof body.src !== 'string' ||
    typeof body.dest !== 'string' ||
    typeof body.permission_bits !== 'string' ||
    typeof body.permission_bits === 'string' && (body.permission_bits.length !== 12 || !body.permission_bits.split('').every((bit: string) => ['0', '1'].includes(bit)))) {
    return { error: { code: FileMvErrorCode.INVALID_BODY, message: 'Invalid body. Expected "src" and "dest" to be strings and permission_bits to be a bit string.' } };
  }
  const src = VirtualPath.create(body.src);
  if (!src.isValid()) {
    return { error: { code: FileMvErrorCode.INVALID_BODY, message: 'Expect the "src" param to be valid path' } };
  }
  const dest = VirtualPath.create(body.dest);
  if (!dest.isValid()) {
    return { error: { code: FileMvErrorCode.INVALID_BODY, message: 'Expect the "dest" param to be valid path' } };
  }
  if (src.isAncestor(dest)) {
    return { error: { code: FileMvErrorCode.MV_TO_DESCENDANT, message: 'Cannot move a folder to it descendant' } };
  }

  try {
    await db.serializable(dbPool, async (dbClient) => {
      const srcFileRecord = await db.selectOne('files', { name: src.toString(), deleted_at: db.conditions.isNull }).run(dbClient);
      if (!srcFileRecord) {
        throw { error: { code: FileMvErrorCode.SRC_NOT_FOUND, message: 'Source not found' } };
      }
      const { permission_bits: srcPermissionBits, file_type: srcFileType, owner_id: srcOwnerId, group_id: srcGroupId, content: srcContent } = srcFileRecord;
      if (
        !canAccess(
          { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
          { fileType: FileType.UNKNOWN, ownerId: srcOwnerId, groupId: srcGroupId, permissionBits: srcPermissionBits },
          AccessType.READ,
        )
      ) {
        throw { error: { code: FileMvErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
      }
      const srcContainerRecord = await db.selectExactlyOne('files', { name: src.parent().toString(), deleted_at: db.conditions.isNull }).run(dbClient);
      const { permission_bits: srcContainerPermissionBits, owner_id: srcContainerOwnerId, group_id: srcContainerGroupId } = srcContainerRecord;
      if (
        !canAccess(
          { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
          { fileType: FileType.UNKNOWN, ownerId: srcContainerOwnerId, groupId: srcContainerGroupId, permissionBits: srcContainerPermissionBits },
          AccessType.WRITE,
        )
      ) {
        throw { error: { code: FileMvErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
      }

      const destFileRecord = await db.selectOne('files', { name: dest.toString(), deleted_at: db.conditions.isNull }).run(dbClient);
      const destContainerFolderRecord = await db.selectOne('files', { name: dest.parent().toString(), deleted_at: db.conditions.isNull, file_type: 'directory' }).run(dbClient);
      if (!destFileRecord && !destContainerFolderRecord) {
        throw { error: { code: FileMvErrorCode.DEST_NOT_FOUND, message: 'Source not found' } };
      }
      const { permission_bits: destPermissionBits, file_type: destFileType, owner_id: destOwnerId, group_id: destGroupId } = (destFileRecord || destContainerFolderRecord)!;
      const destExist = !!destFileRecord;
      if (
        !canAccess(
          { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
          { fileType: FileType.DIRECTORY, ownerId: destOwnerId, groupId: destGroupId, permissionBits: destPermissionBits },
          AccessType.WRITE,
        )
      ) {
        throw { error: { code: FileMvErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
      }
      if (destExist && destFileType === 'file' && srcFileType === 'directory') {
        throw { error: { code: FileMvErrorCode.INVALID_MV_FOLDER_TO_FILE, message: 'Cannot copy a folder to a file' } };
      }
      const destFilename = destExist && destFileType === 'directory' ? dest.resolve(src.basename()).toString() : dest.toString();
      if (srcFileType === 'directory') {
        await db.sql`
          INSERT INTO ${'files'}(name, content, file_type, updated_at, created_at, deleted_at, permission_bits, owner_id, group_id)
          VALUES (${db.param(destFilename)}, NULL, 'directory', NOW(), NOW(), NULL, ${db.param(body.permission_bits)}, ${db.param(event.context.auth.userId)}, ${db.param(event.context.auth.groupId)})
        `.run(dbClient);
        await db.sql`
          INSERT INTO ${'files'}(name, content, file_type, updated_at, created_at, deleted_at, permission_bits, owner_id, group_id)
          SELECT ${db.param(destFilename)} || SUBSTRING(name, ${db.raw((src.toString().length + 1).toString())}) as name, content, file_type, NOW() as updated_at, NOW() as created_at, NULL AS deleted_at, permission_bits, ${db.param(event.context.auth.userId)} AS owner_id, ${db.param(event.context.auth.groupId)} AS group_id
          FROM ${'files'}
          WHERE ${'deleted_at'} is NULL AND ${'name'} LIKE ${db.param(src.toString() + '/%')}
        `.run(dbClient);
      } else if (destExist && destFileType === 'file') {
        await db.update('files', { content: srcContent, updated_at: new Date(Date.now()), file_type: 'file' }, { name: destFilename, deleted_at: db.conditions.isNull }).run(dbClient);
      } else {
        await db.insert('files', {
          name: destFilename,
          content: srcContent,
          file_type: 'file',
          created_at: new Date(Date.now()),
          updated_at: new Date(Date.now()),
          owner_id: event.context.auth.userId,
          group_id: event.context.auth.groupId,
          permission_bits: body.permission_bits,
        }).run(dbClient);
      }
      await db.update('files', { deleted_at: new Date(Date.now()) }, { name: db.conditions.like(`${src.toString()}/%`), deleted_at: db.conditions.isNull }).run(dbClient);
      await db.update('files', { deleted_at: new Date(Date.now()) }, { name: src.toString(), deleted_at: db.conditions.isNull }).run(dbClient);
    });
  } catch (e) {
    return e;
  }

  return { ok: { message: 'Move file successfully' } };
});
