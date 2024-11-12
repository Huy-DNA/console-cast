import { aliasService } from '~/services';
import { formatArg } from '../utils';
import type { AsyncCommandFunc } from './types';

export const unalias: AsyncCommandFunc = async function (...args) {
  // discard `unalias`
  args.shift();

  if (args.length !== 1 || !args[0].trim()) {
    return [
      'Invalid use of unlias. Run \'help unalias\'',
    ];
  }
  const alias = formatArg(args[0])!;
  const res = await aliasService.deleteAlias(alias);
  if (res.isOk()) {
    return [];
  }
  return [
    res.error()!.message,
  ];
};
