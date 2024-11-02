import { formatArg } from '../utils';
import type { CommandFunc } from './types';

export const cd: CommandFunc = function(...args) {
  // discard `cd`
  args.shift();
  // discard first space
  args.shift();

  return [
    args.map((arg) => {
      if (!arg.trim()) return '';
      return formatArg(arg);
    }).filter((arg) => arg).join(' '),
  ];
};
