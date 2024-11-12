import { fileService } from '~/services';
import { formatArg } from '../utils';
import type { AsyncCommandFunc } from './types';

export const mv: AsyncCommandFunc = async function (...args) {
  // discard `mv`
  args.shift();

  const src = formatArg(args.shift());
  const dest = formatArg(args.shift());
  if (args.length > 0 || !src || !dest) {
    return [
      'Invalid use of mv. Run \'help mv\'',
    ];
  }
  const { umask } = useUmaskStore();
  const res = await fileService.moveFile(src, dest, umask.value);
  if (res.isOk()) {
    return [];
  }
  return [
    res.error()!.message,
  ];
};
