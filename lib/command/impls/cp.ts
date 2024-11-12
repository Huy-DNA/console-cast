import { fileService } from '~/services';
import { formatArg } from '../utils';
import type { AsyncCommandFunc } from './types';

export const cp: AsyncCommandFunc = async function(...args) {
  // discard `cp`
  args.shift();
  // discard first space
  args.shift();

  const src = formatArg(args.shift());
  args.shift();
  const dest = formatArg(args.shift());
  args.shift();
  if (args.length > 0 || !src || !dest) {
    return [
      'Invalid use of cp. Run \'help cp\'',
    ];
  }
  const { umask } = useUmaskStore();
  const res = await fileService.copyFile(src, dest, umask.value);
  if (res.isOk()) {
    return [];
  }
  return [
    res.error()!.message,
  ];
};
