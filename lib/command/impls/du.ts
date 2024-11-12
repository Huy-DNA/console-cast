import { fileService } from '~/services';
import { formatArg } from '../utils';
import type { AsyncCommandFunc } from './types';

export const du: AsyncCommandFunc = async function (...args) {
  // discard `du`
  args.shift();

  return [];
};
