import { fileService } from '../../services';
import { stripQuotes } from '../utils';
import type { AsyncCommandFunc } from './types';

export const mkdir: AsyncCommandFunc = async function (...args) {
  // discard `mkdir`
  args.shift();

  if (args.length !== 1) {
    return ['Invalid use of mkdir. Run \'help mkdir\''];
  }

  const filename = stripQuotes(args[0])!;
  
  const { umask } = useUmaskStore();
  const res = await fileService.createFolder(filename, umask.value);
  if (res.isOk()) {
    return [];
  }
  return [
    res.error()!.message,
  ];
};
