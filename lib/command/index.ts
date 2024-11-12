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
  let output;
  switch (args[0] as Command) {
  case Command.ECHO:
    output = echo(...(args as any));
    break;
  case Command.HELP:
    output = help(...args as any);
    break;
  case Command.CD:
    output = await cd(...args as any);
    break;
  case Command.SU:
    output = await su(...args as any);
    break;
  case Command.LS:
    output = await ls(...args as any);
    break;
  case Command.USERADD:
    output = await useradd(...args as any);
    break;
  case Command.TOUCH:
    output = await touch(...args as any);
    break;
  case Command.MKDIR:
    output = await mkdir(...args as any);
    break;
  case Command.UMASK:
    output = await umask(...args as any);
    break;
  case Command.CP:
    output = await cp(...args as any);
    break;
  case Command.MV:
    output = await mv(...args as any);
    break;
  case Command.RM:
    output = await rm(...args as any);
    break;
  default:
    output = echo('echo', ' ', `Unknown command:\\u001b[31m ${args[0]}`);
    break;
  }
  return interpretAnsiEscapeColor(output);
}
