import { fileService } from '~/services';
import { stripQuotes } from '../utils';
import type { AsyncCommandFunc } from './types';

export const mv: AsyncCommandFunc = async function (...args) {
  // discard `mv`
  args.shift();

  const src = stripQuotes(args.shift());
  const dest = stripQuotes(args.shift());
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
