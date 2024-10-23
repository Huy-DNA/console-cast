import { formatArg } from "~/lib/command/utils";

export function trimQuote (value: string): string {
  if (['"', '\''].includes(value[0])) {
    value = value.slice(1);
  }
  if (['"', '\''].includes(value[value.length - 1])) {
    value = value.slice(0, value.length - 1);
  }
  return value;
}

export function isPathNameValid (name: string): boolean {
  return name.match(/^[a-zA-Z 0-9\._/]+$/g) !== null;
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
  permissionBits: boolean[] & { length: 12 };
}

export interface Accessor {
  userId: number;
  groupId: number;
}

export function canAccess (accessor: Accessor, file: TargetFilePermission, accessType: AccessType): boolean {
  const accessBitIndex = accessType === AccessType.READ ? 0 : accessType === AccessType.WRITE ? 1 : 2;
  const userKindIndex = file.ownerId === accessor.userId ? 2 : file.groupId === accessor.groupId ? 1 : 0;
  const bitIndex = userKindIndex * 3 + accessBitIndex;
  return file.permissionBits[bitIndex];
}

export function normalizePathname (name: string): string {
  const unquotedName = formatArg(name);
  if (unquotedName[unquotedName.length - 1] === '/') return unquotedName.slice(0, unquotedName.length - 1);
  return unquotedName;
}
