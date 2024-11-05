import { fileService } from '~/services';
import { formatArg } from '../utils';
import type { CommandFunc } from './types';

export const rm: CommandFunc = async function(...args) {
  // discard `rm`
  args.shift();
  // discard first space
  args.shift();

  return [];
};
