import { formatArg } from '../utils';
import type { CommandFunc } from './types';

export const umask: CommandFunc = async function(...args) {
  // discard `umask`
  args.shift();
  // discard first space
  args.shift();

  if (args.length === 0) {
    return [];
  }

  if (args.length > 1) {
    const umask = formatArg(args[0]);
    return [];
  }

  return [
  ];
};
