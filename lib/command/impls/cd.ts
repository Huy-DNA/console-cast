import { formatArg } from '../utils';
import type { CommandFunc } from './types';

export const cd: CommandFunc = function(...args) {
  // discard `cd`
  args.shift();
  // discard first space
  args.shift();

  if (args.length !== 1 || !args[0].trim()) {
    return [
      'Expected an absolute or relative directory name',
    ];
  }
  return [
  ];
};
