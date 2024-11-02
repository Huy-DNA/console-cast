export function trimQuote (value: string): string {
  if (['"', '\''].includes(value[0])) {
    value = value.slice(1);
  }
  if (['"', '\''].includes(value[value.length - 1])) {
    value = value.slice(0, value.length - 1);
  }
  return value;
}

export const enum AccessType {
  READ,
  WRITE,
  EXECUTE,
}

export const enum FileType {
  REGULAR_FILE,
  DIRECTORY,
}

export interface TargetFilePermission {
  fileType: FileType;
  ownerId: number;
  groupId: number;
  permissionBits: string & { length: 12; [index: number]: '0' | '1' };
}

export interface Accessor {
  userId: number;
  groupId: number;
}

export function canAccess (accessor: Accessor, file: TargetFilePermission, accessType: AccessType): boolean {
  const accessBitIndex = accessType === AccessType.READ ? 0 : accessType === AccessType.WRITE ? 1 : 2;
  const userKindIndex = file.ownerId === accessor.userId ? 2 : file.groupId === accessor.groupId ? 1 : 0;
  const bitIndex = userKindIndex * 3 + accessBitIndex;
  return file.permissionBits[bitIndex] === '1';
}
