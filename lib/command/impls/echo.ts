import { formatArg } from '../utils';
import type { CommandFunc } from './types';

export const echo: CommandFunc = function (...args) {
  // discard `echo`
  args.shift();

  return [
    args.map((arg) => {
      if (!arg.trim()) return '';
      return formatArg(arg);
    }).filter((arg) => arg).join(' '),
  ];
};
