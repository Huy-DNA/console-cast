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
  return [];
};
