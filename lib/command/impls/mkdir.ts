import { fileService } from '~/services';
import { formatArg } from '../utils';
import type { AsyncCommandFunc } from './types';

export const mkdir: AsyncCommandFunc = async function (...args) {
  // discard `mkdir`
  args.shift();

  if (args.length !== 1) {
    return ['Invalid use of mkdir. Run \'help mkdir\''];
  }

  const filename = formatArg(args[0])!;
  
  const { umask } = useUmaskStore();
  const res = await fileService.createFolder(filename, umask.value);
  if (res.isOk()) {
    return [];
  }
  return [
    res.error()!.message,
  ];
};
