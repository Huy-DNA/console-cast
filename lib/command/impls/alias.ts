import { aliasService } from '~/services';
import { formatArg } from '../utils';
import type { AsyncCommandFunc } from './types';

export const alias: AsyncCommandFunc = async function (...args) {
  // discard `alias`
  args.shift();

  if (args.length !== 1 || !args[0].trim()) {
    return [
      'Invalid use of alias. Run \'help alias\'',
    ];
  }

  const aliasExpr = formatArg(args[0])!;
  return [];
};
