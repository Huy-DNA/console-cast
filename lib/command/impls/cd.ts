import { fileService } from '~/services';
import { formatArg } from '../utils';
import type { CommandFunc } from './types';

export const cd: CommandFunc = async function(...args) {
  // discard `cd`
  args.shift();
  // discard first space
  args.shift();

  if (args.length !== 1 || !args[0].trim()) {
    return [
      'Expected an absolute or relative directory name',
    ];
  }

  const dirname = formatArg(args[0]);
  const res = await fileService.changeDirectory(dirname);
  if (res.isOk()) {
    return [];
  }
  return [
    res.error()!.message,
  ];
};
