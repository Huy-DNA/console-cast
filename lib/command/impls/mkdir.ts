import { formatArg } from '../utils';
import type { CommandFunc } from './types';

export const mkdir: CommandFunc = async function(...args) {
  // discard `mkdir`
  args.shift();
  // discard first space
  args.shift();

  return [
  ];
};
