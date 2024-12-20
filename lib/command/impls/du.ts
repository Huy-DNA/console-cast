import { fileService } from '~/services';
import { formatArg } from '../utils';
import type { AsyncCommandFunc } from './types';

export const du: AsyncCommandFunc = async function (...args) {
  // discard `du`
  args.shift();

  if (args.length > 1) {
    return [
      'Invalid use of du. Run \'help du\'',
    ];
  }

  const pathname = formatArg(args[0]) || '.';
  const res = await fileService.getFileSize(pathname);
  if (res.isOk()) {
    return [
      `${pathname}   ${res.unwrap()}B`,
    ];
  }
  return [
    res.error()!.message,
  ];
};
