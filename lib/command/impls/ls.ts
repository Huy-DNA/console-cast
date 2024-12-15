import { formatArg } from '../utils';
import type { AsyncCommandFunc } from './types';
import { fileService } from '~/services/files';

export const ls: AsyncCommandFunc = async function (...args) {
  // discard `ls`
  args.shift();

  if (args.length > 1) {
    return ['Expect an optional dirname as argument.'];
  }

  const dirname = args.length ? formatArg(args[0])! : '.';
  const res = await fileService.getFolderContent(dirname);

  if (res.isOk()) {
    const files = res.unwrap();
    const fileLines = [];
    for (const file of files) {
      const fileType = formatFileType(file.fileType as string);
      const filePermissionBits = formatPermissionBits(file.permission as unknown as string);
      const fileOwner = file.ownerName;
      const fileGroup = file.groupName;
      fileLines.push(`${fileType}${filePermissionBits} ${fileOwner} ${fileGroup} ${file.name}`);
    }
    return [
      `total ${files.length}`,
      ...fileLines,
    ];
  }

  return [
    res.error()!.message,
  ];
};

function formatFileType (fileType: string): string {
  switch (fileType) {
  case 'file': return '-';
  case 'directory': return 'd';
  case 'symlink': return 'l';
  default: throw new Error('Unreachable');
  }
}

function formatPermissionBits (permissionBits: string): string {
  const ownerRead = Number.parseInt(permissionBits[3]);
  const ownerWrite = Number.parseInt(permissionBits[4]);
  const ownerExecute = Number.parseInt(permissionBits[5]);
  const groupRead = Number.parseInt(permissionBits[6]);
  const groupWrite = Number.parseInt(permissionBits[7]);
  const groupExecute = Number.parseInt(permissionBits[8]);
  const otherRead = Number.parseInt(permissionBits[9]);
  const otherWrite = Number.parseInt(permissionBits[10]);
  const otherExecute = Number.parseInt(permissionBits[11]);
  return `${ownerRead ? 'r' : '-'}${ownerWrite ? 'w' : '-'}${ownerExecute ? 'x' : '-'}${groupRead ? 'r' : '-'}${groupWrite ? 'w' : '-'}${groupExecute ? 'x' : '-'}${otherRead ? 'r' : '-'}${otherWrite ? 'w' : '-'}${otherExecute ? 'x' : '-'}`;
}
