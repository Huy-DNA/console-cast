import { formatArg } from '../utils';
import type { CommandFunc } from './types';
import { fileService } from '~/services/files';

export const ls: CommandFunc = async function(...args) {
  // discard `ls`
  args.shift();
  // discard first space
  args.shift();

  if (args.length > 1) {
    return ['Expect an optional dirname as argument.'];
  }

  const dirname = args.length ? formatArg(args[0]) : '.';
  const res = await fileService.getFolderContent(dirname);

  if (res.isOk()) {
    const files = res.unwrap();
    console.log(files);
    return [
      `total ${files.length}`,
      ...files.map((file) => `${formatFileType(file.fileType as string)}${formatPermissionBits(file.permission as unknown as string)} ${file.ownerId} ${file.groupId} ${file.name}`),
    ];
  }

  return [
    res.error()!.message,
  ];
};

function formatFileType(fileType: string): string {
  switch (fileType) {
  case 'file': return '-';
  case 'directory': return 'd';
  case 'symlink': return 'l';
  default: throw new Error('Unreachable');
  }
}

function formatPermissionBits(permissionBits: string): string {
  const ownerRead = permissionBits[3];
  const ownerWrite = permissionBits[4];
  const ownerExecute = permissionBits[5];
  const groupRead = permissionBits[6];
  const groupWrite = permissionBits[7];
  const groupExecute = permissionBits[8];
  const otherRead = permissionBits[9];
  const otherWrite = permissionBits[10];
  const otherExecute = permissionBits[11];
  return `${ownerRead ? 'r' : '-'}${ownerWrite ? 'w' : '-'}${ownerExecute ? 'x' : '-'}${groupRead ? 'r' : '-'}${groupWrite ? 'w' : '-'}${groupExecute ? 'x' : '-'}${otherRead ? 'r' : '-'}${otherWrite ? 'w' : '-'}${otherExecute ? 'x' : '-'}`;
}