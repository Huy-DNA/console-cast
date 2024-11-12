import * as db from 'zapatos/db';
import { dbPool } from '~/db/connection';
import { FileMetaGetErrorCode } from '~/lib';
import { VirtualPath } from '~/lib/path';
import { AccessType, canAccess, FileType, trimQuote } from '~/server/utils';

export default defineEventHandler(async (event) => {
  const { name } = getQuery(event);
  if (typeof name !== 'string') {
    return { error: { code: FileMetaGetErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be string' } };
  }
  if (!event.context.auth) {
    return { error: { code: FileMetaGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const filepath = VirtualPath.create(trimQuote(name));
  if (!filepath.isValid()) {
    return { error: { code: FileMetaGetErrorCode.INVALID_PARAM, message: 'Expect the "name" query param to be valid path' } };
  }
  const fileRecord = await db.selectOne('files', { name: filepath.toString() }).run(dbPool);
  if (!fileRecord) return { error: { code: FileMetaGetErrorCode.FILE_NOT_FOUND, message: 'File not found' } };
  if (
    !canAccess(
      { userId: event.context.auth.userId as number, groupId: event.context.auth.groupId as number },
      { fileType: FileType.DIRECTORY, ownerId: fileRecord.owner_id, groupId: fileRecord.group_id, permissionBits: fileRecord.permission_bits },
      AccessType.READ,
    )
  ) {
    return { error: { code: FileMetaGetErrorCode.NOT_ENOUGH_PRIVILEGE, message: 'Should be logged in as a user with enough privilege' } };
  }
  const [{ size }] = await db.sql`
    SELECT SUM(pg_column_size(${'files'}.*)) as size
    FROM ${'files'}
    WHERE ${'name'} LIKE ${db.param(`${filepath.toString()}/%`)} OR ${'name'} = ${db.param(filepath.toString())}
  `.run(dbPool);
  return { ok: { message: 'Fetch file size successfully', data: { size: Number.parseInt(size) } } };
});
