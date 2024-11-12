import { fileService } from '~/services';
import { formatArg } from '../utils';
import type { AsyncCommandFunc } from './types';

export const cat: AsyncCommandFunc = async function (...args) {
  // discard `cd`
  args.shift();

  if (args.length !== 1 || !args[0].trim()) {
    return [
      'Expected an absolute or relative file name',
    ];
  }

  const filename = formatArg(args[0])!;
  const res = await fileService.getFileContent(filename);
  if (res.isOk()) {
    return [res.unwrap()];
  }
  return [
    res.error()!.message,
  ];
};
