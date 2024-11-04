import { type ColoredContent, Color } from '~/lib';
import { echo } from './impls/echo';
import { help } from './impls/help';
import { Command } from './impls/types';
import { interpretAnsiEscapeColor } from './utils';
import { parse } from '../services/parse';
import { cd } from './impls/cd';
import { su } from './impls/su';
import { ls } from './impls/ls';
import { useradd } from './impls/useradd';

export async function execute(command: string): Promise<ColoredContent> {
  const args = parse(command);
  if (!args[0]?.trim()) {
    args.shift();
  }
  if (!args.length) {
    return [[{ content: ' ', color: Color.WHITE }]];
  }
  let res;
  switch (args[0] as Command) {
  case Command.ECHO:
    res = echo(...(args as any));
    break;
  case Command.HELP:
    res = help(...args as any);
    break;
  case Command.CD:
    res = await cd(...args as any);
    break;
  case Command.SU:
    res = await su(...args as any);
    break;
  case Command.LS:
    res = await ls(...args as any);
    break;
  case Command.USERADD:
    res = await useradd(...args as any);
    break;
  default:
    res = echo('echo', ' ', `Unknown command:\\u001b[31m ${args[0]}`);
    break;
  }
  return interpretAnsiEscapeColor(res);
}
