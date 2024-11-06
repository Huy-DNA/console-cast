import { fileService } from '~/services';
import { formatArg } from '../utils';
import type { CommandFunc } from './types';

export const cp: CommandFunc = async function(...args) {
  // discard `cp`
  args.shift();
  // discard first space
  args.shift();

  return [
  ];
};
