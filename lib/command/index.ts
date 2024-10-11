import { type ColoredContent, Color } from '~/lib';
import { echo } from './impls/echo';
import { Command } from './impls/types';
import { interpretAnsiEscapeColor } from './utils';
import { parse } from '../services/parse';

export async function execute (command: string): Promise<ColoredContent> {
  const args = parse(command);
  if (!args[0].trim()) {
    args.shift();
  }
  if (!args.length) {
    return [[{ content: ' ', color: Color.WHITE }]];
  }
  let res;
  switch (args[0] as Command) {
    case Command.ECHO:
      res = echo(...args as any);
      break;
    default:
      res = echo('echo', ' ', `Unknown command:\\u001b[31m ${args[0]}`);
      break;
  }
  return interpretAnsiEscapeColor(res);
}
