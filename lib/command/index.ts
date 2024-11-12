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
import { touch } from './impls/touch';
import { mkdir } from './impls/mkdir';
import { umask } from './impls/umask';
import { rm } from './impls/rm';
import { cp } from './impls/cp';
import { mv } from './impls/mv';

export async function execute(command: string): Promise<ColoredContent> {
  const args = parse(command);
  if (!args[0]?.trim()) {
    args.shift();
  }
  if (!args.length) {
    return [[{ content: ' ', color: Color.WHITE }]];
  }
  const output = await commandDispatch(args);
  return interpretAnsiEscapeColor(output);
}

async function commandDispatch(args: string[]): Promise<string[]> {
  switch (args[0] as Command) {
  case Command.ECHO:
    return echo(...args);
  case Command.HELP:
    return help(...args);
  case Command.CD:
    return await cd(...args);
  case Command.SU:
    return await su(...args);
  case Command.LS:
    return await ls(...args);
  case Command.USERADD:
    return await useradd(...args);
  case Command.TOUCH:
    return await touch(...args);
  case Command.MKDIR:
    return await mkdir(...args);
  case Command.UMASK:
    return await umask(...args);
  case Command.CP:
    return await cp(...args);
  case Command.MV:
    return await mv(...args);
  case Command.RM:
    return await rm(...args);
  default:
    return echo('echo', ' ', `Unknown command:\\u001b[31m ${args[0]}`);
  }
}
