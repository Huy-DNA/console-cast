import { formatArg } from '../utils';
import type { CommandFunc } from './types';

export const touch: CommandFunc = async function(...args) {
  // discard `touch`
  args.shift();
  // discard first space
  args.shift();

  return [
  ];
};
